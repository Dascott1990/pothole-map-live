#!/usr/bin/env python3
"""
Debugging Dashboard for AI Pothole Detection Backend
"""

import os
import sqlite3
import json
import logging
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS
import threading
import psutil
import time

# Dashboard configuration
DASHBOARD_PORT = 5001
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "potholes.db")

app = Flask(__name__)
CORS(app)

# Dashboard HTML template
DASHBOARD_HTML = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pothole Backend Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
        }
        .header {
            background: rgba(255,255,255,0.95);
            padding: 20px;
            border-radius: 15px;
            margin-bottom: 20px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        }
        .header h1 {
            color: #333;
            margin-bottom: 10px;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }
        .stat-card {
            background: rgba(255,255,255,0.95);
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.1);
            text-align: center;
        }
        .stat-number {
            font-size: 2.5em;
            font-weight: bold;
            color: #667eea;
        }
        .stat-label {
            color: #666;
            font-size: 0.9em;
            margin-top: 5px;
        }
        .charts-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
        }
        .chart-container {
            background: rgba(255,255,255,0.95);
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.1);
        }
        .data-section {
            background: rgba(255,255,255,0.95);
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #eee;
        }
        th {
            background: #f8f9fa;
            font-weight: 600;
        }
        tr:hover {
            background: #f8f9fa;
        }
        .status-badge {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.8em;
            font-weight: bold;
        }
        .status-active { background: #d4edda; color: #155724; }
        .status-inactive { background: #f8d7da; color: #721c24; }
        .btn {
            padding: 8px 16px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
            margin: 2px;
        }
        .btn-primary { background: #007bff; color: white; }
        .btn-danger { background: #dc3545; color: white; }
        .btn-success { background: #28a745; color: white; }
        .log-entry {
            padding: 8px;
            border-left: 4px solid #007bff;
            margin: 4px 0;
            background: #f8f9fa;
        }
        .log-error { border-left-color: #dc3545; }
        .log-warning { border-left-color: #ffc107; }
        .refresh-btn {
            background: #28a745;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚧 Pothole Detection Backend Dashboard</h1>
            <p>Real-time monitoring and debugging interface</p>
            <button class="refresh-btn" onclick="location.reload()">🔄 Refresh Data</button>
        </div>

        <!-- System Stats -->
        <div class="stats-grid" id="systemStats">
            <div class="stat-card">
                <div class="stat-number" id="cpuUsage">--%</div>
                <div class="stat-label">CPU Usage</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="memoryUsage">--%</div>
                <div class="stat-label">Memory Usage</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="totalReports">0</div>
                <div class="stat-label">Total Reports</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="totalUsers">0</div>
                <div class="stat-label">Total Users</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="activeConnections">0</div>
                <div class="stat-label">Active Connections</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="detectionAccuracy">--%</div>
                <div class="stat-label">Avg Detection Confidence</div>
            </div>
        </div>

        <!-- Charts -->
        <div class="charts-grid">
            <div class="chart-container">
                <h3>Reports by Severity</h3>
                <canvas id="severityChart"></canvas>
            </div>
            <div class="chart-container">
                <h3>Daily Activity</h3>
                <canvas id="activityChart"></canvas>
            </div>
        </div>

        <!-- Recent Reports -->
        <div class="data-section">
            <h3>📊 Recent Reports (Last 10)</h3>
            <div id="recentReports">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>User</th>
                            <th>Location</th>
                            <th>Severity</th>
                            <th>AI Confidence</th>
                            <th>Verified</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody id="reportsTableBody">
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Recent Users -->
        <div class="data-section">
            <h3>👥 Recent Users</h3>
            <div id="recentUsers">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Last Login</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="usersTableBody">
                    </tbody>
                </table>
            </div>
        </div>

        <!-- System Logs -->
        <div class="data-section">
            <h3>📋 Recent Logs</h3>
            <div id="recentLogs">
                <!-- Logs will be populated here -->
            </div>
        </div>

        <!-- Database Operations -->
        <div class="data-section">
            <h3>🗄️ Database Operations</h3>
            <button class="btn btn-primary" onclick="refreshDatabase()">Refresh Stats</button>
            <button class="btn btn-danger" onclick="clearOldData()">Clear Old Data (30+ days)</button>
            <button class="btn btn-success" onclick="exportData()">Export Data</button>
        </div>
    </div>

    <script>
        // Initialize charts
        const severityCtx = document.getElementById('severityChart').getContext('2d');
        const activityCtx = document.getElementById('activityChart').getContext('2d');

        const severityChart = new Chart(severityCtx, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
                }]
            }
        });

        const activityChart = new Chart(activityCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Reports per Day',
                    data: [],
                    borderColor: '#667eea',
                    tension: 0.1
                }]
            }
        });

        // Load dashboard data
        async function loadDashboardData() {
            try {
                const response = await fetch('/api/dashboard/stats');
                const data = await response.json();

                // Update system stats
                document.getElementById('cpuUsage').textContent = data.system_stats.cpu_percent + '%';
                document.getElementById('memoryUsage').textContent = data.system_stats.memory_percent + '%';
                document.getElementById('totalReports').textContent = data.database_stats.total_reports;
                document.getElementById('totalUsers').textContent = data.database_stats.total_users;
                document.getElementById('activeConnections').textContent = data.system_stats.active_connections;
                document.getElementById('detectionAccuracy').textContent = data.database_stats.avg_confidence + '%';

                // Update charts
                severityChart.data.labels = Object.keys(data.severity_data);
                severityChart.data.datasets[0].data = Object.values(data.severity_data);
                severityChart.update();

                activityChart.data.labels = data.activity_data.labels;
                activityChart.data.datasets[0].data = data.activity_data.values;
                activityChart.update();

                // Update recent reports
                updateReportsTable(data.recent_reports);

                // Update recent users
                updateUsersTable(data.recent_users);

                // Update logs
                updateLogs(data.recent_logs);

            } catch (error) {
                console.error('Error loading dashboard data:', error);
            }
        }

        function updateReportsTable(reports) {
            const tbody = document.getElementById('reportsTableBody');
            tbody.innerHTML = reports.map(report => `
                <tr>
                    <td>${report.id}</td>
                    <td>${report.username}</td>
                    <td>${report.lat.toFixed(4)}, ${report.lon.toFixed(4)}</td>
                    <td>${report.severity}</td>
                    <td>${report.ai_conf ? (report.ai_conf * 100).toFixed(1) + '%' : 'N/A'}</td>
                    <td><span class="status-badge ${report.verified ? 'status-active' : 'status-inactive'}">
                        ${report.verified ? 'Yes' : 'No'}
                    </span></td>
                    <td>${new Date(report.created_at).toLocaleDateString()}</td>
                </tr>
            `).join('');
        }

        function updateUsersTable(users) {
            const tbody = document.getElementById('usersTableBody');
            tbody.innerHTML = users.map(user => `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.username}</td>
                    <td>${user.email}</td>
                    <td>${user.role}</td>
                    <td>${user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}</td>
                    <td>
                        <button class="btn btn-primary" onclick="viewUser(${user.id})">View</button>
                    </td>
                </tr>
            `).join('');
        }

        function updateLogs(logs) {
            const container = document.getElementById('recentLogs');
            container.innerHTML = logs.map(log => `
                <div class="log-entry ${log.level.toLowerCase() === 'error' ? 'log-error' : 
                                      log.level.toLowerCase() === 'warning' ? 'log-warning' : ''}">
                    <strong>[${log.level}]</strong> ${log.message} 
                    <small>${new Date(log.timestamp).toLocaleString()}</small>
                </div>
            `).join('');
        }

        // Database operations
        async function refreshDatabase() {
            await fetch('/api/dashboard/refresh', { method: 'POST' });
            loadDashboardData();
        }

        async function clearOldData() {
            if (confirm('Are you sure you want to clear data older than 30 days?')) {
                await fetch('/api/dashboard/clear-old-data', { method: 'POST' });
                loadDashboardData();
            }
        }

        async function exportData() {
            const response = await fetch('/api/dashboard/export');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `pothole-data-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
        }

        function viewUser(userId) {
            alert(`View details for user ${userId} - This would open a user detail modal in a full implementation.`);
        }

        // Auto-refresh every 30 seconds
        setInterval(loadDashboardData, 30000);

        // Initial load
        loadDashboardData();
    </script>
</body>
</html>
"""


def db_conn():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def get_system_stats():
    """Get system performance statistics"""
    return {
        'cpu_percent': round(psutil.cpu_percent(), 1),
        'memory_percent': round(psutil.virtual_memory().percent, 1),
        'disk_usage': round(psutil.disk_usage('/').percent, 1),
        'active_connections': len(psutil.net_connections()),
        'timestamp': datetime.utcnow().isoformat()
    }


def get_database_stats():
    """Get comprehensive database statistics"""
    conn = db_conn()

    stats = {}

    # Basic counts
    stats['total_reports'] = conn.execute("SELECT COUNT(*) FROM reports").fetchone()[0]
    stats['total_users'] = conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
    stats['total_comments'] = conn.execute("SELECT COUNT(*) FROM comments").fetchone()[0]
    stats['total_votes'] = conn.execute("SELECT COUNT(*) FROM votes").fetchone()[0]

    # AI detection stats
    result = conn.execute("SELECT AVG(ai_conf) FROM reports WHERE ai_conf IS NOT NULL").fetchone()
    stats['avg_confidence'] = round((result[0] or 0) * 100, 1)

    # Recent activity
    stats['reports_today'] = conn.execute(
        "SELECT COUNT(*) FROM reports WHERE created_at >= datetime('now', '-1 day')"
    ).fetchone()[0]

    stats['new_users_today'] = conn.execute(
        "SELECT COUNT(*) FROM users WHERE created_at >= datetime('now', '-1 day')"
    ).fetchone()[0]

    conn.close()
    return stats


def get_severity_data():
    """Get reports grouped by severity"""
    conn = db_conn()
    result = conn.execute(
        "SELECT severity, COUNT(*) as count FROM reports GROUP BY severity"
    ).fetchall()
    conn.close()
    return {row['severity']: row['count'] for row in result}


def get_activity_data():
    """Get activity data for the last 7 days"""
    conn = db_conn()

    dates = []
    counts = []

    for i in range(7):
        date = (datetime.now() - timedelta(days=6 - i)).strftime('%Y-%m-%d')
        count = conn.execute(
            "SELECT COUNT(*) FROM reports WHERE DATE(created_at) = ?", (date,)
        ).fetchone()[0]
        dates.append(date)
        counts.append(count)

    conn.close()
    return {'labels': dates, 'values': counts}


def get_recent_reports(limit=10):
    """Get recent reports with user info"""
    conn = db_conn()
    reports = conn.execute("""
        SELECT r.*, u.username 
        FROM reports r 
        JOIN users u ON r.user_id = u.id 
        ORDER BY r.created_at DESC 
        LIMIT ?
    """, (limit,)).fetchall()
    conn.close()
    return [dict(report) for report in reports]


def get_recent_users(limit=10):
    """Get recent users"""
    conn = db_conn()
    users = conn.execute(
        "SELECT * FROM users ORDER BY created_at DESC LIMIT ?",
        (limit,)
    ).fetchall()
    conn.close()
    return [dict(user) for user in users]


def get_recent_logs(limit=20):
    """Get recent logs from the application log file"""
    logs = []
    log_file = 'pothole_app.log'

    if os.path.exists(log_file):
        with open(log_file, 'r') as f:
            lines = f.readlines()[-limit:]
            for line in lines:
                try:
                    parts = line.strip().split(' ', 3)
                    if len(parts) >= 4:
                        logs.append({
                            'timestamp': ' '.join(parts[:2]),
                            'level': parts[2],
                            'message': parts[3]
                        })
                except:
                    continue

    return logs[-limit:]


# Dashboard API Routes
@app.route('/')
def dashboard():
    return render_template_string(DASHBOARD_HTML)


@app.route('/api/dashboard/stats')
def dashboard_stats():
    """Comprehensive dashboard statistics"""
    return jsonify({
        'system_stats': get_system_stats(),
        'database_stats': get_database_stats(),
        'severity_data': get_severity_data(),
        'activity_data': get_activity_data(),
        'recent_reports': get_recent_reports(),
        'recent_users': get_recent_users(),
        'recent_logs': get_recent_logs()
    })


@app.route('/api/dashboard/refresh', methods=['POST'])
def refresh_data():
    """Force refresh of dashboard data"""
    return jsonify({'status': 'success', 'message': 'Data refreshed successfully'})


@app.route('/api/dashboard/clear-old-data', methods=['POST'])
def clear_old_data():
    """Clear data older than 30 days"""
    conn = db_conn()

    # Clear old reports, comments, and votes
    conn.execute("DELETE FROM reports WHERE created_at < datetime('now', '-30 days')")
    conn.execute("DELETE FROM comments WHERE created_at < datetime('now', '-30 days')")
    conn.execute("DELETE FROM votes WHERE created_at < datetime('now', '-30 days')")

    conn.commit()
    conn.close()

    return jsonify({'status': 'success', 'message': 'Old data cleared successfully'})


@app.route('/api/dashboard/export')
def export_data():
    """Export database data as JSON"""
    conn = db_conn()

    data = {
        'exported_at': datetime.utcnow().isoformat(),
        'reports': [dict(row) for row in conn.execute("SELECT * FROM reports").fetchall()],
        'users': [dict(row) for row in
                  conn.execute("SELECT id, username, email, role, created_at FROM users").fetchall()],
        'comments': [dict(row) for row in conn.execute("SELECT * FROM comments").fetchall()],
        'votes': [dict(row) for row in conn.execute("SELECT * FROM votes").fetchall()]
    }

    conn.close()

    return jsonify(data)


@app.route('/api/dashboard/query', methods=['POST'])
def execute_query():
    """Execute custom SQL query (for debugging)"""
    data = request.get_json()
    query = data.get('query', '').strip()

    # Basic security check
    if not query or any(keyword in query.upper() for keyword in ['DROP', 'DELETE', 'UPDATE', 'INSERT']):
        return jsonify({'error': 'Query not allowed'}), 400

    try:
        conn = db_conn()
        result = conn.execute(query).fetchall()
        conn.close()

        return jsonify({
            'columns': list(result[0].keys()) if result else [],
            'data': [dict(row) for row in result]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400


if __name__ == '__main__':
    print(f"🚀 Starting Pothole Backend Dashboard on http://127.0.0.1:{DASHBOARD_PORT}")
    print("📊 Access the dashboard at: http://localhost:5001")
    print("🔧 This dashboard provides real-time monitoring and debugging capabilities")

    app.run(
        host='0.0.0.0',
        port=DASHBOARD_PORT,
        debug=True,
        use_reloader=False
    )