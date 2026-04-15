import { create } from 'zustand';
import type { AuthResponse, Role } from '@shared/types';

// ── Cookie helpers (client-side only) ────────────────────────
// The `app_token` cookie is read by the Next.js middleware for
// server-side route protection. localStorage remains the source
// of truth for the Zustand store / axios interceptor.

function setAuthCookie(token: string) {
  try {
    const [, payload] = token.split('.');
    const { exp } = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    const maxAge = exp ? exp - Math.floor(Date.now() / 1000) : 60 * 60 * 24 * 7;
    document.cookie = `app_token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
  } catch {
    document.cookie = `app_token=${token}; path=/; SameSite=Lax`;
  }
}

export function clearAuthCookie() {
  document.cookie = 'app_token=; path=/; max-age=0; SameSite=Lax';
}

// ─────────────────────────────────────────────────────────────

interface AuthState {
  token: string | null;
  email: string | null;
  role: Role | null;
  firstName: string | null;
  lastName: string | null;
  isAuthenticated: boolean;

  login: (data: AuthResponse) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  email: null,
  role: null,
  firstName: null,
  lastName: null,
  isAuthenticated: false,

  login: (data: AuthResponse) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('auth', JSON.stringify(data));
    setAuthCookie(data.token);
    set({
      token: data.token,
      email: data.email,
      role: data.role,
      firstName: data.firstName,
      lastName: data.lastName,
      isAuthenticated: true,
    });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('auth');
    clearAuthCookie();
    set({
      token: null,
      email: null,
      role: null,
      firstName: null,
      lastName: null,
      isAuthenticated: false,
    });
  },

  hydrate: () => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('auth');
    if (stored) {
      try {
        const data: AuthResponse = JSON.parse(stored);
        // Backfill cookie for sessions created before middleware was added
        if (!document.cookie.includes('app_token=')) {
          setAuthCookie(data.token);
        }
        set({
          token: data.token,
          email: data.email,
          role: data.role,
          firstName: data.firstName,
          lastName: data.lastName,
          isAuthenticated: true,
        });
      } catch {
        localStorage.removeItem('auth');
        localStorage.removeItem('token');
        clearAuthCookie();
      }
    }
  },
}));
