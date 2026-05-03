import axios from 'axios';
import { clearAuthCookie } from '@/store/auth';
import type { AuthResponse } from '@shared/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // send refresh cookie on all requests
});

// Attach JWT token to every request if available
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

function drainQueue(token: string | null) {
  refreshQueue.forEach((cb) => cb(token));
  refreshQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 403 && typeof window !== 'undefined') {
      const code = (error.response?.data as { errorCode?: string })?.errorCode;
      if (code === 'ACCOUNT_DISABLED' || code === 'ACCOUNT_DELETED') {
        const token = localStorage.getItem('token');
        let email = '';
        try {
          if (token) {
            const [, payload] = token.split('.');
            email = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))).sub ?? '';
          }
        } catch { /* ignore */ }
        localStorage.removeItem('token');
        localStorage.removeItem('auth');
        clearAuthCookie();
        const dest = code === 'ACCOUNT_DELETED' ? '/account-deleted' : '/account-suspended';
        window.location.href = email ? `${dest}?email=${encodeURIComponent(email)}` : dest;
        return Promise.reject(error);
      }
    }

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // If the failing request is the refresh itself → hard logout
    if (originalRequest.url?.includes('/auth/refresh')) {
      drainQueue(null);
      localStorage.removeItem('token');
      localStorage.removeItem('auth');
      clearAuthCookie();
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push((token) => {
          if (!token) { reject(error); return; }
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(api(originalRequest));
        });
      });
    }

    isRefreshing = true;
    try {
      const fresh = await axios.post<AuthResponse>(
        `${BASE_URL}/auth/refresh`,
        {},
        { withCredentials: true }
      ).then((r) => r.data);

      localStorage.setItem('token', fresh.token);
      localStorage.setItem('auth', JSON.stringify(fresh));

      // Update the app_token cookie so middleware reflects fresh state
      try {
        const [, payload] = fresh.token.split('.');
        const { exp } = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
        const maxAge = exp ? exp - Math.floor(Date.now() / 1000) : 900;
        document.cookie = `app_token=${fresh.token}; path=/; max-age=${maxAge}; SameSite=Lax`;
      } catch {
        document.cookie = `app_token=${fresh.token}; path=/; SameSite=Lax`;
      }

      drainQueue(fresh.token);
      originalRequest.headers.Authorization = `Bearer ${fresh.token}`;
      return api(originalRequest);
    } catch {
      drainQueue(null);
      localStorage.removeItem('token');
      localStorage.removeItem('auth');
      clearAuthCookie();
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
