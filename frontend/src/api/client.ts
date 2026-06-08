import axios from 'axios';

// Configure backend endpoint URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT token automatically if present in storage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      // Check if endpoint is login. If so, don't override form url-encoded headers
      if (config.url === '/auth/login') {
        config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Global intercept for unauthorized statuses (401)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear credentials on invalid token or session expiry
      localStorage.removeItem('token');
      // Redirect to login if user is not on auth pages
      if (
        !window.location.pathname.includes('/login') && 
        !window.location.pathname.includes('/register')
      ) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
