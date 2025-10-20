// Global variables
let currentSection = 0;
const dashboardURL = 'http://localhost:5001';

// DOM elements
const scrollContainer = document.getElementById('scrollContainer');
const dots = document.querySelectorAll('.dot');
const sections = document.querySelectorAll('.section');
const loginForm = document.getElementById('loginForm');

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    updateTime();
    setupEventListeners();
    startLiveUpdates();
    
    // Focus on username field
    document.getElementById('username').focus();
    
    // Check for error parameters in URL
    checkURLParameters();
}

// Update current time
function updateTime() {
    const now = new Date();
    document.getElementById('current-time').textContent = now.toLocaleString();
}

// Setup all event listeners
function setupEventListeners() {
    // Scroll snapping and dot navigation
    scrollContainer.addEventListener('scroll', handleScroll);
    
    // Dot click navigation
    dots.forEach(dot => {
        dot.addEventListener('click', handleDotClick);
    });
    
    // Login form handling
    loginForm.addEventListener('submit', handleLogin);
    
    // Keyboard navigation
    document.addEventListener('keydown', handleKeyboardNavigation);
    
    // Touch events for better mobile experience
    setupTouchEvents();
}

// Handle scroll events
function handleScroll() {
    const scrollPos = scrollContainer.scrollTop;
    const sectionHeight = scrollContainer.clientHeight;
    currentSection = Math.round(scrollPos / sectionHeight);
    
    updateNavigationDots();
}

// Handle dot click navigation
function handleDotClick(event) {
    const sectionIndex = parseInt(event.target.getAttribute('data-section'));
    scrollToSection(sectionIndex);
}

// Handle keyboard navigation
function handleKeyboardNavigation(event) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
        event.preventDefault();
        scrollToSection(currentSection + 1);
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
        event.preventDefault();
        scrollToSection(currentSection - 1);
    } else if (event.key === 'Home') {
        event.preventDefault();
        scrollToSection(0);
    } else if (event.key === 'End') {
        event.preventDefault();
        scrollToSection(sections.length - 1);
    }
}

// Setup touch events for mobile
function setupTouchEvents() {
    let startY;
    
    scrollContainer.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
    });
    
    scrollContainer.addEventListener('touchend', (e) => {
        const endY = e.changedTouches[0].clientY;
        const diff = startY - endY;
        
        // If significant vertical swipe detected
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                // Swipe down - next section
                scrollToSection(currentSection + 1);
            } else {
                // Swipe up - previous section
                scrollToSection(currentSection - 1);
            }
        }
    });
}

// Scroll to specific section
function scrollToSection(sectionIndex) {
    if (sectionIndex >= 0 && sectionIndex < sections.length) {
        scrollContainer.scrollTo({
            top: sectionIndex * scrollContainer.clientHeight,
            behavior: 'smooth'
        });
        currentSection = sectionIndex;
        updateNavigationDots();
    }
}

// Update navigation dots
function updateNavigationDots() {
    dots.forEach((dot, index) => {
        if (index === currentSection) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

// Handle login form submission
async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const alert = document.getElementById('alert');
    const alertMessage = document.getElementById('alert-message');
    
    // Validation
    if (!username || !password) {
        showAlert('Please enter both username and password', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = document.querySelector('.login-btn');
    const originalText = submitBtn.innerHTML;
    const originalBackground = submitBtn.style.background;
    
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
    submitBtn.disabled = true;
    
    try {
        // Attempt to authenticate
        const success = await authenticateUser(username, password);
        
        if (success) {
            showAlert('Access granted! Redirecting to dashboard...', 'success');
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Access Granted!';
            submitBtn.style.background = 'linear-gradient(135deg, #2ecc71, #27ae60)';
            
            // Redirect to dashboard
            setTimeout(() => {
                redirectToDashboard();
            }, 1500);
            
        } else {
            throw new Error('Invalid credentials');
        }
        
    } catch (error) {
        console.error('Login error:', error);
        
        let errorMessage = 'Invalid admin credentials. Please try again.';
        
        if (error.message.includes('Network') || error.message.includes('Failed to fetch')) {
            errorMessage = 'Network error: Cannot connect to authentication service.';
        } else if (error.message.includes('timeout')) {
            errorMessage = 'Request timeout: Authentication service is not responding.';
        }
        
        showAlert(errorMessage, 'error');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        submitBtn.style.background = originalBackground;
        
        // Shake animation for error
        loginForm.style.animation = 'shake 0.5s';
        setTimeout(() => {
            loginForm.style.animation = '';
        }, 500);
    }
}

// Authenticate user with backend
async function authenticateUser(username, password) {
    // For demo purposes - using default credentials
    // In production, this would make an API call to your backend
    if (username === 'admin' && password === 'admin123') {
        return true;
    }
    
    // Simulate API call delay and potential errors
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simulate random network errors (10% chance)
            if (Math.random() < 0.1) {
                reject(new Error('Network error'));
            } else {
                resolve(username === 'admin' && password === 'admin123');
            }
        }, 1500);
    });
}

// Redirect to dashboard with error handling
function redirectToDashboard() {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = dashboardURL;
    
    iframe.onload = function() {
        // If iframe loads successfully, redirect
        window.location.href = dashboardURL;
    };
    
    iframe.onerror = function() {
        // If dashboard is not accessible, show error page
        showErrorPage('Dashboard is currently unavailable. Please try again later.');
    };
    
    document.body.appendChild(iframe);
    
    // Fallback timeout
    setTimeout(() => {
        if (!iframe.contentWindow || !iframe.contentWindow.location) {
            showErrorPage('Dashboard is currently unavailable. Please try again later.');
        }
    }, 5000);
}

// Show error page
function showErrorPage(message) {
    // Create error page HTML
    const errorHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Dashboard Error - PotholeDetect</title>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            <style>
                body {
                    background: linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d);
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    height: 100vh;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    margin: 0;
                    padding: 20px;
                }
                .error-container {
                    background: rgba(255, 255, 255, 0.95);
                    padding: 40px;
                    border-radius: 20px;
                    text-align: center;
                    max-width: 500px;
                    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
                }
                .error-icon {
                    font-size: 4rem;
                    color: #e74c3c;
                    margin-bottom: 20px;
                }
                h1 {
                    color: #2c3e50;
                    margin-bottom: 15px;
                }
                p {
                    color: #7f8c8d;
                    margin-bottom: 25px;
                    line-height: 1.6;
                }
                .btn {
                    background: linear-gradient(135deg, #3498db, #2c3e50);
                    color: white;
                    border: none;
                    padding: 12px 25px;
                    border-radius: 10px;
                    font-size: 1rem;
                    cursor: pointer;
                    text-decoration: none;
                    display: inline-block;
                    margin: 5px;
                }
            </style>
        </head>
        <body>
            <div class="error-container">
                <div class="error-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h1>Dashboard Unavailable</h1>
                <p>${message}</p>
                <div>
                    <button class="btn" onclick="window.location.reload()">
                        <i class="fas fa-redo"></i> Try Again
                    </button>
                    <button class="btn" onclick="window.history.back()">
                        <i class="fas fa-arrow-left"></i> Go Back
                    </button>
                </div>
            </div>
        </body>
        </html>
    `;
    
    // Replace current document with error page
    document.write(errorHTML);
    document.close();
}

// Show alert message
function showAlert(message, type = 'error') {
    const alert = document.getElementById('alert');
    const alertMessage = document.getElementById('alert-message');
    
    alert.className = `alert alert-${type}`;
    alertMessage.textContent = message;
    alert.style.display = 'block';
    
    // Auto-hide success messages
    if (type === 'success') {
        setTimeout(() => {
            alert.style.display = 'none';
        }, 5000);
    }
}

// Check URL parameters for errors
function checkURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    
    if (error) {
        switch (error) {
            case 'auth_failed':
                showAlert('Authentication failed. Please log in again.', 'error');
                break;
            case 'session_expired':
                showAlert('Your session has expired. Please log in again.', 'warning');
                break;
            case 'dashboard_unavailable':
                showAlert('Dashboard is currently unavailable. Please try again later.', 'error');
                break;
        }
        
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

// Live updates for statistics
function startLiveUpdates() {
    // Update time every second
    setInterval(updateTime, 1000);
    
    // Update stats every 30 seconds
    setInterval(updateStats, 30000);
    
    // Initial stats update
    updateStats();
}

// Update statistics
function updateStats() {
    const reports = document.getElementById('stat-reports');
    const users = document.getElementById('stat-users');
    
    if (reports && users) {
        // Random small fluctuations to simulate live data
        const currentReports = parseInt(reports.textContent.replace(',', '')) || 1247;
        const currentUsers = parseInt(users.textContent) || 384;
        
        reports.textContent = (currentReports + Math.floor(Math.random() * 3)).toLocaleString();
        users.textContent = currentUsers + Math.floor(Math.random() * 2);
    }
}

// Utility function for making API calls
async function makeAPICall(url, options = {}) {
    const timeout = 10000; // 10 seconds
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        clearTimeout(timeoutId);
        
        if (error.name === 'AbortError') {
            throw new Error('Request timeout');
        }
        
        throw error;
    }
}

// Export functions for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        authenticateUser,
        redirectToDashboard,
        showAlert
    };
}