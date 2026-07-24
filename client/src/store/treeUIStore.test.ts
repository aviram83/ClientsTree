import { describe, it, expect, vi, beforeEach } from 'vitest';

const deleteNode = vi.fn();

vi.mock('./treeStore', () => ({
  useTreeStore: {
    getState: () => ({
      tree: [
        { id: 'root', name: 'Root', children: [{ id: 'child', name: 'Child', children: [] }] },
      ],
      deleteNode,
    }),
  },
}));

import { useTreeUIStore } from './treeUIStore';

const initialState = useTreeUIStore.getState();

describe('treeUIStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useTreeUIStore.setState(initialState, true);
  });

  it('openAddModal opens the modal in add mode with the given parentId', () => {
    useTreeUIStore.getState().openAddModal('root');

    const state = useTreeUIStore.getState();
    expect(state.isModalOpen).toBe(true);
    expect(state.modalAction).toBe('add');
    expect(state.currentNode).toEqual({ parentId: 'root' });
  });

  it('openEditModal looks up the node in treeStore and opens the modal in edit mode', () => {
    useTreeUIStore.getState().openEditModal('child');

    const state = useTreeUIStore.getState();
    expect(state.isModalOpen).toBe(true);
    expect(state.modalAction).toBe('edit');
    expect(state.currentNode).toEqual({ id: 'child', name: 'Child', children: [] });
  });

  it('openEditModal is a no-op when the node id is not found', () => {
    useTreeUIStore.getState().openEditModal('missing');

    const state = useTreeUIStore.getState();
    expect(state.isModalOpen).toBe(false);
    expect(state.currentNode).toBeNull();
  });

  it('closeModal resets all modal state', () => {
    useTreeUIStore.getState().openAddModal('root');

    useTreeUIStore.getState().closeModal();

    const state = useTreeUIStore.getState();
    expect(state.isModalOpen).toBe(false);
    expect(state.modalAction).toBeNull();
    expect(state.currentNode).toBeNull();
  });

  it('requestDelete calls treeStore.deleteNode when the user confirms', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    await useTreeUIStore.getState().requestDelete('child');

    expect(deleteNode).toHaveBeenCalledWith('child');
  });

  it('requestDelete does not call deleteNode when the user cancels', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    await useTreeUIStore.getState().requestDelete('child');

    expect(deleteNode).not.toHaveBeenCalled();
  });
});
