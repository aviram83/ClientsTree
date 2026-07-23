import { describe, it, expect, vi, beforeEach } from 'vitest';

const fetchProfile = vi.fn().mockResolvedValue(undefined);
const clearProfile = vi.fn();

vi.mock('../api', () => ({
  login: vi.fn(),
  register: vi.fn(),
}));

vi.mock('./profileStore', () => ({
  useProfileStore: {
    getState: () => ({ fetchProfile, clearProfile }),
  },
}));

vi.mock('../api/api', () => ({
  injectShowErrorModal: vi.fn(),
  injectLogout: vi.fn(),
}));

import * as api from '../api';
import { useAuthStore } from './authStore';

const initialState = useAuthStore.getState();

describe('authStore', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    fetchProfile.mockResolvedValue(undefined);
    useAuthStore.setState(initialState, true);
  });

  it('login stores the token and persists it to localStorage', async () => {
    (api.login as any).mockResolvedValue({ data: { token: 'new-token' } });

    await useAuthStore.getState().login({ email: 'a@b.com', password: 'pw' });

    expect(useAuthStore.getState().token).toBe('new-token');
    expect(localStorage.getItem('token')).toBe('new-token');
    expect(fetchProfile).toHaveBeenCalled();
  });

  it('register calls the api and resets isLoading', async () => {
    (api.register as any).mockResolvedValue({ data: {} });

    await useAuthStore.getState().register({ email: 'a@b.com', password: 'pw' });

    expect(api.register).toHaveBeenCalledWith({ email: 'a@b.com', password: 'pw' });
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it('logout clears the token, localStorage, and the profile store', () => {
    localStorage.setItem('token', 'stored-token');
    useAuthStore.setState({ token: 'stored-token' });

    useAuthStore.getState().logout();

    expect(useAuthStore.getState().token).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
    expect(clearProfile).toHaveBeenCalled();
  });

  it('showErrorModal/closeErrorModal set and clear the error message', () => {
    useAuthStore.getState().showErrorModal('Something broke');
    expect(useAuthStore.getState().errorMessage).toBe('Something broke');

    useAuthStore.getState().closeErrorModal();
    expect(useAuthStore.getState().errorMessage).toBeNull();
  });

  describe('module initialization', () => {
    it('seeds token from localStorage and fetches the profile when a token is already stored', async () => {
      localStorage.setItem('token', 'stored-token');
      vi.resetModules();

      const { useAuthStore: freshStore } = await import('./authStore');

      expect(freshStore.getState().token).toBe('stored-token');
      expect(fetchProfile).toHaveBeenCalled();
    });

    it('does not fetch the profile on load when no token is stored', async () => {
      vi.resetModules();

      const { useAuthStore: freshStore } = await import('./authStore');

      expect(freshStore.getState().token).toBeNull();
      expect(fetchProfile).not.toHaveBeenCalled();
    });
  });
});
