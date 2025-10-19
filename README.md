# 🕳️ AI Pothole Detection Community

A full-stack web application that uses artificial intelligence to detect and report potholes in communities. This project combines React frontend with Flask backend and YOLOv8 computer vision for automated pothole detection.

![AI Pothole Detection](https://img.shields.io/badge/AI-Pothole%20Detection-blue)
![React](https://img.shields.io/badge/React-18.2.0-61dafb)
![Flask](https://img.shields.io/badge/Flask-2.3.0-green)
![YOLOv8](https://img.shields.io/badge/YOLOv8-Object%20Detection-red)

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
- 🛠️ **RESTful API** - Complete CRUD operations for reports, comments, and users
- 🤖 **AI Integration** - YOLOv8 model for object detection in images
- ⚡ **Real-time Communication** - Socket.IO for live updates
- 🗄️ **Database** - SQLite with proper relationships and indexing
- 📁 **File Handling** - Image upload, thumbnail generation, and annotation
- 🔒 **Authentication** - JWT token-based security

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| ![React](https://img.shields.io/badge/React-18.2.0-61dafb) | Modern React with hooks |
| ![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3.0-7952b3) | Responsive UI framework |
| ![React Router](https://img.shields.io/badge/React_Router-6.8.0-ca4245) | Client-side routing |
| ![Axios](https://img.shields.io/badge/Axios-1.3.0-5a29e4) | HTTP client for API calls |
| ![Socket.IO](https://img.shields.io/badge/Socket.IO-4.6.0-010101) | Real-time communication |
| ![Leaflet](https://img.shields.io/badge/Leaflet-1.9.3-199900) | Interactive maps |
| ![Chart.js](https://img.shields.io/badge/Chart.js-4.2.0-ff6384) | Data visualization |

### Backend
| Technology | Purpose |
|------------|---------|
| ![Flask](https://img.shields.io/badge/Flask-2.3.0-000000) | Python web framework |
| ![YOLOv8](https://img.shields.io/badge/YOLOv8-Object_Detection-red) | Object detection model |
| ![SQLite](https://img.shields.io/badge/SQLite-Database-003b57) | Database management |
| ![JWT](https://img.shields.io/badge/JWT-Authentication-000000) | Secure authentication |

## 📁 Project Structure
ai-pothole-detection/
├── 🐍 backend/
│ ├── app.py # Main Flask application
│ ├── potholes.db # SQLite database
│ ├── static/
│ │ ├── uploads/ # Original uploaded images
│ │ └── thumbs/ # Generated thumbnails
│ └── requirements.txt # Python dependencies
├── ⚛️ frontend/
│ ├── public/
│ │ └── index.html # HTML template
│ ├── src/
│ │ ├── components/ # Reusable React components
│ │ ├── pages/ # Page components
│ │ ├── context/ # React context providers
│ │ ├── utils/ # Helper functions and API
│ │ ├── App.js # Main App component
│ │ └── index.js # React entry point
│ ├── package.json # Node.js dependencies
│ └── .env # Environment variables
└── 📚 README.md

text

## 🚀 Quick Start

### Prerequisites
- 🟢 Node.js 16+ and npm
- 🐍 Python 3.8+
- 🔧 Git

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
Create virtual environment (recommended):

bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
Install Python dependencies:

bash
pip install -r requirements.txt
Start the backend server:

bash
python app.py
✅ The backend will start on http://localhost:5000

Frontend Setup
Navigate to frontend directory:

bash
cd frontend
Install dependencies:

bash
npm install
Configure environment:
Create .env file:

env
REACT_APP_API_BASE_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
Start the development server:

bash
npm start
✅ The frontend will start on http://localhost:3000

🔌 API Endpoints
Method	Endpoint	Description	Auth Required
POST	/api/register	User registration	❌
POST	/api/login	User login	❌
GET	/api/reports	Get paginated reports	❌
POST	/api/report	Create new report	✅
POST	/api/analyze-image	AI image analysis	✅
GET	/api/comments	Get comments	❌
POST	/api/comment	Add comment	✅
POST	/api/vote	Vote on reports	✅
GET	/api/stats	Community statistics	❌
GET	/api/health	Health check	❌
🔌 Socket.IO Events
📢 new_report - New report created

💬 new_comment - New comment added

👍 vote_update - Vote counts updated

🗃️ Database Schema
👥 Users Table
Column	Type	Description
id	INTEGER	Primary key
username	TEXT	Unique username
email	TEXT	Unique email
password_hash	TEXT	Hashed password
role	TEXT	User role (user/admin)
created_at	TEXT	Account creation timestamp
📋 Reports Table
Column	Type	Description
id	INTEGER	Primary key
user_id	INTEGER	Foreign key to users
text	TEXT	Report description
lat/lon	REAL	GPS coordinates
severity	TEXT	Pothole severity level
image_url	TEXT	Original image path
ai_conf	REAL	AI confidence score
💬 Comments Table
Column	Type	Description
id	INTEGER	Primary key
user_id	INTEGER	Foreign key to users
report_id	INTEGER	Foreign key to reports
text	TEXT	Comment content
created_at	TEXT	Comment timestamp
🎯 Usage Guide
👤 For Community Members
🔐 Register/Login - Create an account to participate

📸 Report Potholes - Use the image upload feature with AI analysis

🗺️ Interactive Map - View and explore reported potholes

👥 Community Engagement - Vote and comment on reports

📊 Dashboard - View community statistics and trends

👨‍💼 For Administrators
👥 User Management - Monitor user activity

✅ Report Verification - Verify and manage pothole reports

📈 Analytics - Access detailed statistics and insights

🖥️ System Monitoring - Monitor AI performance and system health

🔒 Security Features
🔑 JWT token-based authentication

🛡️ Password hashing with Werkzeug

🌐 CORS protection

📁 File type validation

🛡️ SQL injection prevention

🧹 Input sanitization

🚀 Deployment
Backend Deployment
bash
# Production with Gunicorn
gunicorn -k eventlet -w 1 -b 0.0.0.0:5000 app:app
Frontend Deployment
bash
# Build for production
npm run build

# Serve with static server
npm install -g serve
serve -s build
🤝 Contributing
We welcome contributions! Please follow these steps:

🍴 Fork the repository

🌿 Create a feature branch (git checkout -b feature/amazing-feature)

💾 Commit your changes (git commit -m 'Add amazing feature')

📤 Push to the branch (git push origin feature/amazing-feature)

🔀 Open a Pull Request

📝 License
This project is licensed under the MIT License - see the LICENSE file for details.

🙏 Acknowledgments
🎯 YOLOv8 by Ultralytics for object detection

🗺️ OpenStreetMap for map data

🎨 Bootstrap for UI components

⚛️ React community for excellent documentation

📞 Support
For support and questions:

🐛 Create an issue in the GitHub repository

📖 Check the documentation in the /docs folder

🔍 Review the API endpoints in the backend code

🗺️ Roadmap
📱 Mobile app development

🤖 Advanced AI model training

🏛️ Government integration APIs

🌍 Multi-language support

📈 Advanced analytics

🔔 Push notifications

🎯 Batch image processing

🎨 Screenshots
🔐 Authentication
text
┌─────────────────────────────────┐
│        🕳️ AI Pothole Detection   │
│                                 │
│   [Email: ______________]       │
│   [Password: ___________]       │
│                                 │
│       [ Login ] [ Register ]    │
└─────────────────────────────────┘
🗺️ Main Dashboard
text
┌─────────────────────────────────────────────────────┐
│ Navbar: 🕳️ AI Pothole Detection │ Map │ Reports │ User│
├───────────────┬─────────────────────────────────────┤
│               │                                     │
│   📊 Stats    │         🗺️ Interactive Map          │
│   • Reports   │         [📍 Pothole Markers]        │
│   • Users     │                                     │
│   • Activity  │                                     │
│               │                                     │
│   📸 Upload   │        📋 Recent Reports            │
│   [Drag&Drop] │        ┌─────────────────────┐      │
│               │        │ 🚧 High Severity    │      │
│   🤖 AI Analysis│      │ 📍 Location         │      │
│   [Results]   │        │ 👍 15 👎 2          │      │
│               │        └─────────────────────┘      │
└───────────────┴─────────────────────────────────────┘
📊 Analytics Dashboard
text
┌─────────────────────────────────────────────────────┐
│                📈 Analytics Dashboard                │
├───────────────────┬─────────────────────────────────┤
│ ┌───────────────┐ │ ┌─────────────────────────────┐ │
│ │    Reports    │ │ │    Severity Distribution    │ │
│ │    ████████   │ │ │   Low ████ 40%              │ │
│ │    ████████ 85│ │ │   Medium █████ 50%          │ │
│ └───────────────┘ │ │   High █ 10%                │ │
│                   │ └─────────────────────────────┘ │
│ ┌───────────────┐ │                                 │
│ │ Active Users  │ │ ┌─────────────────────────────┐ │
│ │    ██████     │ │ │      Recent Activity        │ │
│ │    ██████ 42  │ │ │  📈 Reports this week: 15   │ │
│ └───────────────┘ │ │  👥 New users: 8            │ │
│                   │ │  💬 Comments: 23            │ │
│ ┌───────────────┐ │ └─────────────────────────────┘ │
│ │ AI Confidence │ │                                 │
│ │    ████████   │ │ ┌─────────────────────────────┐ │
│ │    █████ 78%  │ │ │    Top Report Locations     │ │
│ └───────────────┘ │ │  • Downtown: 12 reports     │ │
│                   │ │  • Suburbs: 8 reports       │ │
│                   │ │  • Highway: 5 reports       │ │
│                   │ └─────────────────────────────┘ │
└───────────────────┴─────────────────────────────────┘
📊 Project Status
https://img.shields.io/badge/Completion-95%2525-brightgreen
https://img.shields.io/badge/Backend-%E2%9C%85_Ready-success
https://img.shields.io/badge/Frontend-%E2%9C%85_Ready-success
https://img.shields.io/badge/AI_Model-%E2%9C%85_YOLOv8-success

<div align="center">
⭐ Don't forget to star this repo if you find it useful! ⭐
Built with ❤️ for safer communities and better roads 🛣️

</div> ```