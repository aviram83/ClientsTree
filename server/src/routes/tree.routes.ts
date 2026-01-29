
import { Router } from 'express';
import { getTree, addNode, updateNode, deleteNode } from '../controllers/tree.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', getTree);
router.post('/', addNode);
router.put('/:id', updateNode);
router.delete('/:id', deleteNode);

export default router;
