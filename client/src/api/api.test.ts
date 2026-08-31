import { describe, it, expect, vi, beforeEach } from 'vitest';
import api, { injectShowErrorModal, injectLogout } from './api';

// The interceptor is registered once at module load; grab its rejected
// handler directly off axios's internal handlers array rather than
// re-triggering a real HTTP call for every case.
const getRejectedHandler = () => (api.interceptors.response as any).handlers[0].rejected;

describe('api response interceptor', () => {
  let showErrorModal: ReturnType<typeof vi.fn>;
  let logout: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    showErrorModal = vi.fn();
    logout = vi.fn();
    injectShowErrorModal(showErrorModal);
    injectLogout(logout);
  });

  it('logs out (not just shows an error) on an invalid token', async () => {
    const rejected = getRejectedHandler();
    const error = { response: { status: 401, data: { message: 'Token is not valid' } } };

    await expect(rejected(error)).rejects.toBe(error);

    expect(logout).toHaveBeenCalledTimes(1);
    expect(showErrorModal).not.toHaveBeenCalled();
  });

  it('surfaces a non-token 401 via the error modal', async () => {
    const rejected = getRejectedHandler();
    const error = { response: { status: 401, data: { message: 'Not authorized' } } };

    await expect(rejected(error)).rejects.toBe(error);

    expect(showErrorModal).toHaveBeenCalledWith('Not authorized');
    expect(logout).not.toHaveBeenCalled();
  });

  it('surfaces a 400 via the error modal (previously silently swallowed)', async () => {
    const rejected = getRejectedHandler();
    const error = { response: { status: 400, data: { message: 'newParentId is required' } } };

    await expect(rejected(error)).rejects.toBe(error);

    expect(showErrorModal).toHaveBeenCalledWith('newParentId is required');
  });

  it('surfaces a 404 via the error modal (previously silently swallowed)', async () => {
    const rejected = getRejectedHandler();
    const error = { response: { status: 404, data: { message: 'Node not found' } } };

    await expect(rejected(error)).rejects.toBe(error);

    expect(showErrorModal).toHaveBeenCalledWith('Node not found');
  });

  it('surfaces a 500 via the error modal (previously silently swallowed)', async () => {
    const rejected = getRejectedHandler();
    const error = { response: { status: 500, data: { message: 'Server error' } } };

    await expect(rejected(error)).rejects.toBe(error);

    expect(showErrorModal).toHaveBeenCalledWith('Server error');
  });

  it('falls back to a generic message when the server sent no message', async () => {
    const rejected = getRejectedHandler();
    const error = { response: { status: 500, data: {} } };

    await expect(rejected(error)).rejects.toBe(error);

    expect(showErrorModal).toHaveBeenCalledWith('Unexpected error');
  });

  it('surfaces a network/no-response failure via the error modal (previously unhandled)', async () => {
    const rejected = getRejectedHandler();
    const error = { response: undefined, message: 'Network Error' };

    await expect(rejected(error)).rejects.toBe(error);

    expect(showErrorModal).toHaveBeenCalledTimes(1);
    expect(showErrorModal.mock.calls[0][0]).toEqual(expect.any(String));
  });
});
