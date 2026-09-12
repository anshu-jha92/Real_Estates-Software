import { Router } from 'express';
import {
  listProperties,
  getFeaturedProperties,
  suggestProperties,
  getPropertyBySlug,
  createProperty,
  updateProperty,
  deleteProperty,
} from '../controllers/propertyController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

router.get('/', listProperties);
router.get('/featured', getFeaturedProperties); // must stay above /:slug
router.get('/suggest', suggestProperties); // must stay above /:slug
router.get('/:slug', getPropertyBySlug);

router.post('/', protect, adminOnly, createProperty);
router.put('/:id', protect, adminOnly, updateProperty);
router.delete('/:id', protect, adminOnly, deleteProperty);

export default router;
