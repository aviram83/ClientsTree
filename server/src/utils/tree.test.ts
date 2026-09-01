import { describe, it, expect, vi, beforeEach } from 'vitest';
import { findOwnedNode, wouldCreateCycle } from './tree';
import prisma from '../db';

vi.mock('../db', () => ({
  default: {
    treeNode: {
      findFirst: vi.fn(),
    },
  },
}));

describe('findOwnedNode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('scopes the lookup to both id and userId', async () => {
    vi.mocked(prisma.treeNode.findFirst).mockResolvedValue({ id: 'node-1', userId: 'user-1' } as any);

    await findOwnedNode('node-1', 'user-1');

    expect(prisma.treeNode.findFirst).toHaveBeenCalledWith({ where: { id: 'node-1', userId: 'user-1' } });
  });

  it('resolves the node when it belongs to the requesting user', async () => {
    vi.mocked(prisma.treeNode.findFirst).mockResolvedValue({ id: 'node-1', userId: 'user-1' } as any);

    const result = await findOwnedNode('node-1', 'user-1');

    expect(result).toEqual({ id: 'node-1', userId: 'user-1' });
  });

  it('resolves null when the node belongs to another user', async () => {
    vi.mocked(prisma.treeNode.findFirst).mockResolvedValue(null);

    const result = await findOwnedNode('node-1', 'attacker');

    expect(result).toBeNull();
  });

  it('resolves null when the node does not exist', async () => {
    vi.mocked(prisma.treeNode.findFirst).mockResolvedValue(null);

    const result = await findOwnedNode('gone', 'user-1');

    expect(result).toBeNull();
  });
});

describe('wouldCreateCycle', () => {
  // root -> a -> b -> c
  //      -> d
  const nodes = [
    { id: 'root', parentId: null },
    { id: 'a', parentId: 'root' },
    { id: 'b', parentId: 'a' },
    { id: 'c', parentId: 'b' },
    { id: 'd', parentId: 'root' },
  ];

  it('rejects moving a node under itself (self-move)', () => {
    expect(wouldCreateCycle('a', 'a', nodes)).toBe(true);
  });

  it('rejects moving a node under its own descendant (descendant-move)', () => {
    expect(wouldCreateCycle('a', 'c', nodes)).toBe(true);
  });

  it('allows moving a node under an unrelated, non-descendant node', () => {
    expect(wouldCreateCycle('a', 'd', nodes)).toBe(false);
  });

  it('allows moving a node back under its current parent (no-op)', () => {
    expect(wouldCreateCycle('b', 'a', nodes)).toBe(false);
  });
});
