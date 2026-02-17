import { Request, Response } from 'express';
import prisma from '../db';

export const getHealthStatus = async (req: Request, res: Response) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    const uptime = process.uptime();
    const timestamp = new Date().toISOString();

    res.status(200).json({
      status: 'ok',
      timestamp,
      uptime,
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'error',
      message: 'Service Unavailable',
    });
  }
};
