'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  _id: string;
  name: string;
  email: string;
  customerId?: string;
  role: 'admin' | 'staff' | 'customer';
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      login: (user: User, token: string) => {
        set({
          user,
          token,
          isAuthenticated: true,
        });
      },
      
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },
      
      setUser: (user: User | null) => {
        set({ user });
      },
      
      setToken: (token: string | null) => {
        set({ token });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
