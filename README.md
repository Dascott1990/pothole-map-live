# 🚧 AI-Powered Pothole Detection System

<div align="center">

![Pothole Detection](https://img.shields.io/badge/🚧-Pothole%20Detection-orange)
![AI Powered](https://img.shields.io/badge/🤖-AI%20Powered-blue)
![Python](https://img.shields.io/badge/Python-3.8%2B-green)
![Flask](https://img.shields.io/badge/Flask-Backend-lightgrey)
![React](https://img.shields.io/badge/React-Frontend-61dafb)

*A comprehensive AI-powered system for detecting and mapping potholes using computer vision*

</div>

## 📋 Table of Contents

- [🌟 Features](#-features)
- [🚀 Quick Start](#-quick-start)
- [⚙️ Installation](#️-installation)
- [🎯 Usage](#-usage)
- [🏗️ Project Structure](#️-project-structure)
- [🔧 API Endpoints](#-api-endpoints)
- [📱 Dashboard Features](#-dashboard-features)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

## 🌟 Features

### 🔬 AI & Computer Vision
- **YOLOv8 Integration** - Real-time pothole detection  
- **Image Analysis** - Automated pothole identification  
- **Confidence Scoring** - AI confidence level for each detection  
- **Bounding Box Visualization** - Annotated images with detection boxes  

### 🌍 Global Mapping
- **Interactive Maps** - Visual pothole distribution  
- **GPS Integration** - Precise location tracking  
- **Severity Classification** - Low, Medium, High impact levels  
- **Real-time Updates** - Live map updates via WebSocket  

### 👥 User Management
- **Role-based Access** - Admin, Moderator, and User roles  
- **Secure Authentication** - JWT token-based security  
- **User Profiles** - Personalized user experiences  
- **Activity Tracking** - User contribution monitoring  

### 📊 Analytics & Reporting
- **Live Statistics** - Real-time system metrics  
- **Trend Analysis** - Pothole occurrence patterns  
- **Export Capabilities** - Data export in multiple formats  
- **Admin Dashboard** - Comprehensive management interface  

## 🚀 Quick Start

### Prerequisites
- Python 3.8+  
- Node.js 16+  
- SQLite Database  

### One-Command Installation
```bash
# Clone and setup the project
git clone https://github.com/your-username/pothole-detection.git
cd pothole-detection

# Run automated setup script
./setup.sh
```

## ⚙️ Installation

### Backend Setup
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Initialize database
python init_db.py

# Start backend server
python app.py
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

## 🎯 Usage

### Starting the System
```bash
# Terminal 1 - Backend (Port 5000)
python app.py

# Terminal 2 - Frontend (Port 3000)
cd frontend && npm start

# Terminal 3 - Dashboard (Port 5001)
python dashboard.py
```

### Access Points
- Main Application: http://localhost:3000  
- Backend API: http://localhost:5000  
- Admin Dashboard: http://localhost:5001  
- API Documentation: http://localhost:5000/api/docs  

**Default Admin Credentials**
```
Username: admin  
Password: admin123
```

## 🏗️ Project Structure
```
pothole-detection/
├── 📁 backend/
│   ├── app.py                 # Main Flask application
│   ├── dashboard.py           # Admin dashboard
│   ├── requirements.txt       # Python dependencies
│   ├── potholes.db            # SQLite database
│   └── 📁 static/
│       ├── uploads/           # User uploaded images
│       └── thumbs/            # Image thumbnails
├── 📁 frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/             # Application pages
│   │   └── utils/             # Utility functions
│   └── package.json
├── 📁 docs/                   # Documentation
└── README.md
```

## 🔧 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|-----------|-------------|
| POST | /api/register | User registration |
| POST | /api/login | User authentication |
| GET | /api/profile | Get user profile |

### Pothole Reports
| Method | Endpoint | Description |
|--------|-----------|-------------|
| POST | /api/report | Submit new pothole report |
| GET | /api/reports | Get paginated reports |
| GET | /api/reports/{id} | Get specific report |
| PUT | /api/reports/{id} | Update report |

### AI Analysis
| Method | Endpoint | Description |
|--------|-----------|-------------|
| POST | /api/analyze-image | AI image analysis |
| GET | /api/detection-stats | Detection statistics |

### System Management
| Method | Endpoint | Description |
|--------|-----------|-------------|
| GET | /api/stats | System statistics |
| GET | /api/health | Health check |
| GET | /api/users | User management |

## 📱 Dashboard Features

### 🎛️ Real-time Monitoring
- System Health - CPU, Memory, Disk usage  
- Live Statistics - Reports, Users, AI accuracy  
- Activity Feed - Recent system activities  
- Performance Metrics - Response times, uptime  

### 📈 Data Visualization
- Interactive Charts - Severity distribution  
- Geographic Heatmaps - Pothole density maps  
- Trend Analysis - Time-based patterns  
- User Analytics - Contribution metrics  

### ⚙️ Administration
- User Management - Role assignments, activity tracking  
- Content Moderation - Report verification, flag handling  
- System Configuration - Settings management  
- Database Operations - Backup, cleanup, exports  

### 🔒 Security Features
- JWT Authentication - Secure token-based auth  
- Role-based Access Control - Granular permissions  
- Input Validation - SQL injection prevention  
- CORS Configuration - Cross-origin security  

## 🛠️ Development

## 📺️ Screenshots
![Screenshot.PNG](Screenshot.PNG)
![sreenshots.png](sreenshots.png)


### Running Tests
```bash
# Backend tests
python -m pytest tests/

# Frontend tests
cd frontend && npm test

# E2E tests
npm run test:e2e
```

### Building for Production
```bash
# Build frontend
cd frontend && npm run build

# Start production server
python app.py --production
```

### Environment Variables
```bash
# Backend .env
SECRET_KEY=your-secret-key
DATABASE_URL=sqlite:///potholes.db
UPLOAD_FOLDER=static/uploads
MAX_CONTENT_LENGTH=16777216

# Frontend .env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_MAP_API_KEY=your-map-api-key
```

## 🤝 Contributing

We welcome contributions! Please see our **Contributing Guide** for details.

### Development Workflow
1. Fork the repository  
2. Create a feature branch (`git checkout -b feature/amazing-feature`)  
3. Commit your changes (`git commit -m 'Add amazing feature'`)  
4. Push to the branch (`git push origin feature/amazing-feature`)  
5. Open a Pull Request  

### Code Standards
- Follow **PEP 8** for Python code  
- Use **ESLint** for JavaScript/React  
- Write comprehensive tests  
- Update documentation accordingly  

## 📄 License
This project is licensed under the **MIT License** - see the LICENSE file for details.

## 🔗 Links
- **Live Demo:** Coming Soon  
- **API Documentation:** /api/docs  
- **Issue Tracker:** [GitHub Issues]  
- **Releases:** [GitHub Releases]  

## 🙏 Acknowledgments
- **YOLOv8** by Ultralytics for object detection  
- **Flask** community for backend framework  
- **React** team for frontend framework  
- **OpenStreetMap** for mapping data  

<div align="center">
Built with ❤️ for safer roads worldwide  

If you find this project helpful, please give it a ⭐!
</div>
