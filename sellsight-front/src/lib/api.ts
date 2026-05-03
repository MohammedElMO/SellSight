import axios from 'axios';
import { clearSessionCookie } from '@/store/auth';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  // withCredentials sends the HttpOnly app_token and refresh_token cookies on every request
  withCredentials: true,
});

// No Authorization header injection — auth is cookie-based.
// The HttpOnly app_token cookie is sent automatically by the browser.

let isRefreshing = false;
let refreshQueue: Array<(ok: boolean) => void> = [];

function drainQueue(ok: boolean) {
  refreshQueue.forEach((cb) => cb(ok));
  refreshQueue = [];
}

function hardLogout() {
  localStorage.removeItem('user');
  clearSessionCookie(); // clear non-HttpOnly routing cookie so proxy redirects correctly
  if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
    window.location.href = '/login';
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 403 && typeof window !== 'undefined') {
      const code = (error.response?.data as { errorCode?: string })?.errorCode;
      if (code === 'ACCOUNT_DISABLED' || code === 'ACCOUNT_DELETED') {
        // Email comes from safe localStorage metadata — no JWT decoding needed
        let email = '';
        try {
          const stored = localStorage.getItem('user');
          if (stored) email = JSON.parse(stored).email ?? '';
        } catch { /* ignore */ }
        localStorage.removeItem('user');
        clearSessionCookie();
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
      drainQueue(false);
      hardLogout();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push((ok) => {
          if (!ok) { reject(error); return; }
          // Backend has set a new app_token cookie — retry sends it automatically
          resolve(api(originalRequest));
        });
      });
    }

    isRefreshing = true;
    try {
      // Backend rotates refresh token and sets new app_token + app_session cookies
      await axios.post(`${BASE_URL}/auth/refresh`, {}, { withCredentials: true });

      drainQueue(true);
      return api(originalRequest);
    } catch {
      drainQueue(false);
      hardLogout();
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
