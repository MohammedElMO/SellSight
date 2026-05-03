import { create } from 'zustand';
import type { AuthResponse, Role } from '@shared/types';

// Safe user metadata — no tokens. Stored in localStorage for hydration across page loads.
interface UserMeta {
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  sellerStatus: string | null;
}

// Clears the non-HttpOnly routing cookie so proxy.ts stops treating user as authenticated.
// The HttpOnly app_token and refresh_token cookies can only be cleared by the backend.
export function clearSessionCookie() {
  if (typeof document !== 'undefined') {
    document.cookie = 'app_session=; path=/; max-age=0; SameSite=Lax';
  }
}

interface AuthState {
  email: string | null;
  role: Role | null;
  firstName: string | null;
  lastName: string | null;
  isAuthenticated: boolean;
  emailVerified: boolean;
  sellerStatus: string | null;

  login: (data: AuthResponse) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  email: null,
  role: null,
  firstName: null,
  lastName: null,
  isAuthenticated: false,
  emailVerified: false,
  sellerStatus: null,

  login: (data: AuthResponse) => {
    const meta: UserMeta = {
      email: data.email,
      role: data.role,
      firstName: data.firstName,
      lastName: data.lastName,
      emailVerified: data.emailVerified,
      sellerStatus: data.sellerStatus ?? null,
    };
    localStorage.setItem('user', JSON.stringify(meta));
    set({ ...meta, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('user');
    clearSessionCookie();
    set({
      email: null,
      role: null,
      firstName: null,
      lastName: null,
      isAuthenticated: false,
      emailVerified: false,
      sellerStatus: null,
    });
  },

  hydrate: () => {
    if (typeof window === 'undefined') return;
    // Remove stale pre-migration keys
    localStorage.removeItem('token');
    localStorage.removeItem('auth');
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const meta: UserMeta = JSON.parse(stored);
        set({ ...meta, isAuthenticated: true });
      } catch {
        localStorage.removeItem('user');
      }
    }
  },
}));
