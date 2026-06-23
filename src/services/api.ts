import axios from 'axios';

// Create an Axios instance using relative path so Vite proxy can handle it during tunneling
const api = axios.create({
  baseURL: '',
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
