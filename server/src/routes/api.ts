import { Router } from 'express';
import authRoutes from './auth.routes';
import treeRoutes from './tree.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/tree', treeRoutes);

export default router;
