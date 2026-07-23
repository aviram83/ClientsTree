import { create } from 'zustand';
import * as api from '../api';
import { injectShowErrorModal, injectLogout } from '../api/api';
import { useProfileStore } from './profileStore';

interface AuthState {
  token: string | null;
  isLoading: boolean;
  errorMessage: string | null;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  showErrorModal: (message: string) => void;
  closeErrorModal: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  isLoading: false,
  errorMessage: null,

  showErrorModal: (message: string) => set({ errorMessage: message }),

  closeErrorModal: () => set({ errorMessage: null }),

  logout: () => {
    set({ token: null });
    localStorage.removeItem('token');
    useProfileStore.getState().clearProfile();
  },

  login: async (data: any) => {
    set({ isLoading: true });
    try {
      const response = await api.login(data);
      const { token } = response.data;
      set({ token });
      localStorage.setItem('token', token);
      await useProfileStore.getState().fetchProfile();
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (data: any) => {
    set({ isLoading: true });
    try {
      await api.register(data);
    } finally {
      set({ isLoading: false });
    }
  },
}));

injectShowErrorModal((message) => useAuthStore.getState().showErrorModal(message));
injectLogout(() => useAuthStore.getState().logout());

if (useAuthStore.getState().token) {
  useProfileStore.getState().fetchProfile();
}
