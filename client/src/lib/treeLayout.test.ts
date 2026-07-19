import { describe, it, expect, vi } from 'vitest';
import { buildFlowGraph, getLayoutedElements } from './treeLayout';
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

const callbacks = { onAdd: vi.fn(), onEdit: vi.fn(), onDelete: vi.fn() };

describe('buildFlowGraph', () => {
  it('produces one node per tree node and one edge per parent-child link', () => {
    const tree: TreeNode[] = [
      makeNode({
        id: 'root',
        name: 'Root',
        children: [
          makeNode({ id: 'child-1', name: 'Child 1', parentId: 'root', createdAt: '2024-01-01T00:00:00.000Z' }),
          makeNode({ id: 'child-2', name: 'Child 2', parentId: 'root', createdAt: '2024-02-01T00:00:00.000Z' }),
        ],
      }),
    ];

    const { nodes, edges } = buildFlowGraph(tree, '', callbacks);

    expect(nodes).toHaveLength(3);
    expect(edges).toHaveLength(2);
    expect(edges.map((e) => e.id)).toEqual(['e-root-child-2', 'e-root-child-1']);
  });

  it('orders sibling edges by createdAt descending (newest first)', () => {
    const tree: TreeNode[] = [
      makeNode({
        id: 'root',
        children: [
          makeNode({ id: 'older', createdAt: '2024-01-01T00:00:00.000Z' }),
          makeNode({ id: 'newer', createdAt: '2024-06-01T00:00:00.000Z' }),
        ],
      }),
    ];

    const { edges } = buildFlowGraph(tree, '', callbacks);

    expect(edges[0].target).toBe('newer');
    expect(edges[1].target).toBe('older');
  });

  it('dims nodes whose name does not match the search query', () => {
    const tree: TreeNode[] = [
      makeNode({ id: 'a', name: 'Alpha' }),
      makeNode({ id: 'b', name: 'Beta' }),
    ];

    const { nodes } = buildFlowGraph(tree, 'alp', callbacks);

    const alpha = nodes.find((n) => n.id === 'a')!;
    const beta = nodes.find((n) => n.id === 'b')!;

    expect(alpha.data.isDimmed).toBe(false);
    expect(beta.data.isDimmed).toBe(true);
  });

  it('does not dim any node when the search query is empty', () => {
    const tree: TreeNode[] = [makeNode({ id: 'a', name: 'Alpha' })];

    const { nodes } = buildFlowGraph(tree, '', callbacks);

    expect(nodes[0].data.isDimmed).toBe(false);
  });
});

describe('getLayoutedElements', () => {
  it('assigns a distinct position to each node', () => {
    const nodes = [
      { id: 'root', type: 'custom', position: { x: 0, y: 0 }, data: {} as any },
      { id: 'child', type: 'custom', position: { x: 0, y: 0 }, data: {} as any },
    ];
    const edges = [{ id: 'e-root-child', source: 'root', target: 'child' }];

    const { nodes: layoutedNodes } = getLayoutedElements(nodes, edges, { direction: 'TB' });

    const root = layoutedNodes.find((n) => n.id === 'root')!;
    const child = layoutedNodes.find((n) => n.id === 'child')!;

    expect(root.position).not.toEqual(child.position);
    // In a top-to-bottom layout the child should be positioned below the root.
    expect(child.position.y).toBeGreaterThan(root.position.y);
  });
});
