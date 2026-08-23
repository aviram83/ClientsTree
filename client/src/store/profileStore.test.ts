import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../api', () => ({
  getProfile: vi.fn(),
  updateProfile: vi.fn(),
}));

import * as api from '../api';
import { useProfileStore } from './profileStore';

const initialState = useProfileStore.getState();

describe('profileStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useProfileStore.setState(initialState, true);
  });

  it('fetchProfile loads the profile and clears isLoading', async () => {
    const profile = { id: 'user-1', email: 'a@b.com', firstName: 'A', lastName: 'B', language: 'he' };
    (api.getProfile as any).mockResolvedValue({ data: profile });

    await useProfileStore.getState().fetchProfile();

    expect(useProfileStore.getState().profile).toEqual(profile);
    expect(useProfileStore.getState().isLoading).toBe(false);
  });

  it('fetchProfile clears isLoading even when the request fails', async () => {
    (api.getProfile as any).mockRejectedValue(new Error('network error'));

    await useProfileStore.getState().fetchProfile();

    expect(useProfileStore.getState().profile).toBeNull();
    expect(useProfileStore.getState().isLoading).toBe(false);
  });

  it('updateLanguage writes the server response back into the store', async () => {
    const updated = { id: 'user-1', email: 'a@b.com', firstName: 'A', lastName: 'B', language: 'en' };
    (api.updateProfile as any).mockResolvedValue({ data: updated });

    await useProfileStore.getState().updateLanguage('en');

    expect(api.updateProfile).toHaveBeenCalledWith('en');
    expect(useProfileStore.getState().profile).toEqual(updated);
  });

  it('updateLanguage propagates the error and leaves the profile unchanged on failure', async () => {
    const profile = { id: 'user-1', email: 'a@b.com', firstName: 'A', lastName: 'B', language: 'he' };
    useProfileStore.setState({ profile });
    (api.updateProfile as any).mockRejectedValue(new Error('server error'));

    await expect(useProfileStore.getState().updateLanguage('en')).rejects.toThrow('server error');
    expect(useProfileStore.getState().profile).toEqual(profile);
  });

  it('clearProfile resets the profile to null', () => {
    useProfileStore.setState({ profile: { id: 'user-1', email: 'a@b.com', firstName: 'A', lastName: 'B', language: 'he' } });

    useProfileStore.getState().clearProfile();

    expect(useProfileStore.getState().profile).toBeNull();
  });
});
