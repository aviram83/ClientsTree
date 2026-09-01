import { create } from 'zustand';
import { TreeNode } from '../api/types';
import * as api from '../api';
import { useAuthStore } from './authStore';

interface TreeState {
  tree: TreeNode[];
  isLoading: boolean;
  fetchTree: () => Promise<void>;
  addNode: (data: any) => Promise<void>;
  updateNode: (id: string, data: any) => Promise<void>;
  deleteNode: (id: string) => Promise<void>;
  moveNode: (id: string, newParentId: string) => Promise<void>;
}

export const useTreeStore = create<TreeState>((set, get) => ({
  tree: [],
  isLoading: false,

  fetchTree: async () => {
    const tokenAtStart = useAuthStore.getState().token;
    if (!tokenAtStart) return;
    set({ isLoading: true });
    try {
      const response = await api.fetchTree();
      // Discard if the session changed (logout, or a different user logged in)
      // while this request was in flight — otherwise a slow response can land
      // after logout and overwrite the store with the wrong user's tree.
      if (useAuthStore.getState().token !== tokenAtStart) return;
      set({ tree: response.data });
    } catch (error) {
      console.error('Failed to fetch tree', error);
    } finally {
      set({ isLoading: false });
    }
  },

  // add/update/delete/move all propagate errors (no catch-and-swallow) so
  // callers (and, ultimately, the api.ts interceptor's error modal) see
  // failures instead of a silent no-op. addNode used to be the outlier here.
  addNode: async (data: any) => {
    set({ isLoading: true });
    try {
      await api.addNode(data);
      await get().fetchTree(); // Refetch the whole tree to get updates
    } finally {
      set({ isLoading: false });
    }
  },

  updateNode: async (id: string, data: any) => {
    set({ isLoading: true });
    try {
      await api.updateNode(id, data);
      await get().fetchTree(); // Refetch to see changes
    } finally {
      set({ isLoading: false });
    }
  },

  deleteNode: async (id: string) => {
    set({ isLoading: true });
    try {
      await api.deleteNode(id);
      await get().fetchTree(); // Refetch to update the tree
    } finally {
      set({ isLoading: false });
    }
  },

  moveNode: async (id: string, newParentId: string) => {
    set({ isLoading: true });
    try {
      await api.moveNode(id, newParentId);
      await get().fetchTree(); // Refetch so the relocated subtree shows in its new place
    } finally {
      set({ isLoading: false });
    }
  },
}));

// Clear the tree on logout — otherwise the previous user's data stays in this
// module-level store (unlike the old Context, which reset for free on unmount).
useAuthStore.subscribe((state, prevState) => {
  if (prevState.token && !state.token) {
    useTreeStore.setState({ tree: [] });
  }
});
