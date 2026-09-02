import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Response } from 'express';
import { Prisma } from '@prisma/client';
import { getTree, addNode, updateNode, deleteNode, moveNode } from './tree.controller';
import prisma from '../db';

vi.mock('../db', () => ({
  default: {
    treeNode: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}));

const knownRequestError = (code: string) =>
  new Prisma.PrismaClientKnownRequestError('boom', { code, clientVersion: 'test' });

const buildRes = () => {
  const res: Partial<Response> = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  };
  return res as Response;
};

describe('tree.controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTree', () => {
    it('returns the user-scoped tree built from flat nodes', async () => {
      vi.mocked(prisma.treeNode.findMany).mockResolvedValue([
        { id: 'root', parentId: null, name: 'Root' },
        { id: 'child', parentId: 'root', name: 'Child' },
      ] as any);
      const req = { user: { userId: 'user-1' } } as any;
      const res = buildRes();

      await getTree(req, res);

      expect(prisma.treeNode.findMany).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
      expect(res.json).toHaveBeenCalledWith([
        expect.objectContaining({ id: 'root', children: [expect.objectContaining({ id: 'child' })] }),
      ]);
    });
  });

  describe('addNode', () => {
    it('returns 401 when the request has no authenticated user', async () => {
      const req = { body: { name: 'Node', status: 'CLIENT' } } as any;
      const res = buildRes();

      await addNode(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(prisma.treeNode.findFirst).not.toHaveBeenCalled();
      expect(prisma.treeNode.create).not.toHaveBeenCalled();
    });

    it('rejects an invalid status without calling Prisma', async () => {
      const req = { user: { userId: 'user-1' }, body: { status: 'NOT_A_STATUS' } } as any;
      const res = buildRes();

      await addNode(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(prisma.treeNode.create).not.toHaveBeenCalled();
    });

    it('sanitizes description before calling Prisma', async () => {
      vi.mocked(prisma.treeNode.create).mockResolvedValue({ id: 'new-node' } as any);
      const req = {
        user: { userId: 'user-1' },
        body: { name: 'Node', status: 'CLIENT', description: '<script>alert(1)</script>hi' },
      } as any;
      const res = buildRes();

      await addNode(req, res);

      expect(prisma.treeNode.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ description: '&lt;script&gt;alert(1)&lt;/script&gt;hi' }),
      });
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('rejects an invalid percentageLevel without calling Prisma', async () => {
      const req = {
        user: { userId: 'user-1' },
        body: { name: 'Node', status: 'CLIENT', percentageLevel: 'LEVEL_5' },
      } as any;
      const res = buildRes();

      await addNode(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(prisma.treeNode.create).not.toHaveBeenCalled();
    });

    it('passes a valid percentageLevel through to Prisma', async () => {
      vi.mocked(prisma.treeNode.create).mockResolvedValue({ id: 'new-node' } as any);
      const req = {
        user: { userId: 'user-1' },
        body: { name: 'Node', status: 'CLIENT', percentageLevel: 'LEVEL_2' },
      } as any;
      const res = buildRes();

      await addNode(req, res);

      expect(prisma.treeNode.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ percentageLevel: 'LEVEL_2' }),
      });
    });

    it('accepts a SUPERVISOR with a non-LEVEL_4 percentageLevel (no longer restricted)', async () => {
      vi.mocked(prisma.treeNode.create).mockResolvedValue({ id: 'new-node' } as any);
      const req = {
        user: { userId: 'user-1' },
        body: { name: 'Node', status: 'SUPERVISOR', percentageLevel: 'LEVEL_2' },
      } as any;
      const res = buildRes();

      await addNode(req, res);

      expect(prisma.treeNode.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ status: 'SUPERVISOR', percentageLevel: 'LEVEL_2' }),
      });
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('accepts a SUPERVISOR with LEVEL_4', async () => {
      vi.mocked(prisma.treeNode.create).mockResolvedValue({ id: 'new-node' } as any);
      const req = {
        user: { userId: 'user-1' },
        body: { name: 'Node', status: 'SUPERVISOR', percentageLevel: 'LEVEL_4' },
      } as any;
      const res = buildRes();

      await addNode(req, res);

      expect(prisma.treeNode.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ status: 'SUPERVISOR', percentageLevel: 'LEVEL_4' }),
      });
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('returns 404 when parentId belongs to another user', async () => {
      vi.mocked(prisma.treeNode.findFirst).mockResolvedValue(null);
      const req = {
        user: { userId: 'user-1' },
        body: { name: 'Node', status: 'CLIENT', parentId: 'someone-elses-node' },
      } as any;
      const res = buildRes();

      await addNode(req, res);

      expect(prisma.treeNode.findFirst).toHaveBeenCalledWith({
        where: { id: 'someone-elses-node', userId: 'user-1' },
      });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(prisma.treeNode.create).not.toHaveBeenCalled();
    });

    it('allows a parentId that belongs to the requesting user', async () => {
      vi.mocked(prisma.treeNode.findFirst).mockResolvedValue({ id: 'my-node', userId: 'user-1' } as any);
      vi.mocked(prisma.treeNode.create).mockResolvedValue({ id: 'new-node' } as any);
      const req = {
        user: { userId: 'user-1' },
        body: { name: 'Node', status: 'CLIENT', parentId: 'my-node' },
      } as any;
      const res = buildRes();

      await addNode(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('rejects creating a second root node (parentId omitted) when one already exists', async () => {
      vi.mocked(prisma.treeNode.findFirst).mockResolvedValue({ id: 'existing-root', userId: 'user-1', parentId: null } as any);
      const req = {
        user: { userId: 'user-1' },
        body: { name: 'Second Root', status: 'CLIENT' },
      } as any;
      const res = buildRes();

      await addNode(req, res);

      expect(prisma.treeNode.findFirst).toHaveBeenCalledWith({ where: { userId: 'user-1', parentId: null } });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(prisma.treeNode.create).not.toHaveBeenCalled();
    });

    it('allows creating the first root node when none exists yet', async () => {
      vi.mocked(prisma.treeNode.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.treeNode.create).mockResolvedValue({ id: 'new-root' } as any);
      const req = {
        user: { userId: 'user-1' },
        body: { name: 'Root', status: 'CLIENT' },
      } as any;
      const res = buildRes();

      await addNode(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('updateNode', () => {
    it('returns 401 when the request has no authenticated user', async () => {
      const req = { params: { id: 'node-1' }, body: { name: 'Renamed' } } as any;
      const res = buildRes();

      await updateNode(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(prisma.treeNode.findFirst).not.toHaveBeenCalled();
      expect(prisma.treeNode.update).not.toHaveBeenCalled();
    });

    it('rejects an invalid status without calling Prisma', async () => {
      const req = { user: { userId: 'user-1' }, params: { id: 'node-1' }, body: { status: 'NOT_A_STATUS' } } as any;
      const res = buildRes();

      await updateNode(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(prisma.treeNode.update).not.toHaveBeenCalled();
    });

    it('sanitizes description before calling Prisma', async () => {
      vi.mocked(prisma.treeNode.findFirst).mockResolvedValue({ id: 'node-1', userId: 'user-1', status: 'CLIENT', percentageLevel: 'LEVEL_2' } as any);
      vi.mocked(prisma.treeNode.update).mockResolvedValue({ id: 'node-1' } as any);
      const req = {
        user: { userId: 'user-1' },
        params: { id: 'node-1' },
        body: { description: '<script>alert(1)</script>hi' },
      } as any;
      const res = buildRes();

      await updateNode(req, res);

      expect(prisma.treeNode.update).toHaveBeenCalledWith({
        where: { id: 'node-1' },
        data: expect.objectContaining({ description: '&lt;script&gt;alert(1)&lt;/script&gt;hi' }),
      });
    });

    it('rejects an invalid percentageLevel without calling Prisma', async () => {
      const req = {
        user: { userId: 'user-1' },
        params: { id: 'node-1' },
        body: { percentageLevel: 'NOT_A_LEVEL' },
      } as any;
      const res = buildRes();

      await updateNode(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(prisma.treeNode.update).not.toHaveBeenCalled();
    });

    it('accepts setting status to SUPERVISOR with a non-LEVEL_4 percentageLevel (no longer restricted)', async () => {
      vi.mocked(prisma.treeNode.findFirst).mockResolvedValue({
        id: 'node-1',
        userId: 'user-1',
        status: 'CLIENT',
        percentageLevel: 'LEVEL_2',
      } as any);
      vi.mocked(prisma.treeNode.update).mockResolvedValue({ id: 'node-1' } as any);
      const req = {
        user: { userId: 'user-1' },
        params: { id: 'node-1' },
        body: { status: 'SUPERVISOR', percentageLevel: 'LEVEL_2' },
      } as any;
      const res = buildRes();

      await updateNode(req, res);

      expect(prisma.treeNode.update).toHaveBeenCalledWith({
        where: { id: 'node-1' },
        data: expect.objectContaining({ status: 'SUPERVISOR', percentageLevel: 'LEVEL_2' }),
      });
      expect(res.status).not.toHaveBeenCalledWith(400);
    });

    it('accepts changing percentageLevel away from LEVEL_4 on an existing SUPERVISOR node (no longer restricted)', async () => {
      vi.mocked(prisma.treeNode.findFirst).mockResolvedValue({
        id: 'node-1',
        userId: 'user-1',
        status: 'SUPERVISOR',
        percentageLevel: 'LEVEL_4',
      } as any);
      vi.mocked(prisma.treeNode.update).mockResolvedValue({ id: 'node-1' } as any);
      const req = {
        user: { userId: 'user-1' },
        params: { id: 'node-1' },
        body: { percentageLevel: 'LEVEL_2' },
      } as any;
      const res = buildRes();

      await updateNode(req, res);

      expect(prisma.treeNode.update).toHaveBeenCalledWith({
        where: { id: 'node-1' },
        data: expect.objectContaining({ percentageLevel: 'LEVEL_2' }),
      });
      expect(res.status).not.toHaveBeenCalledWith(400);
    });

    it('accepts setting status to SUPERVISOR with LEVEL_4', async () => {
      vi.mocked(prisma.treeNode.findFirst).mockResolvedValue({
        id: 'node-1',
        userId: 'user-1',
        status: 'CLIENT',
        percentageLevel: 'LEVEL_4',
      } as any);
      vi.mocked(prisma.treeNode.update).mockResolvedValue({ id: 'node-1' } as any);
      const req = {
        user: { userId: 'user-1' },
        params: { id: 'node-1' },
        body: { status: 'SUPERVISOR', percentageLevel: 'LEVEL_4' },
      } as any;
      const res = buildRes();

      await updateNode(req, res);

      expect(prisma.treeNode.update).toHaveBeenCalledWith({
        where: { id: 'node-1' },
        data: expect.objectContaining({ status: 'SUPERVISOR', percentageLevel: 'LEVEL_4' }),
      });
    });

    it('allows demoting a SUPERVISOR to CLIENT while percentageLevel stays LEVEL_4', async () => {
      vi.mocked(prisma.treeNode.findFirst).mockResolvedValue({
        id: 'node-1',
        userId: 'user-1',
        status: 'SUPERVISOR',
        percentageLevel: 'LEVEL_4',
      } as any);
      vi.mocked(prisma.treeNode.update).mockResolvedValue({ id: 'node-1' } as any);
      const req = {
        user: { userId: 'user-1' },
        params: { id: 'node-1' },
        body: { status: 'CLIENT' },
      } as any;
      const res = buildRes();

      await updateNode(req, res);

      expect(prisma.treeNode.update).toHaveBeenCalledWith({
        where: { id: 'node-1' },
        data: expect.objectContaining({ status: 'CLIENT' }),
      });
      expect(res.status).not.toHaveBeenCalledWith(400);
    });

    it('accepts explicitly nulling percentageLevel on an existing SUPERVISOR node (no longer restricted)', async () => {
      vi.mocked(prisma.treeNode.findFirst).mockResolvedValue({
        id: 'node-1',
        userId: 'user-1',
        status: 'SUPERVISOR',
        percentageLevel: 'LEVEL_4',
      } as any);
      vi.mocked(prisma.treeNode.update).mockResolvedValue({ id: 'node-1' } as any);
      const req = {
        user: { userId: 'user-1' },
        params: { id: 'node-1' },
        body: { percentageLevel: null },
      } as any;
      const res = buildRes();

      await updateNode(req, res);

      expect(res.status).not.toHaveBeenCalledWith(400);
      expect(prisma.treeNode.update).toHaveBeenCalledWith({
        where: { id: 'node-1' },
        data: expect.objectContaining({ percentageLevel: null }),
      });
    });

    it('returns 404 when updating a node that no longer exists', async () => {
      vi.mocked(prisma.treeNode.findFirst).mockResolvedValue(null);
      const req = {
        user: { userId: 'user-1' },
        params: { id: 'gone' },
        body: { percentageLevel: 'LEVEL_2' },
      } as any;
      const res = buildRes();

      await updateNode(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(prisma.treeNode.update).not.toHaveBeenCalled();
    });

    it('returns 404 when updating a node that belongs to another user (IDOR)', async () => {
      vi.mocked(prisma.treeNode.findFirst).mockResolvedValue(null);
      const req = {
        user: { userId: 'attacker' },
        params: { id: 'victims-node' },
        body: { name: 'Hijacked' },
      } as any;
      const res = buildRes();

      await updateNode(req, res);

      expect(prisma.treeNode.findFirst).toHaveBeenCalledWith({
        where: { id: 'victims-node', userId: 'attacker' },
      });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(prisma.treeNode.update).not.toHaveBeenCalled();
    });

    it('scopes an unrelated field update (e.g. name) to the requesting user', async () => {
      vi.mocked(prisma.treeNode.findFirst).mockResolvedValue({ id: 'node-1', userId: 'user-1', status: 'CLIENT', percentageLevel: 'LEVEL_2' } as any);
      vi.mocked(prisma.treeNode.update).mockResolvedValue({ id: 'node-1' } as any);
      const req = {
        user: { userId: 'user-1' },
        params: { id: 'node-1' },
        body: { name: 'Renamed' },
      } as any;
      const res = buildRes();

      await updateNode(req, res);

      expect(prisma.treeNode.findFirst).toHaveBeenCalledWith({ where: { id: 'node-1', userId: 'user-1' } });
      expect(prisma.treeNode.update).toHaveBeenCalledWith({
        where: { id: 'node-1' },
        data: expect.objectContaining({ name: 'Renamed' }),
      });
    });
  });

  describe('deleteNode', () => {
    it('returns 401 when the request has no authenticated user', async () => {
      const req = { params: { id: 'node-1' } } as any;
      const res = buildRes();

      await deleteNode(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(prisma.treeNode.findFirst).not.toHaveBeenCalled();
      expect(prisma.treeNode.delete).not.toHaveBeenCalled();
    });

    it('deletes the node scoped to its id', async () => {
      vi.mocked(prisma.treeNode.findFirst).mockResolvedValue({ id: 'node-1', userId: 'user-1', parentId: 'root' } as any);
      vi.mocked(prisma.treeNode.delete).mockResolvedValue({} as any);
      const req = { user: { userId: 'user-1' }, params: { id: 'node-1' } } as any;
      const res = buildRes();

      await deleteNode(req, res);

      expect(prisma.treeNode.findFirst).toHaveBeenCalledWith({ where: { id: 'node-1', userId: 'user-1' } });
      expect(prisma.treeNode.delete).toHaveBeenCalledWith({ where: { id: 'node-1' } });
      expect(res.status).toHaveBeenCalledWith(204);
    });

    it('refuses to delete the root node', async () => {
      vi.mocked(prisma.treeNode.findFirst).mockResolvedValue({ id: 'root', userId: 'user-1', parentId: null } as any);
      const req = { user: { userId: 'user-1' }, params: { id: 'root' } } as any;
      const res = buildRes();

      await deleteNode(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(prisma.treeNode.delete).not.toHaveBeenCalled();
    });

    it('returns 404 when deleting a node that belongs to another user (IDOR)', async () => {
      vi.mocked(prisma.treeNode.findFirst).mockResolvedValue(null);
      const req = { user: { userId: 'attacker' }, params: { id: 'victims-node' } } as any;
      const res = buildRes();

      await deleteNode(req, res);

      expect(prisma.treeNode.findFirst).toHaveBeenCalledWith({ where: { id: 'victims-node', userId: 'attacker' } });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(prisma.treeNode.delete).not.toHaveBeenCalled();
    });
  });

  describe('moveNode', () => {
    it('returns 401 when the request has no authenticated user', async () => {
      const req = { params: { id: 'node-1' }, body: { newParentId: 'node-2' } } as any;
      const res = buildRes();

      await moveNode(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(prisma.treeNode.findFirst).not.toHaveBeenCalled();
    });

    it('rejects a missing newParentId', async () => {
      const req = { user: { userId: 'user-1' }, params: { id: 'node-1' }, body: {} } as any;
      const res = buildRes();

      await moveNode(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(prisma.treeNode.findFirst).not.toHaveBeenCalled();
    });

    it('returns 404 when the node to move is not found or not owned', async () => {
      vi.mocked(prisma.treeNode.findFirst).mockResolvedValueOnce(null);
      const req = { user: { userId: 'user-1' }, params: { id: 'gone' }, body: { newParentId: 'target' } } as any;
      const res = buildRes();

      await moveNode(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(prisma.treeNode.update).not.toHaveBeenCalled();
    });

    it('returns 404 when the moved node belongs to another user (IDOR)', async () => {
      vi.mocked(prisma.treeNode.findFirst).mockResolvedValueOnce(null);
      const req = { user: { userId: 'attacker' }, params: { id: 'victims-node' }, body: { newParentId: 'target' } } as any;
      const res = buildRes();

      await moveNode(req, res);

      expect(prisma.treeNode.findFirst).toHaveBeenCalledWith({ where: { id: 'victims-node', userId: 'attacker' } });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(prisma.treeNode.update).not.toHaveBeenCalled();
    });

    it('returns 404 when the target parent is not found or belongs to another user (IDOR)', async () => {
      vi.mocked(prisma.treeNode.findFirst)
        .mockResolvedValueOnce({ id: 'node-1', userId: 'user-1', parentId: 'root' } as any) // node
        .mockResolvedValueOnce(null); // target parent
      const req = { user: { userId: 'user-1' }, params: { id: 'node-1' }, body: { newParentId: 'someone-elses-node' } } as any;
      const res = buildRes();

      await moveNode(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(prisma.treeNode.update).not.toHaveBeenCalled();
    });

    it('rejects moving a node under itself (400)', async () => {
      vi.mocked(prisma.treeNode.findFirst)
        .mockResolvedValueOnce({ id: 'node-1', userId: 'user-1', parentId: 'root' } as any) // node
        .mockResolvedValueOnce({ id: 'node-1', userId: 'user-1', parentId: 'root' } as any); // target parent === node
      const req = { user: { userId: 'user-1' }, params: { id: 'node-1' }, body: { newParentId: 'node-1' } } as any;
      const res = buildRes();

      await moveNode(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(prisma.treeNode.update).not.toHaveBeenCalled();
    });

    it('rejects moving a node under one of its own descendants (400)', async () => {
      vi.mocked(prisma.treeNode.findFirst)
        .mockResolvedValueOnce({ id: 'a', userId: 'user-1', parentId: 'root' } as any) // node
        .mockResolvedValueOnce({ id: 'c', userId: 'user-1', parentId: 'b' } as any); // target parent
      vi.mocked(prisma.treeNode.findMany).mockResolvedValue([
        { id: 'root', parentId: null },
        { id: 'a', parentId: 'root' },
        { id: 'b', parentId: 'a' },
        { id: 'c', parentId: 'b' },
      ] as any);
      const req = { user: { userId: 'user-1' }, params: { id: 'a' }, body: { newParentId: 'c' } } as any;
      const res = buildRes();

      await moveNode(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(prisma.treeNode.update).not.toHaveBeenCalled();
    });

    it('moves the node under a valid, non-descendant target (happy path)', async () => {
      vi.mocked(prisma.treeNode.findFirst)
        .mockResolvedValueOnce({ id: 'a', userId: 'user-1', parentId: 'root' } as any) // node
        .mockResolvedValueOnce({ id: 'd', userId: 'user-1', parentId: 'root' } as any); // target parent
      vi.mocked(prisma.treeNode.findMany).mockResolvedValue([
        { id: 'root', parentId: null },
        { id: 'a', parentId: 'root' },
        { id: 'd', parentId: 'root' },
      ] as any);
      vi.mocked(prisma.treeNode.update).mockResolvedValue({ id: 'a', parentId: 'd' } as any);
      const req = { user: { userId: 'user-1' }, params: { id: 'a' }, body: { newParentId: 'd' } } as any;
      const res = buildRes();

      await moveNode(req, res);

      expect(prisma.treeNode.update).toHaveBeenCalledWith({ where: { id: 'a' }, data: { parentId: 'd' } });
      expect(res.json).toHaveBeenCalledWith({ id: 'a', parentId: 'd' });
    });

    it('returns 404 on a concurrent-delete race (Prisma P2025)', async () => {
      vi.mocked(prisma.treeNode.findFirst)
        .mockResolvedValueOnce({ id: 'a', userId: 'user-1', parentId: 'root' } as any)
        .mockResolvedValueOnce({ id: 'd', userId: 'user-1', parentId: 'root' } as any);
      vi.mocked(prisma.treeNode.findMany).mockResolvedValue([
        { id: 'root', parentId: null },
        { id: 'a', parentId: 'root' },
        { id: 'd', parentId: 'root' },
      ] as any);
      vi.mocked(prisma.treeNode.update).mockRejectedValue(knownRequestError('P2025'));
      const req = { user: { userId: 'user-1' }, params: { id: 'a' }, body: { newParentId: 'd' } } as any;
      const res = buildRes();

      await moveNode(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('returns 404 when the target parent is deleted mid-flight (Prisma P2003)', async () => {
      vi.mocked(prisma.treeNode.findFirst)
        .mockResolvedValueOnce({ id: 'a', userId: 'user-1', parentId: 'root' } as any)
        .mockResolvedValueOnce({ id: 'd', userId: 'user-1', parentId: 'root' } as any);
      vi.mocked(prisma.treeNode.findMany).mockResolvedValue([
        { id: 'root', parentId: null },
        { id: 'a', parentId: 'root' },
        { id: 'd', parentId: 'root' },
      ] as any);
      vi.mocked(prisma.treeNode.update).mockRejectedValue(knownRequestError('P2003'));
      const req = { user: { userId: 'user-1' }, params: { id: 'a' }, body: { newParentId: 'd' } } as any;
      const res = buildRes();

      await moveNode(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('returns 500 on an unexpected (non-Prisma-known) error', async () => {
      vi.mocked(prisma.treeNode.findFirst)
        .mockResolvedValueOnce({ id: 'a', userId: 'user-1', parentId: 'root' } as any)
        .mockResolvedValueOnce({ id: 'd', userId: 'user-1', parentId: 'root' } as any);
      vi.mocked(prisma.treeNode.findMany).mockResolvedValue([
        { id: 'root', parentId: null },
        { id: 'a', parentId: 'root' },
        { id: 'd', parentId: 'root' },
      ] as any);
      vi.mocked(prisma.treeNode.update).mockRejectedValue(new Error('boom'));
      const req = { user: { userId: 'user-1' }, params: { id: 'a' }, body: { newParentId: 'd' } } as any;
      const res = buildRes();

      await moveNode(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
