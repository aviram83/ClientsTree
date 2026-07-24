import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../api', () => ({
  fetchTree: vi.fn(),
  addNode: vi.fn(),
  updateNode: vi.fn(),
  deleteNode: vi.fn(),
}));

const { mockAuthState, authListeners } = vi.hoisted(() => ({
  mockAuthState: { token: 'test-token' as string | null },
  authListeners: [] as Array<(state: any, prevState: any) => void>,
}));

vi.mock('./authStore', () => ({
  useAuthStore: {
    getState: () => ({ token: mockAuthState.token }),
    subscribe: (listener: any) => {
      authListeners.push(listener);
      return () => {};
    },
  },
}));

const triggerAuthChange = (newToken: string | null) => {
  const prevState = { token: mockAuthState.token };
  mockAuthState.token = newToken;
  authListeners.forEach((listener) => listener({ token: newToken }, prevState));
};

import * as api from '../api';
import { useTreeStore } from './treeStore';

const sampleTree = [{ id: '1', name: 'Root', children: [] }];
const initialState = useTreeStore.getState();

describe('treeStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthState.token = 'test-token';
    (api.fetchTree as any).mockResolvedValue({ data: sampleTree });
    useTreeStore.setState(initialState, true);
  });

  it('fetchTree populates the tree from the api', async () => {
    await useTreeStore.getState().fetchTree();

    expect(useTreeStore.getState().tree).toEqual(sampleTree);
    expect(api.fetchTree).toHaveBeenCalledTimes(1);
    expect(useTreeStore.getState().isLoading).toBe(false);
  });

  it('fetchTree is a no-op when there is no token', async () => {
    mockAuthState.token = null;

    await useTreeStore.getState().fetchTree();

    expect(api.fetchTree).not.toHaveBeenCalled();
    expect(useTreeStore.getState().tree).toEqual([]);
  });

  it('discards a response that resolves after the session changed (logout mid-flight)', async () => {
    let resolveFetch!: (value: { data: typeof sampleTree }) => void;
    (api.fetchTree as any).mockReturnValue(
      new Promise((resolve) => {
        resolveFetch = resolve;
      })
    );

    const fetchPromise = useTreeStore.getState().fetchTree();
    mockAuthState.token = 'a-different-token'; // session changed while the request was in flight
    resolveFetch({ data: sampleTree });
    await fetchPromise;

    expect(useTreeStore.getState().tree).toEqual([]);
    expect(useTreeStore.getState().isLoading).toBe(false);
  });

  it('clears the tree when authStore transitions from a token to no token (logout)', () => {
    useTreeStore.setState({ tree: sampleTree });

    triggerAuthChange(null);

    expect(useTreeStore.getState().tree).toEqual([]);
  });

  it('does not clear the tree on auth changes that are not a logout', () => {
    useTreeStore.setState({ tree: sampleTree });

    triggerAuthChange('another-token');

    expect(useTreeStore.getState().tree).toEqual(sampleTree);
  });

  it('addNode calls the api then refetches the tree', async () => {
    (api.addNode as any).mockResolvedValue({ data: {} });

    await useTreeStore.getState().addNode({ name: 'New' });

    expect(api.addNode).toHaveBeenCalledWith({ name: 'New' });
    expect(api.fetchTree).toHaveBeenCalledTimes(1);
    expect(useTreeStore.getState().isLoading).toBe(false);
  });

  it('updateNode calls the api then refetches the tree', async () => {
    (api.updateNode as any).mockResolvedValue({ data: {} });

    await useTreeStore.getState().updateNode('1', { name: 'Updated' });

    expect(api.updateNode).toHaveBeenCalledWith('1', { name: 'Updated' });
    expect(api.fetchTree).toHaveBeenCalledTimes(1);
  });

  it('deleteNode calls the api then refetches the tree', async () => {
    (api.deleteNode as any).mockResolvedValue({ data: {} });

    await useTreeStore.getState().deleteNode('1');

    expect(api.deleteNode).toHaveBeenCalledWith('1');
    expect(api.fetchTree).toHaveBeenCalledTimes(1);
  });
});
