import { create } from 'zustand';
import { createContext, useContext, useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  showModal: boolean;
  showLoginModal: () => void;
  hideLoginModal: () => void;
  login: (userData: User) => void;
  logout: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  showModal: false,
  showLoginModal: () => set({ showModal: true }),
  hideLoginModal: () => set({ showModal: false }),
  login: (userData: User) => set({ isAuthenticated: true, user: userData }),
  logout: () => set({ isAuthenticated: false, user: null }),
}));

export const useAuth = () => {
  const store = useAuthStore();
  return {
    isAuthenticated: store.isAuthenticated,
    user: store.user,
    showModal: store.showModal,
    showLoginModal: store.showLoginModal,
    hideLoginModal: store.hideLoginModal,
    login: store.login,
    logout: store.logout,
  };
}; 