import axios from 'axios';

// ✅ LIVE BACKEND URL (Render)
const api = axios.create({
  baseURL: 'https://spendwise-ai-9fd1.onrender.com/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true
});

// ✅ Auto-add JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Handle 401 errors (auto-logout)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
  