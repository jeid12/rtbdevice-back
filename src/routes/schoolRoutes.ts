import { Router } from 'express';
import { schoolController } from '../controllers/schoolController';

const router = Router();

router.post('/', schoolController.create);
router.get('/', schoolController.getAll);
router.get('/:id', schoolController.getById);
router.put('/:id', schoolController.update);
router.delete('/:id', schoolController.delete);

export default router;
