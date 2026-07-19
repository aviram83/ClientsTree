import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { authMiddleware } from './auth';

vi.mock('jsonwebtoken');

const buildRes = () => {
  const res: Partial<Response> = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return res as Response;
};

describe('authMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls next() and attaches req.user for a valid token', () => {
    vi.mocked(jwt.verify).mockReturnValue({ userId: 'user-1' } as any);
    const req = { header: vi.fn().mockReturnValue('Bearer valid-token') } as unknown as Request & { user?: any };
    const res = buildRes();
    const next: NextFunction = vi.fn();

    authMiddleware(req as any, res, next);

    expect(req.user).toEqual({ userId: 'user-1' });
    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 401 when no Authorization header is present', () => {
    const req = { header: vi.fn().mockReturnValue(undefined) } as unknown as Request;
    const res = buildRes();
    const next: NextFunction = vi.fn();

    authMiddleware(req as any, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'No token, authorization denied' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when the token is invalid', () => {
    vi.mocked(jwt.verify).mockImplementation(() => {
      throw new Error('invalid token');
    });
    const req = { header: vi.fn().mockReturnValue('Bearer bad-token') } as unknown as Request;
    const res = buildRes();
    const next: NextFunction = vi.fn();

    authMiddleware(req as any, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Token is not valid' });
    expect(next).not.toHaveBeenCalled();
  });
});
