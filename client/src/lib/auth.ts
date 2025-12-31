'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type User = {
  id: string;
  name?: string;
  email: string;
  locale: 'en' | 'ar';
  role: 'user' | 'admin';
  avatar?: string;
};

type AuthState = {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  clear: () => void;
  isAuthenticated: () => boolean;
};

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      clear: () => set({ token: null, user: null }),
      isAuthenticated: () => {
        const state = get();
        return !!state.token && !!state.user;
      },
    }),
    {
      name: 'noor-auth-storage', // localStorage key
    }
  )
);
