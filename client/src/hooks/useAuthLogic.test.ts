import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

const fetchProfile = vi.fn().mockResolvedValue(undefined);
const clearProfile = vi.fn();

vi.mock('../api', () => ({
  login: vi.fn(),
  register: vi.fn(),
}));

vi.mock('../store/profileStore', () => ({
  useProfileStore: {
    getState: () => ({ fetchProfile, clearProfile }),
  },
}));

import * as api from '../api';
import { useAuthLogic } from './useAuthLogic';

describe('useAuthLogic', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    fetchProfile.mockResolvedValue(undefined);
  });

  it('starts with the token from localStorage, if any', () => {
    localStorage.setItem('token', 'stored-token');
    const { result } = renderHook(() => useAuthLogic());
    expect(result.current.token).toBe('stored-token');
  });

  it('login stores the token and persists it to localStorage', async () => {
    (api.login as any).mockResolvedValue({ data: { token: 'new-token' } });
    const { result } = renderHook(() => useAuthLogic());

    await act(async () => {
      await result.current.login({ email: 'a@b.com', password: 'pw' });
    });

    expect(result.current.token).toBe('new-token');
    expect(localStorage.getItem('token')).toBe('new-token');
    expect(fetchProfile).toHaveBeenCalled();
  });

  it('register calls the api and resets isLoading', async () => {
    (api.register as any).mockResolvedValue({ data: {} });
    const { result } = renderHook(() => useAuthLogic());

    await act(async () => {
      await result.current.register({ email: 'a@b.com', password: 'pw' });
    });

    expect(api.register).toHaveBeenCalledWith({ email: 'a@b.com', password: 'pw' });
    expect(result.current.isLoading).toBe(false);
  });

  it('logout clears the token, localStorage, and the profile store', () => {
    localStorage.setItem('token', 'stored-token');
    const { result } = renderHook(() => useAuthLogic());

    act(() => {
      result.current.logout();
    });

    expect(result.current.token).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
    expect(clearProfile).toHaveBeenCalled();
  });

  it('showErrorModal/closeErrorModal set and clear the error message', () => {
    const { result } = renderHook(() => useAuthLogic());

    act(() => {
      result.current.showErrorModal('Something broke');
    });
    expect(result.current.errorMessage).toBe('Something broke');

    act(() => {
      result.current.closeErrorModal();
    });
    expect(result.current.errorMessage).toBeNull();
  });

  it('fetches the profile on mount when a token is already stored', async () => {
    localStorage.setItem('token', 'stored-token');
    renderHook(() => useAuthLogic());

    await waitFor(() => expect(fetchProfile).toHaveBeenCalled());
  });
});
