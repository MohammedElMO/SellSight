import { create } from 'zustand';
import type { AuthResponse, Role } from '@shared/types';

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
      }
    }
  },
}));
