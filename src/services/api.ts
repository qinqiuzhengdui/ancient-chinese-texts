import axios from 'axios';

// Create an Axios instance with base URL pointing to the FastAPI backend
const api = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 10000,
});

// Request interceptor: Attach JWT token to headers if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
