
import { Router } from 'express';
import { register, login, getProfile, updateProfile, forgotPassword, resetPassword } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', authMiddleware, getProfile);
router.patch('/me', authMiddleware, updateProfile);

export default router;
