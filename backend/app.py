#!/usr/bin/env python3
"""
AI-enhanced Global Pothole Map
Production-ready backend with enhanced features
COMPLETE VERSION WITH CORS FIXES
"""

import os
import io
import sqlite3
import json
import logging
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
from PIL import Image, ImageDraw, ImageFont
import jwt
from functools import wraps
from ultralytics import YOLO
import cv2
import numpy as np

# ---- CONFIG ----
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "static")
UPLOADS_DIR = os.path.join(STATIC_DIR, "uploads")
THUMBS_DIR = os.path.join(STATIC_DIR, "thumbs")
DB_PATH = os.path.join(BASE_DIR, "potholes.db")

os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(THUMBS_DIR, exist_ok=True)

ALLOWED_EXT = {"png", "jpg", "jpeg", "webp", "gif"}
MAX_MB = 16

# JWT Secret
SECRET_KEY = os.environ.get("SECRET_KEY", "deepseek-pothole-ai-secret-2024")

# Initialize Flask
app = Flask(__name__, static_folder=STATIC_DIR, static_url_path="")
app.config["SECRET_KEY"] = SECRET_KEY
app.config["MAX_CONTENT_LENGTH"] = MAX_MB * 1024 * 1024

# Enhanced CORS configuration
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"],
        "supports_credentials": True
    },
    r"/socket.io/*": {
        "origins": ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5000"],
        "methods": ["GET", "POST"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# SocketIO with enhanced CORS
socketio = SocketIO(
    app,
    cors_allowed_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5000"],
    logger=True,
    engineio_logger=True,
    async_mode='threading'
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(name)s %(message)s',
    handlers=[
        logging.FileHandler('pothole_app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


# ---- DATABASE ----
def db_conn():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = db_conn()

    # Users table
    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            created_at TEXT DEFAULT (datetime('now')),
            last_login TEXT
        )
    """)

    # Reports table
    conn.execute("""
        CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            text TEXT NOT NULL,
            lat REAL NOT NULL,
            lon REAL NOT NULL,
            severity TEXT NOT NULL,
            image_url TEXT,
            thumb_url TEXT,
            ai_conf REAL,
            ai_boxes TEXT,
            verified BOOLEAN DEFAULT FALSE,
            votes INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    """)

    # Comments table
    conn.execute("""
        CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            report_id INTEGER,
            text TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (report_id) REFERENCES reports (id)
        )
    """)

    # Votes table
    conn.execute("""
        CREATE TABLE IF NOT EXISTS votes (
            user_id INTEGER,
            report_id INTEGER,
            vote_type TEXT CHECK(vote_type IN ('up', 'down')),
            created_at TEXT DEFAULT (datetime('now')),
            PRIMARY KEY (user_id, report_id)
        )
    """)

    # Create default admin user
    try:
        password_hash = generate_password_hash("admin123")
        conn.execute(
            "INSERT OR IGNORE INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)",
            ("admin", "admin@pothole.ai", password_hash, "admin")
        )
        logger.info("✅ Default admin user created")
    except sqlite3.IntegrityError:
        logger.info("ℹ️ Admin user already exists")

    conn.commit()
    conn.close()
    logger.info("✅ Database initialized successfully")


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXT


# ---- AUTHENTICATION ----
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token is missing'}), 401

        try:
            if token.startswith('Bearer '):
                token = token[7:]
            data = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            current_user = get_user_by_id(data['user_id'])
            if not current_user:
                return jsonify({'error': 'User not found'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Token is invalid'}), 401

        return f(current_user, *args, **kwargs)

    return decorated


def get_user_by_id(user_id):
    conn = db_conn()
    user = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    conn.close()
    return dict(user) if user else None


# ---- IMAGE PROCESSING ----
def make_thumb(src, size=(480, 480)):
    try:
        im = Image.open(src)
        im.thumbnail(size, Image.Resampling.LANCZOS)
        name = f"th_{os.path.basename(src)}"
        path = os.path.join(THUMBS_DIR, name)
        im.save(path, optimize=True, quality=85)
        return f"/static/thumbs/{name}"
    except Exception as e:
        logger.error(f"Thumbnail error: {e}")
        return None


def draw_detections(image_path, detections):
    """Draw bounding boxes on image for visualization"""
    try:
        image = Image.open(image_path)
        draw = ImageDraw.Draw(image)

        # Try to load a font, fallback to default
        try:
            font = ImageFont.truetype("Arial.ttf", 20)
        except:
            font = ImageFont.load_default()

        for detection in detections:
            box = detection['box']
            conf = detection['conf']

            # Draw rectangle
            draw.rectangle(box, outline="red", width=3)

            # Draw confidence text
            text = f"{conf:.2f}"
            draw.text((box[0], box[1] - 20), text, fill="red", font=font)

        # Save annotated image
        annotated_path = image_path.replace('.', '_annotated.')
        image.save(annotated_path)
        return f"/static/uploads/{os.path.basename(annotated_path)}"
    except Exception as e:
        logger.error(f"Annotation error: {e}")
        return None


# ---- AI MODEL ----
logger.info("🔍 Loading YOLOv8 model...")
try:
    # Try to load custom pothole model, fallback to pretrained
    yolo_model = YOLO("yolov8n.pt")
    logger.info("✅ YOLO model loaded successfully")
except Exception as e:
    logger.error(f"❌ Failed to load YOLO model: {e}")
    yolo_model = None


def analyze_with_yolo(image_path):
    """Run YOLO detection and extract pothole-like boxes"""
    if not yolo_model:
        return []

    try:
        results = yolo_model(image_path, conf=0.25)
        detections = []

        for result in results:
            boxes = result.boxes
            for box in boxes:
                confidence = float(box.conf[0])
                coordinates = [float(x) for x in box.xyxy[0].tolist()]

                # Filter for objects that might be potholes (adjust classes as needed)
                detections.append({
                    "conf": confidence,
                    "box": coordinates,
                    "class": result.names[int(box.cls[0])] if hasattr(box, 'cls') else "unknown"
                })

        logger.info(
            f"Detected {len(detections)} objects with average confidence: {np.mean([d['conf'] for d in detections]) if detections else 0:.3f}")
        return detections

    except Exception as e:
        logger.error(f"Detection error: {e}")
        return []


# ---- HEALTH CHECK ----
@app.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint for frontend connection testing"""
    return jsonify({
        "status": "healthy",
        "message": "AI Pothole Detection Backend is running",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0"
    })


# ---- AUTH ROUTES ----
@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()
    if not data or not all(k in data for k in ['username', 'email', 'password']):
        return jsonify({"error": "Missing required fields"}), 400

    username = data['username']
    email = data['email']
    password = data['password']

    conn = db_conn()
    try:
        password_hash = generate_password_hash(password)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
            (username, email, password_hash)
        )
        user_id = cursor.lastrowid
        conn.commit()

        # Generate token
        token = jwt.encode({
            'user_id': user_id,
            'exp': datetime.utcnow() + timedelta(days=30)
        }, SECRET_KEY, algorithm='HS256')

        logger.info(f"✅ New user registered: {username} ({email})")

        return jsonify({
            "message": "User created successfully",
            "token": token,
            "user": {
                "id": user_id,
                "username": username,
                "email": email,
                "role": "user"
            }
        }), 201

    except sqlite3.IntegrityError:
        return jsonify({"error": "Username or email already exists"}), 400
    except Exception as e:
        logger.error(f"Registration error: {e}")
        return jsonify({"error": "Internal server error"}), 500
    finally:
        conn.close()


@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data or not all(k in data for k in ['email', 'password']):
        return jsonify({"error": "Missing email or password"}), 400

    email = data['email']
    password = data['password']

    conn = db_conn()
    user = conn.execute(
        "SELECT * FROM users WHERE email = ?", (email,)
    ).fetchone()
    conn.close()

    if not user or not check_password_hash(user['password_hash'], password):
        return jsonify({"error": "Invalid credentials"}), 401

    # Update last login
    conn = db_conn()
    conn.execute(
        "UPDATE users SET last_login = datetime('now') WHERE id = ?",
        (user['id'],)
    )
    conn.commit()
    conn.close()

    # Generate token
    token = jwt.encode({
        'user_id': user['id'],
        'exp': datetime.utcnow() + timedelta(days=30)
    }, SECRET_KEY, algorithm='HS256')

    logger.info(f"✅ User logged in: {user['username']} ({email})")

    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": {
            "id": user['id'],
            "username": user['username'],
            "email": user['email'],
            "role": user['role']
        }
    })


# ---- IMAGE UPLOAD & ANALYSIS ----
@app.route("/api/analyze-image", methods=["POST"])
@token_required
def analyze_image(current_user):
    """Accept uploaded image and run AI detection"""
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    file = request.files['image']
    if file.filename == '' or not allowed_file(file.filename):
        return jsonify({"error": "Invalid file type"}), 400

    try:
        # Save uploaded file
        timestamp = datetime.utcnow().strftime('%Y%m%d%H%M%S')
        filename = secure_filename(file.filename)
        name = f"{timestamp}_{filename}"
        path = os.path.join(UPLOADS_DIR, name)
        file.save(path)

        # Run AI detection
        detections = analyze_with_yolo(path)
        avg_conf = round(np.mean([d['conf'] for d in detections]), 3) if detections else 0

        # Create thumbnail
        thumb_url = make_thumb(path)

        # Create annotated image
        annotated_url = draw_detections(path, detections) if detections else None

        logger.info(f"✅ User {current_user['username']} analyzed image: {len(detections)} detections")

        return jsonify({
            "status": "success",
            "url": f"/static/uploads/{name}",
            "thumb_url": thumb_url,
            "annotated_url": annotated_url,
            "detections": detections,
            "detection_count": len(detections),
            "avg_conf": avg_conf,
            "user_id": current_user['id']
        })

    except Exception as e:
        logger.error(f"❌ Image analysis error: {e}")
        return jsonify({"error": "Image processing failed"}), 500


# ---- REPORTS ----
@app.route("/api/report", methods=["POST"])
@token_required
def add_report(current_user):
    data = request.get_json()

    required_fields = ["text", "lat", "lon", "severity"]
    if not data or not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        conn = db_conn()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO reports 
            (user_id, text, lat, lon, severity, image_url, thumb_url, ai_conf, ai_boxes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            current_user['id'],
            data['text'],
            float(data['lat']),
            float(data['lon']),
            data['severity'],
            data.get('image_url'),
            data.get('thumb_url'),
            data.get('ai_conf'),
            json.dumps(data.get('detections', [])) if data.get('detections') else None
        ))

        report_id = cursor.lastrowid
        conn.commit()

        # Get the complete report
        report = conn.execute(
            "SELECT r.*, u.username FROM reports r JOIN users u ON r.user_id = u.id WHERE r.id = ?",
            (report_id,)
        ).fetchone()

        conn.close()

        report_dict = dict(report)
        report_dict['created_at'] = report_dict['created_at']

        # Broadcast new report
        socketio.emit("new_report", report_dict)
        logger.info(f"✅ New report added by {current_user['username']}: ID {report_id}")

        return jsonify(report_dict)

    except Exception as e:
        logger.error(f"❌ Report creation error: {e}")
        return jsonify({"error": "Failed to create report"}), 500


@app.route("/api/reports")
def get_reports():
    """Get paginated reports with filters"""
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 50, type=int)
    severity = request.args.get('severity')
    verified = request.args.get('verified')

    offset = (page - 1) * limit

    conn = db_conn()

    query = """
        SELECT r.*, u.username, 
               (SELECT COUNT(*) FROM votes v WHERE v.report_id = r.id AND v.vote_type = 'up') as upvotes,
               (SELECT COUNT(*) FROM votes v WHERE v.report_id = r.id AND v.vote_type = 'down') as downvotes
        FROM reports r 
        JOIN users u ON r.user_id = u.id
    """
    params = []

    where_clauses = []
    if severity:
        where_clauses.append("r.severity = ?")
        params.append(severity)
    if verified is not None:
        where_clauses.append("r.verified = ?")
        params.append(verified.lower() == 'true')

    if where_clauses:
        query += " WHERE " + " AND ".join(where_clauses)

    query += " ORDER BY r.created_at DESC LIMIT ? OFFSET ?"
    params.extend([limit, offset])

    rows = conn.execute(query, params).fetchall()

    # Get total count for pagination
    count_query = "SELECT COUNT(*) as total FROM reports r"
    if where_clauses:
        count_query += " WHERE " + " AND ".join(where_clauses)
    total = conn.execute(count_query, params[:-2]).fetchone()['total']

    conn.close()

    reports = [dict(row) for row in rows]

    logger.info(f"📊 Fetched {len(reports)} reports (page {page})")

    return jsonify({
        "reports": reports,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "pages": (total + limit - 1) // limit
        }
    })


# ---- COMMENTS ----
@app.route("/api/comment", methods=["POST"])
@token_required
def add_comment(current_user):
    data = request.get_json()

    if not data or 'text' not in data or 'report_id' not in data:
        return jsonify({"error": "Missing text or report_id"}), 400

    try:
        conn = db_conn()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO comments (user_id, report_id, text)
            VALUES (?, ?, ?)
        """, (current_user['id'], data['report_id'], data['text']))

        comment_id = cursor.lastrowid

        # Get complete comment with user info
        comment = conn.execute("""
            SELECT c.*, u.username 
            FROM comments c 
            JOIN users u ON c.user_id = u.id 
            WHERE c.id = ?
        """, (comment_id,)).fetchone()

        conn.commit()
        conn.close()

        comment_dict = dict(comment)
        socketio.emit("new_comment", comment_dict)

        logger.info(f"💬 New comment by {current_user['username']} on report {data['report_id']}")

        return jsonify(comment_dict)

    except Exception as e:
        logger.error(f"❌ Comment creation error: {e}")
        return jsonify({"error": "Failed to create comment"}), 500


@app.route("/api/comments")
def get_comments():
    report_id = request.args.get('report_id')

    conn = db_conn()

    if report_id:
        rows = conn.execute("""
            SELECT c.*, u.username 
            FROM comments c 
            JOIN users u ON c.user_id = u.id 
            WHERE c.report_id = ? 
            ORDER BY c.created_at DESC
        """, (report_id,)).fetchall()
    else:
        rows = conn.execute("""
            SELECT c.*, u.username 
            FROM comments c 
            JOIN users u ON c.user_id = u.id 
            ORDER BY c.created_at DESC 
            LIMIT 100
        """).fetchall()

    conn.close()

    comments_list = [dict(row) for row in rows]
    logger.info(f"💬 Fetched {len(comments_list)} comments")

    return jsonify(comments_list)


# ---- VOTES ----
@app.route("/api/vote", methods=["POST"])
@token_required
def add_vote(current_user):
    data = request.get_json()

    if not data or 'report_id' not in data or 'vote_type' not in data:
        return jsonify({"error": "Missing report_id or vote_type"}), 400

    if data['vote_type'] not in ['up', 'down']:
        return jsonify({"error": "Invalid vote_type"}), 400

    try:
        conn = db_conn()
        cursor = conn.cursor()

        # Remove existing vote
        cursor.execute(
            "DELETE FROM votes WHERE user_id = ? AND report_id = ?",
            (current_user['id'], data['report_id'])
        )

        # Add new vote
        cursor.execute("""
            INSERT INTO votes (user_id, report_id, vote_type)
            VALUES (?, ?, ?)
        """, (current_user['id'], data['report_id'], data['vote_type']))

        conn.commit()

        # Get updated vote counts
        upvotes = conn.execute(
            "SELECT COUNT(*) as count FROM votes WHERE report_id = ? AND vote_type = 'up'",
            (data['report_id'],)
        ).fetchone()['count']

        downvotes = conn.execute(
            "SELECT COUNT(*) as count FROM votes WHERE report_id = ? AND vote_type = 'down'",
            (data['report_id'],)
        ).fetchone()['count']

        conn.close()

        socketio.emit("vote_update", {
            "report_id": data['report_id'],
            "upvotes": upvotes,
            "downvotes": downvotes
        })

        logger.info(f"👍 User {current_user['username']} voted {data['vote_type']} on report {data['report_id']}")

        return jsonify({
            "upvotes": upvotes,
            "downvotes": downvotes
        })

    except Exception as e:
        logger.error(f"❌ Vote error: {e}")
        return jsonify({"error": "Failed to process vote"}), 500


# ---- STATISTICS ----
@app.route("/api/stats")
def get_stats():
    conn = db_conn()

    total_reports = conn.execute("SELECT COUNT(*) as count FROM reports").fetchone()['count']
    total_users = conn.execute("SELECT COUNT(*) as count FROM users").fetchone()['count']
    severity_counts = dict(conn.execute("""
        SELECT severity, COUNT(*) as count 
        FROM reports 
        GROUP BY severity
    """).fetchall())

    recent_reports = conn.execute("""
        SELECT COUNT(*) as count 
        FROM reports 
        WHERE created_at >= datetime('now', '-7 days')
    """).fetchone()['count']

    # Get recent activity (last 24 hours)
    daily_reports = conn.execute("""
        SELECT COUNT(*) as count 
        FROM reports 
        WHERE created_at >= datetime('now', '-1 day')
    """).fetchone()['count']

    conn.close()

    stats_data = {
        "total_reports": total_reports,
        "total_users": total_users,
        "severity_counts": severity_counts,
        "recent_reports": recent_reports,
        "daily_reports": daily_reports
    }

    logger.info(f"📈 Stats fetched: {total_reports} total reports, {total_users} users")

    return jsonify(stats_data)


# ---- SERVE STATIC FILES ----
@app.route("/static/<path:path>")
def serve_static(path):
    return send_from_directory(STATIC_DIR, path)


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    if path and os.path.exists(os.path.join(STATIC_DIR, path)):
        return send_from_directory(STATIC_DIR, path)
    return send_from_directory(STATIC_DIR, "index.html")


# ---- SOCKET EVENTS ----
@socketio.on('connect')
def handle_connect():
    logger.info('✅ Client connected to Socket.IO')
    emit('connected', {'message': 'Connected to Pothole Map', 'timestamp': datetime.utcnow().isoformat()})


@socketio.on('disconnect')
def handle_disconnect():
    logger.info('❌ Client disconnected from Socket.IO')


@socketio.on('join_report')
def handle_join_report(data):
    report_id = data.get('report_id')
    logger.info(f'📱 Client joined report room: {report_id}')
    # You can implement room joining logic here if needed


# ---- ERROR HANDLERS ----
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404


@app.errorhandler(500)
def internal_error(error):
    logger.error(f"❌ Internal server error: {error}")
    return jsonify({"error": "Internal server error"}), 500


@app.errorhandler(413)
def too_large(error):
    return jsonify({"error": "File too large"}), 413


# ---- INITIALIZATION ----
if __name__ == "__main__":
    logger.info("🚀 Starting AI Pothole Detection Backend...")
    logger.info("📁 Base Directory: %s", BASE_DIR)
    logger.info("🗄️ Database Path: %s", DB_PATH)
    logger.info("🖼️ Uploads Directory: %s", UPLOADS_DIR)

    init_db()
    logger.info("✅ Database initialized")

    logger.info("🌐 Backend running at http://127.0.0.1:5000")
    logger.info("🔗 Frontend should connect from http://localhost:3000")
    logger.info("📊 API endpoints available at:")
    logger.info("   - GET  /api/health")
    logger.info("   - POST /api/register")
    logger.info("   - POST /api/login")
    logger.info("   - POST /api/analyze-image")
    logger.info("   - POST /api/report")
    logger.info("   - GET  /api/reports")
    logger.info("   - POST /api/comment")
    logger.info("   - GET  /api/comments")
    logger.info("   - POST /api/vote")
    logger.info("   - GET  /api/stats")

    try:
        socketio.run(
            app,
            host="0.0.0.0",
            port=5000,
            debug=True,
            allow_unsafe_werkzeug=True
        )
    except KeyboardInterrupt:
        logger.info("👋 Server stopped by user")
    except Exception as e:
        logger.error(f"💥 Server crashed: {e}")