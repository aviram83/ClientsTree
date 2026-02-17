
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import treeRoutes from './routes/tree.routes';
import prisma from './db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', async (req: Request, res: Response) => {
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
});

// Request logger middleware for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (Object.keys(req.body).length > 0) {
    console.log('Request Body:', req.body);
  }
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/tree', treeRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
