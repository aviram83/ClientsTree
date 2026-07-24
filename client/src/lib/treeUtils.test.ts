import { describe, it, expect } from 'vitest';
import { findNodeInTree } from './treeUtils';
import { TreeNode } from '../api/types';
import { ClientStatus } from '../config/statusConfig';

const makeNode = (overrides: Partial<TreeNode>): TreeNode => ({
  id: 'id',
  name: 'name',
  status: ClientStatus.CLIENT,
  userId: 'user-1',
  parentId: null,
  active: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  children: [],
  ...overrides,
});

describe('findNodeInTree', () => {
  it('finds a top-level node by id', () => {
    const tree = [makeNode({ id: 'a' }), makeNode({ id: 'b' })];

    expect(findNodeInTree(tree, 'b')).toBe(tree[1]);
  });

  it('finds a deeply nested node by id', () => {
    const grandchild = makeNode({ id: 'grandchild' });
    const child = makeNode({ id: 'child', children: [grandchild] });
    const tree = [makeNode({ id: 'root', children: [child] })];

    expect(findNodeInTree(tree, 'grandchild')).toBe(grandchild);
  });

  it('returns null when the id is not present', () => {
    const tree = [makeNode({ id: 'a' })];

    expect(findNodeInTree(tree, 'missing')).toBeNull();
  });

  it('returns null for an empty tree', () => {
    expect(findNodeInTree([], 'anything')).toBeNull();
  });
});
