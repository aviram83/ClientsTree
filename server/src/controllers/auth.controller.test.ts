import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { register, login, getProfile } from './auth.controller';
import prisma from '../db';

vi.mock('../db', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    treeNode: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(),
  },
}));

const buildRes = () => {
  const res: Partial<Response> = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return res as Response;
};

describe('auth.controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('hashes the password and creates a new user with a root node', async () => {
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed-password' as never);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.create).mockResolvedValue({
        id: 'user-1',
        firstName: 'Jane',
        lastName: 'Doe',
      } as any);
      vi.mocked(prisma.treeNode.create).mockResolvedValue({} as any);

      const req = {
        body: { email: 'jane@example.com', password: 'pw', firstName: 'Jane', lastName: 'Doe' },
      } as any;
      const res = buildRes();

      await register(req, res);

      expect(bcrypt.hash).toHaveBeenCalledWith('pw', 10);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ email: 'jane@example.com', password: 'hashed-password' }),
      });
      expect(prisma.treeNode.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('login', () => {
    it('returns a signed JWT on valid credentials', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-1',
        email: 'jane@example.com',
        password: 'hashed-password',
        firstName: 'Jane',
        lastName: 'Doe',
      } as any);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      vi.mocked(jwt.sign).mockReturnValue('signed-token' as never);

      const req = { body: { email: 'jane@example.com', password: 'pw' } } as any;
      const res = buildRes();

      await login(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ token: 'signed-token', user: expect.objectContaining({ id: 'user-1' }) }),
      );
    });

    it('returns 401 on an invalid password', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-1',
        email: 'jane@example.com',
        password: 'hashed-password',
      } as any);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      const req = { body: { email: 'jane@example.com', password: 'wrong' } } as any;
      const res = buildRes();

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
    });
  });

  describe('getProfile', () => {
    it('returns the authenticated user', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-1',
        email: 'jane@example.com',
        firstName: 'Jane',
        lastName: 'Doe',
        language: 'en',
      } as any);

      const req = { user: { userId: 'user-1' } } as any;
      const res = buildRes();

      await getProfile(req, res);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: { id: true, email: true, firstName: true, lastName: true, language: true },
      });
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: 'user-1' }));
    });
  });
});
