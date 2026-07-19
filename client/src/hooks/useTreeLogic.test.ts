import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

vi.mock('../api', () => ({
  fetchTree: vi.fn(),
  addNode: vi.fn(),
  updateNode: vi.fn(),
  deleteNode: vi.fn(),
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ token: 'test-token' }),
}));

import * as api from '../api';
import { useTreeLogic } from './useTreeLogic';

const sampleTree = [{ id: '1', name: 'Root', children: [] }];

describe('useTreeLogic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.fetchTree as any).mockResolvedValue({ data: sampleTree });
  });

  it('fetches the tree on mount and populates state', async () => {
    const { result } = renderHook(() => useTreeLogic());

    await waitFor(() => expect(result.current.tree).toEqual(sampleTree));
    expect(api.fetchTree).toHaveBeenCalledTimes(1);
    expect(result.current.isLoading).toBe(false);
  });

  it('does not double-fetch on repeated effect runs (StrictMode guard)', async () => {
    const { result, rerender } = renderHook(() => useTreeLogic());
    await waitFor(() => expect(result.current.tree).toEqual(sampleTree));

    rerender();
    rerender();

    expect(api.fetchTree).toHaveBeenCalledTimes(1);
  });

  it('addNode calls the api then refetches the tree', async () => {
    const { result } = renderHook(() => useTreeLogic());
    await waitFor(() => expect(api.fetchTree).toHaveBeenCalledTimes(1));

    (api.addNode as any).mockResolvedValue({ data: {} });

    await act(async () => {
      await result.current.addNode({ name: 'New' });
    });

    expect(api.addNode).toHaveBeenCalledWith({ name: 'New' });
    expect(api.fetchTree).toHaveBeenCalledTimes(2);
    expect(result.current.isLoading).toBe(false);
  });

  it('updateNode calls the api then refetches the tree', async () => {
    const { result } = renderHook(() => useTreeLogic());
    await waitFor(() => expect(api.fetchTree).toHaveBeenCalledTimes(1));

    (api.updateNode as any).mockResolvedValue({ data: {} });

    await act(async () => {
      await result.current.updateNode('1', { name: 'Updated' });
    });

    expect(api.updateNode).toHaveBeenCalledWith('1', { name: 'Updated' });
    expect(api.fetchTree).toHaveBeenCalledTimes(2);
  });

  it('deleteNode calls the api then refetches the tree', async () => {
    const { result } = renderHook(() => useTreeLogic());
    await waitFor(() => expect(api.fetchTree).toHaveBeenCalledTimes(1));

    (api.deleteNode as any).mockResolvedValue({ data: {} });

    await act(async () => {
      await result.current.deleteNode('1');
    });

    expect(api.deleteNode).toHaveBeenCalledWith('1');
    expect(api.fetchTree).toHaveBeenCalledTimes(2);
  });
});
