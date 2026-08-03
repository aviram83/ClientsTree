import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { register, login, getProfile, forgotPassword, resetPassword } from './auth.controller';
import prisma from '../db';
import { emailService } from '../services/email.service';

vi.mock('../db', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
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

vi.mock('../services/email.service', () => ({
  emailService: {
    sendPasswordResetEmail: vi.fn(),
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

  describe('forgotPassword', () => {
    it('returns the generic message and sends an email when the user is found', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-1',
        email: 'jane@example.com',
      } as any);
      vi.mocked(prisma.user.update).mockResolvedValue({} as any);
      vi.mocked(emailService.sendPasswordResetEmail).mockResolvedValue(undefined);

      const req = { body: { email: 'jane@example.com' } } as any;
      const res = buildRes();

      await forgotPassword(req, res);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: expect.objectContaining({ resetTokenHash: expect.any(String), resetTokenExpiresAt: expect.any(Date) }),
      });
      expect(emailService.sendPasswordResetEmail).toHaveBeenCalledWith(
        'jane@example.com',
        expect.stringContaining('/reset-password?token='),
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'If that email is registered, a reset link has been sent.' });
    });

    it('returns the identical generic message and does not send an email when the user is not found', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const req = { body: { email: 'nobody@example.com' } } as any;
      const res = buildRes();

      await forgotPassword(req, res);

      expect(prisma.user.update).not.toHaveBeenCalled();
      expect(emailService.sendPasswordResetEmail).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'If that email is registered, a reset link has been sent.' });
    });

    it('returns 400 when the email is missing', async () => {
      const req = { body: {} } as any;
      const res = buildRes();

      await forgotPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('issuing a second reset invalidates the first token', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-1',
        email: 'jane@example.com',
      } as any);
      vi.mocked(emailService.sendPasswordResetEmail).mockResolvedValue(undefined);

      const capturedHashes: string[] = [];
      vi.mocked(prisma.user.update).mockImplementation((async (args: any) => {
        capturedHashes.push(args.data.resetTokenHash);
        return {} as any;
      }) as any);

      const req1 = { body: { email: 'jane@example.com' } } as any;
      await forgotPassword(req1, buildRes());

      const req2 = { body: { email: 'jane@example.com' } } as any;
      await forgotPassword(req2, buildRes());

      expect(capturedHashes).toHaveLength(2);
      expect(capturedHashes[0]).not.toEqual(capturedHashes[1]);
    });

    it('still returns 200 with the generic message when the email send rejects', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-1',
        email: 'jane@example.com',
      } as any);
      vi.mocked(prisma.user.update).mockResolvedValue({} as any);
      vi.mocked(emailService.sendPasswordResetEmail).mockRejectedValue(new Error('SMTP down'));

      const req = { body: { email: 'jane@example.com' } } as any;
      const res = buildRes();

      await forgotPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'If that email is registered, a reset link has been sent.' });
    });

    it('returns 500 when the database lookup throws', async () => {
      vi.mocked(prisma.user.findUnique).mockRejectedValue(new Error('DB down'));

      const req = { body: { email: 'jane@example.com' } } as any;
      const res = buildRes();

      await forgotPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('resetPassword', () => {
    it('updates the password and clears the token fields for a valid unexpired token', async () => {
      vi.mocked(prisma.user.findFirst).mockResolvedValue({ id: 'user-1' } as any);
      vi.mocked(bcrypt.hash).mockResolvedValue('new-hashed-password' as never);
      vi.mocked(prisma.user.update).mockResolvedValue({} as any);

      const req = { body: { token: 'raw-token', password: 'newpass' } } as any;
      const res = buildRes();

      await resetPassword(req, res);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { password: 'new-hashed-password', resetTokenHash: null, resetTokenExpiresAt: null },
      });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('returns 400 with a generic message for an expired or invalid token', async () => {
      vi.mocked(prisma.user.findFirst).mockResolvedValue(null);

      const req = { body: { token: 'raw-token', password: 'newpass' } } as any;
      const res = buildRes();

      await resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid or expired reset link' });
    });

    it('returns 400 for an invalid token without distinguishing from expired', async () => {
      vi.mocked(prisma.user.findFirst).mockResolvedValue(null);

      const req = { body: { token: 'bogus-token', password: 'newpass' } } as any;
      const res = buildRes();

      await resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid or expired reset link' });
    });

    it('returns 400 when the password is under 6 characters', async () => {
      const req = { body: { token: 'raw-token', password: 'abc' } } as any;
      const res = buildRes();

      await resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(prisma.user.findFirst).not.toHaveBeenCalled();
    });

    it('returns 400 when token or password is missing', async () => {
      const req = { body: { password: 'newpass' } } as any;
      const res = buildRes();

      await resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Token and password are required',
      });
      expect(prisma.user.findFirst).not.toHaveBeenCalled();
    });

    it('returns 500 when the database lookup throws', async () => {
      vi.mocked(prisma.user.findFirst).mockRejectedValue(new Error('DB down'));

      const req = { body: { token: 'raw-token', password: 'newpass' } } as any;
      const res = buildRes();

      await resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
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
