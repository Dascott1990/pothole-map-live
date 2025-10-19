import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

console.log('API Base URL:', API_BASE_URL); // Debug log

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle responses and errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - backend might not be running');
    }
    
    if (!error.response) {
      console.error('Network error - backend might be down');
    }
    
    return Promise.reject(error);
  }
);

// Test backend connection
export const testBackendConnection = async () => {
  try {
    const response = await api.get('/api/stats');
    console.log('Backend connection successful:', response.status);
    return true;
  } catch (error) {
    console.error('Backend connection failed:', error.message);
    return false;
  }
};