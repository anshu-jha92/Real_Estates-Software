import { Router } from 'express';
import {
  listLocalities,
  createLocality,
  updateLocality,
  deleteLocality,
} from '../controllers/localityController.js';
import { protect, adminOnly, attachUser } from '../middleware/auth.js';

const router = Router();

router.get('/', attachUser, listLocalities);

router.post('/', protect, adminOnly, createLocality);
router.put('/:id', protect, adminOnly, updateLocality);
router.delete('/:id', protect, adminOnly, deleteLocality);

export default router;
