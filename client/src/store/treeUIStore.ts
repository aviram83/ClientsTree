import { create } from 'zustand';
import { TreeNode } from '../api/types';
import { findNodeInTree } from '../lib/treeUtils';
import { useTreeStore } from './treeStore';

interface TreeUIState {
  isModalOpen: boolean;
  modalAction: 'add' | 'edit' | null;
  currentNode: TreeNode | null;
  openAddModal: (parentId: string) => void;
  openEditModal: (nodeId: string) => void;
  closeModal: () => void;
  requestDelete: (nodeId: string) => Promise<void>;
}

export const useTreeUIStore = create<TreeUIState>((set) => ({
  isModalOpen: false,
  modalAction: null,
  currentNode: null,

  openAddModal: (parentId: string) => {
    set({ isModalOpen: true, modalAction: 'add', currentNode: { parentId } as TreeNode });
  },

  openEditModal: (nodeId: string) => {
    const nodeToEdit = findNodeInTree(useTreeStore.getState().tree, nodeId);
    if (nodeToEdit) {
      set({ isModalOpen: true, modalAction: 'edit', currentNode: nodeToEdit });
    }
  },

  closeModal: () => {
    set({ isModalOpen: false, modalAction: null, currentNode: null });
  },

  requestDelete: async (nodeId: string) => {
    if (window.confirm('Are you sure you want to delete this node?')) {
      await useTreeStore.getState().deleteNode(nodeId);
    }
  },
}));
