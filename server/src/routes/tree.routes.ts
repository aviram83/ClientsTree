
import { Router } from 'express';
import { getTree, addNode, updateNode, deleteNode, moveNode } from '../controllers/tree.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', getTree);
router.post('/', addNode);
router.put('/:id', updateNode);
router.patch('/:id/move', moveNode);
router.delete('/:id', deleteNode);

export default router;
