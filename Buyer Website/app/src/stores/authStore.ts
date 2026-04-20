import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, clearTokens } from '@/lib/api';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: { name: string; email: string; password: string; role: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
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
          const u = data.user;
          const user: User = {
            id: u.id,
            name: u.displayName ?? u.username,
            email: u.email,
            avatar: u.avatarUrl ?? '/images/avatar-3.jpg',
            role: u.role,
            plan: u.subscriptionTier ?? 'free',
            credits: u.creditsBalance ?? 0,
            downloads: 0,
            savedItems: 0,
          };
          set({ user, isAuthenticated: true, isLoading: false });
          return true;
        } catch (err: any) {
          set({ isLoading: false, error: err.message ?? 'Login failed' });
          return false;
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const res = await authApi.register({
            email: data.email,
            username: data.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, ''),
            displayName: data.name,
            password: data.password,
            role: data.role === 'sell' ? 'seller' : 'buyer',
          });
          // Auto-login after register
          return await get().login(data.email, data.password);
        } catch (err: any) {
          set({ isLoading: false, error: err.message ?? 'Registration failed' });
          return false;
        }
      },

      logout: async () => {
        await authApi.logout();
        set({ user: null, isAuthenticated: false });
      },

      checkSession: async () => {
        const { isAuthenticated } = get();
        if (!isAuthenticated) return;
        try {
          const res = await authApi.me();
          const u = res.data;
          const user: User = {
            id: u.id,
            name: u.displayName ?? u.username,
            email: u.email,
            avatar: u.avatarUrl ?? '/images/avatar-3.jpg',
            role: u.role,
            plan: u.subscriptionTier ?? 'free',
            credits: u.creditsBalance ?? 0,
            downloads: 0,
            savedItems: 0,
          };
          set({ user, isAuthenticated: true });
        } catch {
          clearTokens();
          set({ user: null, isAuthenticated: false });
        }
      },

      updateUser: (updates) => {
        const { user } = get();
        if (user) set({ user: { ...user, ...updates } });
      },
    }),
    {
      name: 'hx-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
