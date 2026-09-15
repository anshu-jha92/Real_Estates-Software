import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  createEnquiry,
  listEnquiries,
  updateEnquiry,
  deleteEnquiry,
  replyToEnquiry,
} from '../controllers/enquiryController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

/** 5 enquiries per 10 minutes per IP - POST only, so the admin inbox stays usable. */
const enquiryLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (req, res) =>
    res.status(429).json({
      success: false,
      message:
        'You have sent several enquiries already. Please wait about 10 minutes or call us on +91 98110 00000.',
    }),
});

router.post('/', enquiryLimiter, createEnquiry);

router.get('/', protect, adminOnly, listEnquiries);
router.patch('/:id', protect, adminOnly, updateEnquiry);
router.post('/:id/reply', protect, adminOnly, replyToEnquiry);
router.delete('/:id', protect, adminOnly, deleteEnquiry);

export default router;
