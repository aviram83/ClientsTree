import { describe, it, expect, vi, beforeEach } from 'vitest';
import { findOwnedNode } from './tree';
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
