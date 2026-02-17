import { Router } from 'express';
import healthRoutes from './health.routes';
import apiRoutes from './api';

const router = Router();

router.use('/health', healthRoutes);
router.use('/api', apiRoutes);

export default router;
