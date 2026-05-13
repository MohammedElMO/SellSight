import axios from 'axios';
import { clearAuthCookie } from '@/store/auth';

const fallbackBaseURL = typeof window !== 'undefined'
  ? 'http://localhost:8081/api'
  : '/api';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || fallbackBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request if available
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle 401 responses — clear all auth state so middleware reflects the change
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('auth');
      clearAuthCookie();
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
