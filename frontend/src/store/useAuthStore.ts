import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../services/api';

export type UserRole = 'employee' | 'admin';

export interface UserInfo {
  id?: number;
  username: string;
  displayName: string;
  role: UserRole;
  points?: number;
  avatar?: string;
}

interface AuthState {
  user: UserInfo | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split('.')[1];
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: async (username: string, password: string) => {
        try {
          const res = await authApi.login({ username, password }) as unknown as {
            code: number;
            data: {
              accessToken: string;
              refreshToken: string;
              user?: {
                id?: number;
                username: string;
                displayName?: string;
                role?: string;
                points?: number;
              };
            };
          };

          if (res.code !== 0) return false;

          const { accessToken, refreshToken, user: userData } = res.data;
          localStorage.setItem('token', accessToken);
          if (refreshToken) localStorage.setItem('refreshToken', refreshToken);

          let userInfo: UserInfo;

          if (userData) {
            userInfo = {
              id: userData.id,
              username: userData.username,
              displayName: userData.displayName || userData.username,
              role: (userData.role?.toLowerCase() as UserRole) || 'employee',
              points: userData.points,
            };
          } else {
            // Fallback: parse JWT
            const payload = parseJwtPayload(accessToken);
            userInfo = {
              username: (payload?.username as string) || username,
              displayName: (payload?.displayName as string) || username,
              role: ((payload?.role as string)?.toLowerCase() as UserRole) || 'employee',
            };
          }

          set({ user: userInfo, isAuthenticated: true });
          return true;
        } catch {
          return false;
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch {
          // ignore
        }
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        set({ user: null, isAuthenticated: false });
      },

      fetchMe: async () => {
        try {
          const res = await authApi.me() as unknown as {
            code: number;
            data: {
              id?: number;
              username: string;
              displayName?: string;
              role?: string;
              points?: number;
            };
          };
          if (res.code === 0 && res.data) {
            const d = res.data;
            set({
              user: {
                id: d.id,
                username: d.username,
                displayName: d.displayName || d.username,
                role: (d.role?.toLowerCase() as UserRole) || 'employee',
                points: d.points,
              },
            });
          }
        } catch {
          // ignore
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
