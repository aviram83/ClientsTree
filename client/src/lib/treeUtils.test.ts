import { describe, it, expect } from 'vitest';
import { countActiveMyClients, findNodeInTree, isDirectChildOfRoot } from './treeUtils';
import { TreeNode } from '../api/types';
import { ClientStatus } from '../config/statusConfig';

const makeNode = (overrides: Partial<TreeNode>): TreeNode => ({
  id: 'id',
  name: 'name',
  status: ClientStatus.CLIENT,
  userId: 'user-1',
  parentId: null,
  active: true,
  myClient: false,
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

describe('countActiveMyClients', () => {
  it('excludes the root even when it is flagged active and myClient', () => {
    const tree = [makeNode({ id: 'root', active: true, myClient: true })];

    expect(countActiveMyClients(tree)).toBe(0);
  });

  it('counts only nodes that are both active and myClient', () => {
    const tree = [
      makeNode({
        id: 'root',
        children: [
          makeNode({ id: 'both', parentId: 'root', active: true, myClient: true }),
          makeNode({ id: 'inactive-mine', parentId: 'root', active: false, myClient: true }),
          makeNode({ id: 'active-not-mine', parentId: 'root', active: true, myClient: false }),
        ],
      }),
    ];

    expect(countActiveMyClients(tree)).toBe(1);
  });

  it('counts nested descendants', () => {
    const grandchild = makeNode({ id: 'grandchild', parentId: 'child', active: true, myClient: true });
    const child = makeNode({ id: 'child', parentId: 'root', active: true, myClient: true, children: [grandchild] });
    const tree = [makeNode({ id: 'root', children: [child] })];

    expect(countActiveMyClients(tree)).toBe(2);
  });

  it('returns 0 for an empty tree', () => {
    expect(countActiveMyClients([])).toBe(0);
  });
});

describe('isDirectChildOfRoot', () => {
  const grandchild = makeNode({ id: 'grandchild', parentId: 'child' });
  const child = makeNode({ id: 'child', parentId: 'root', children: [grandchild] });
  const tree = [makeNode({ id: 'root', children: [child] })];

  it('is true for a parentId equal to the root id', () => {
    expect(isDirectChildOfRoot(tree, 'root')).toBe(true);
  });

  it('is false for a deeper parent (a grandchild of the root)', () => {
    expect(isDirectChildOfRoot(tree, 'child')).toBe(false);
  });

  it('is false for an empty tree', () => {
    expect(isDirectChildOfRoot([], 'root')).toBe(false);
  });

  it('is false for an undefined parentId', () => {
    expect(isDirectChildOfRoot(tree, undefined)).toBe(false);
  });
});
