# 🕳️ AI Pothole Detection Community

A full-stack web application that uses artificial intelligence to detect and report potholes in communities. This project combines React frontend with Flask backend and YOLOv8 computer vision for automated pothole detection.

![AI Pothole Detection](https://img.shields.io/badge/AI-Pothole%20Detection-blue)
![React](https://img.shields.io/badge/React-18.2.0-61dafb)
![Flask](https://img.shields.io/badge/Flask-2.3.0-green)
![YOLOv8](https://img.shields.io/badge/YOLOv8-Object%20Detection-red)

---

## 🚀 Features

### 🎯 Frontend (React)
- 🔐 **User Authentication** - JWT-based login/register system  
- 🤖 **AI Image Analysis** - Upload images for automatic pothole detection using YOLOv8  
- 🗺️ **Interactive Map** - Leaflet-based map with real-time pothole reporting  
- ⚡ **Real-time Updates** - Socket.IO for live comments and voting  
- 📊 **Analytics Dashboard** - Charts and statistics for pothole data  
- 📱 **Responsive Design** - Bootstrap-powered mobile-first interface  
- 👥 **Community Features** - Voting, commenting, and report verification  

### 🔧 Backend (Flask)
- 🛠️ **RESTful API** - CRUD operations for reports, comments, and users  
- 🤖 **AI Integration** - YOLOv8 for object detection  
- ⚡ **Socket.IO** - Real-time updates  
- 🗄️ **SQLite Database** - Efficient and lightweight  
- 📁 **File Handling** - Uploads, thumbnails, and annotations  
- 🔒 **JWT Authentication** - Secure access  

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|----------|
| React | UI Framework |
| Bootstrap | Responsive Styling |
| React Router | Navigation |
| Axios | API Calls |
| Socket.IO | Real-Time Communication |
| Leaflet | Map Visualization |
| Chart.js | Data Visualization |

### Backend
| Technology | Purpose |
|------------|----------|
| Flask | Web Framework |
| YOLOv8 | AI Object Detection |
| SQLite | Database |
| JWT | Authentication |

---

## 📁 Project Structure

ai-pothole-detection/
├── backend/
│ ├── app.py
│ ├── potholes.db
│ ├── static/
│ │ ├── uploads/
│ │ └── thumbs/
│ └── requirements.txt
├── frontend/
│ ├── public/
│ │ └── index.html
│ ├── src/
│ │ ├── components/
│ │ ├── pages/
│ │ ├── context/
│ │ ├── utils/
│ │ ├── App.js
│ │ └── index.js
│ ├── package.json
│ └── .env
└── README.md


---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Python 3.8+
- Git

---

### 🧠 Terminal Commands (Full Setup)

#### 1️⃣ Clone and Setup
```bash
git clone https://github.com/your-username/ai-pothole-detection.git
cd ai-pothole-detection

2️⃣ Backend Setup
cd backend
python -m venv venv
source venv/bin/activate    # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py


✅ Runs at: http://localhost:5000

3️⃣ Frontend Setup
cd ../frontend
npx create-react-app ./
npm install axios bootstrap react-router-dom socket.io-client leaflet chart.js react-chartjs-2
touch .env


Paste in .env:

REACT_APP_API_BASE_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000


Start:

npm start


✅ Runs at: http://localhost:3000

🔌 API Endpoints
Method	Endpoint	Description	Auth
POST	/api/register	Register new user	❌
POST	/api/login	Login	❌
GET	/api/reports	Get all reports	❌
POST	/api/report	Create new report	✅
POST	/api/analyze-image	Analyze image	✅
GET	/api/comments	Fetch comments	❌
POST	/api/comment	Add comment	✅
POST	/api/vote	Vote	✅
GET	/api/stats	Stats	❌
🗃️ Database Schema
👥 Users
Column	Type	Description
id	INTEGER	Primary key
username	TEXT	Unique
email	TEXT	Unique
password_hash	TEXT	Hashed
role	TEXT	user/admin
created_at	TEXT	Timestamp
📋 Reports
Column	Type	Description
id	INTEGER	Primary key
user_id	INTEGER	FK users
text	TEXT	Description
lat/lon	REAL	Coordinates
severity	TEXT	Level
image_url	TEXT	File path
ai_conf	REAL	AI confidence
🎯 Usage
👤 Users

Register/Login

Upload pothole images

See map reports

Comment, vote, view analytics

👨‍💼 Admin

Manage users

Verify reports

Monitor AI analytics

🔒 Security

JWT Authentication

Password Hashing

SQL Injection Prevention

Input Validation

CORS Enabled

🚀 Deployment
Backend
gunicorn -k eventlet -w 1 -b 0.0.0.0:5000 app:app

Frontend
npm run build
npm install -g serve
serve -s build

🤝 Contributing

Fork

Create a branch

Commit changes

Push & open PR

📝 License

MIT License

🙏 Acknowledgments

YOLOv8 by Ultralytics

OpenStreetMap

Bootstrap

React community

🗺️ Roadmap

📱 Mobile App

🤖 Model Retraining

🏛️ Gov Integration

🌍 Multi-language

📈 Advanced Analytics

🔔 Notifications

🎨 Screenshots
🔐 Authentication
┌──────────────────────────────┐
│ 🕳️ AI Pothole Detection      │
│ Email: [___________]         │
│ Password: [_________]        │
│ [ Login ] [ Register ]       │
└──────────────────────────────┘

🗺️ Dashboard
┌────────────────────────────────────────────┐
│ Navbar: Home | Map | Reports | Dashboard   │
├──────────────┬──────────────────────────────┤
│ 📊 Stats     │ 🗺️ Map + Reports            │
│ 📸 Upload    │ [Pothole Markers]           │
│ 🤖 AI Result │ 👍 Votes 👎 Reports          │
└──────────────┴──────────────────────────────┘

📊 Status








<div align="center">

⭐ Built with ❤️ for safer communities and better roads 🛣️
© 2025 AI Pothole Detection Community

</div> ```