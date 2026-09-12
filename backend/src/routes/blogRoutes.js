import { Router } from 'express';
import {
  listBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
} from '../controllers/blogController.js';
import { protect, adminOnly, attachUser } from '../middleware/auth.js';

const router = Router();

router.get('/', attachUser, listBlogs);
router.get('/:slug', getBlogBySlug);

router.post('/', protect, adminOnly, createBlog);
router.put('/:id', protect, adminOnly, updateBlog);
router.delete('/:id', protect, adminOnly, deleteBlog);

export default router;
