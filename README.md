# AI Pothole Detection Community

**AI Pothole Detection Community** is a production-ready backend for detecting, reporting, and managing potholes using AI (YOLOv8). It supports user authentication, image analysis, real-time reporting, voting, comments, and statistics.

## Features
- User registration & login with JWT authentication
- Upload images and detect potholes with AI
- Real-time reports and comments via Socket.IO
- Upvote/downvote reports and manage severity levels
- Paginated reports with filters
- Thumbnail generation and annotated images
- SQLite database backend
- Production-ready logging and error handling

## Installation
1. Clone the repository:
```bash
git clone https://github.com/Dascott1990/pothole-map-live.git
cd Map-Learning/backend
```

2. Create a virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # Linux/macOS
venv\Scripts\activate     # Windows
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the backend:
```bash
python app.py
```

## API Endpoints
- **POST**  – Register a user  
- **POST**  – Login user  
- **POST**  – Upload and analyze image with AI  
- **POST**  – Create a pothole report  
- **GET**  – Get list of reports (supports pagination & filters)  
- **POST**  – Add a comment to a report  
- **GET**  – Get comments for a report  
- **POST**  – Upvote or downvote a report  
- **GET**  – Get statistics about reports and users  

## Directory Structure
/static
/uploads # Uploaded images
/thumbs # Generated thumbnails
app.py # Main backend file
potholes.db # SQLite database
requirements.txt # Python dependencies

perl
Copy code

## Logging
Logs are written to  and stdout for real-time monitoring.

## License
MIT
