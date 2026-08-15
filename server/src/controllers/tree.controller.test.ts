import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Response } from 'express';
import { getTree, addNode, updateNode, deleteNode } from './tree.controller';
import prisma from '../db';

vi.mock('../db', () => ({
  default: {
    treeNode: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

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

    it('rejects a SUPERVISOR with a non-LEVEL_4 percentageLevel without calling Prisma', async () => {
      const req = {
        user: { userId: 'user-1' },
        body: { name: 'Node', status: 'SUPERVISOR', percentageLevel: 'LEVEL_2' },
      } as any;
      const res = buildRes();

      await addNode(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(prisma.treeNode.create).not.toHaveBeenCalled();
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
  });

  describe('updateNode', () => {
    it('rejects an invalid status without calling Prisma', async () => {
      const req = { params: { id: 'node-1' }, body: { status: 'NOT_A_STATUS' } } as any;
      const res = buildRes();

      await updateNode(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(prisma.treeNode.update).not.toHaveBeenCalled();
    });

    it('sanitizes description before calling Prisma', async () => {
      vi.mocked(prisma.treeNode.update).mockResolvedValue({ id: 'node-1' } as any);
      const req = {
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
        params: { id: 'node-1' },
        body: { percentageLevel: 'NOT_A_LEVEL' },
      } as any;
      const res = buildRes();

      await updateNode(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(prisma.treeNode.update).not.toHaveBeenCalled();
    });

    it('rejects setting status to SUPERVISOR with a non-LEVEL_4 percentageLevel', async () => {
      vi.mocked(prisma.treeNode.findUnique).mockResolvedValue({
        id: 'node-1',
        status: 'CLIENT',
        percentageLevel: 'LEVEL_2',
      } as any);
      const req = {
        params: { id: 'node-1' },
        body: { status: 'SUPERVISOR', percentageLevel: 'LEVEL_2' },
      } as any;
      const res = buildRes();

      await updateNode(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(prisma.treeNode.update).not.toHaveBeenCalled();
    });

    it('rejects changing percentageLevel away from LEVEL_4 on an existing SUPERVISOR node', async () => {
      vi.mocked(prisma.treeNode.findUnique).mockResolvedValue({
        id: 'node-1',
        status: 'SUPERVISOR',
        percentageLevel: 'LEVEL_4',
      } as any);
      const req = {
        params: { id: 'node-1' },
        body: { percentageLevel: 'LEVEL_2' },
      } as any;
      const res = buildRes();

      await updateNode(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(prisma.treeNode.update).not.toHaveBeenCalled();
    });

    it('accepts setting status to SUPERVISOR with LEVEL_4', async () => {
      vi.mocked(prisma.treeNode.update).mockResolvedValue({ id: 'node-1' } as any);
      const req = {
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
      vi.mocked(prisma.treeNode.findUnique).mockResolvedValue({
        id: 'node-1',
        status: 'SUPERVISOR',
        percentageLevel: 'LEVEL_4',
      } as any);
      vi.mocked(prisma.treeNode.update).mockResolvedValue({ id: 'node-1' } as any);
      const req = {
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

    it('rejects explicitly nulling percentageLevel on an existing SUPERVISOR node', async () => {
      vi.mocked(prisma.treeNode.findUnique).mockResolvedValue({
        id: 'node-1',
        status: 'SUPERVISOR',
        percentageLevel: 'LEVEL_4',
      } as any);
      const req = {
        params: { id: 'node-1' },
        body: { percentageLevel: null },
      } as any;
      const res = buildRes();

      await updateNode(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(prisma.treeNode.update).not.toHaveBeenCalled();
    });

    it('returns 404 when updating status/percentageLevel on a node that no longer exists', async () => {
      vi.mocked(prisma.treeNode.findUnique).mockResolvedValue(null);
      const req = {
        params: { id: 'gone' },
        body: { percentageLevel: 'LEVEL_2' },
      } as any;
      const res = buildRes();

      await updateNode(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(prisma.treeNode.update).not.toHaveBeenCalled();
    });

    it('allows an unrelated field update (e.g. name) without a status/percentageLevel lookup', async () => {
      vi.mocked(prisma.treeNode.update).mockResolvedValue({ id: 'node-1' } as any);
      const req = {
        params: { id: 'node-1' },
        body: { name: 'Renamed' },
      } as any;
      const res = buildRes();

      await updateNode(req, res);

      expect(prisma.treeNode.findUnique).not.toHaveBeenCalled();
      expect(prisma.treeNode.update).toHaveBeenCalledWith({
        where: { id: 'node-1' },
        data: expect.objectContaining({ name: 'Renamed' }),
      });
    });
  });

  describe('deleteNode', () => {
    it('deletes the node scoped to its id', async () => {
      vi.mocked(prisma.treeNode.findUnique).mockResolvedValue({ id: 'node-1', parentId: 'root' } as any);
      vi.mocked(prisma.treeNode.delete).mockResolvedValue({} as any);
      const req = { params: { id: 'node-1' } } as any;
      const res = buildRes();

      await deleteNode(req, res);

      expect(prisma.treeNode.delete).toHaveBeenCalledWith({ where: { id: 'node-1' } });
      expect(res.status).toHaveBeenCalledWith(204);
    });

    it('refuses to delete the root node', async () => {
      vi.mocked(prisma.treeNode.findUnique).mockResolvedValue({ id: 'root', parentId: null } as any);
      const req = { params: { id: 'root' } } as any;
      const res = buildRes();

      await deleteNode(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(prisma.treeNode.delete).not.toHaveBeenCalled();
    });
  });
});
