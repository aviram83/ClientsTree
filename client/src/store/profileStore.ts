import { create } from 'zustand';
import { User, LanguageCode } from '../api/types';
import * as api from '../api';

interface ProfileState {
  profile: User | null;
  isLoading: boolean;
  fetchProfile: () => Promise<void>;
  updateLanguage: (language: LanguageCode) => Promise<void>;
  clearProfile: () => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  isLoading: false,
  fetchProfile: async () => {
    set({ isLoading: true });
    try {
      const response = await api.getProfile();
      set({ profile: response.data });
    } catch (error) {
      console.error('Failed to fetch profile', error);
    } finally {
      set({ isLoading: false });
    }
  },
  updateLanguage: async (language: LanguageCode) => {
    const response = await api.updateProfile(language);
    set({ profile: response.data });
  },
  clearProfile: () => set({ profile: null }),
}));
