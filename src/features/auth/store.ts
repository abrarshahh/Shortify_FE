import { create } from 'zustand';
import { User } from '@/types/models';

interface AuthState {
  user: User | null;
  sessionId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setSession: (sessionId: string, user: User) => void;
  clearSession: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  sessionId: null,
  isAuthenticated: false,
  isLoading: true,

  setSession: (sessionId, user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('shortify_session_id', sessionId);
      localStorage.setItem('shortify_user', JSON.stringify(user));
    }
    set({ sessionId, user, isAuthenticated: true, isLoading: false });
  },

  clearSession: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('shortify_session_id');
      localStorage.removeItem('shortify_user');
    }
    set({ sessionId: null, user: null, isAuthenticated: false, isLoading: false });
  },

  initialize: () => {
    if (typeof window !== 'undefined') {
      const sessionId = localStorage.getItem('shortify_session_id');
      const userStr = localStorage.getItem('shortify_user');
      if (sessionId && userStr) {
        try {
          const user = JSON.parse(userStr);
          set({ sessionId, user, isAuthenticated: true, isLoading: false });
          return;
        } catch (e) {
          localStorage.removeItem('shortify_session_id');
          localStorage.removeItem('shortify_user');
        }
      }
    }
    set({ sessionId: null, user: null, isAuthenticated: false, isLoading: false });
  },
}));
