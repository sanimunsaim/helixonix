import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, clearTokens } from '@/lib/api';

interface AdminUser {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  role: 'admin' | 'super_admin';
}

interface AuthState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const data = await authApi.login(email, password);
          set({ user: data.user, isAuthenticated: true, isLoading: false });
          return true;
        } catch (err: any) {
          set({ isLoading: false, error: err.message ?? 'Login failed' });
          return false;
        }
      },

      logout: async () => {
        await authApi.logout();
        set({ user: null, isAuthenticated: false });
      },

      checkSession: async () => {
        if (!get().isAuthenticated) return;
        try {
          const res = await authApi.me();
          set({ user: res.data, isAuthenticated: true });
        } catch {
          clearTokens();
          set({ user: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: 'hx-admin-auth',
      partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }),
    }
  )
);
