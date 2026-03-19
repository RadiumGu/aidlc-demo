import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../services/auth';

export type UserRole = 'EMPLOYEE' | 'ADMIN';

export interface UserInfo {
  id: number;
  username: string;
  role: UserRole;
}

interface AuthState {
  user: UserInfo | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, name: string, employeeId: string) => Promise<void>;
  logout: () => void;
  setAuth: (token: string, user: UserInfo) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (username, password) => {
        const res = await authApi.login({ username, password });
        const { token, userId, username: uname, role } = res.data;
        localStorage.setItem('token', token);
        set({
          token,
          user: { id: userId, username: uname, role: role as UserRole },
          isAuthenticated: true,
        });
      },

      register: async (username, password, name, employeeId) => {
        await authApi.register({ username, password, name, employeeId });
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
      },

      setAuth: (token, user) => {
        localStorage.setItem('token', token);
        set({ token, user, isAuthenticated: true });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
