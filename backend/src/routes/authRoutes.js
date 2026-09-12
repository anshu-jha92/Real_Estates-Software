import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login, getMe, updateMe } from '../controllers/authController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

/** Slows down password guessing without locking out a forgetful admin. */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (req, res) =>
    res.status(429).json({
      success: false,
      message: 'Too many sign-in attempts. Please try again in 15 minutes.',
    }),
});

/**
 * Guards the current-password check on the account form. It sits AFTER protect
 * so a flood of anonymous requests cannot burn through the real admin's budget.
 */
const accountLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (req, res) =>
    res.status(429).json({
      success: false,
      message: 'Too many attempts. Please try again in 15 minutes.',
    }),
});

router.post('/login', loginLimiter, login);
router.get('/me', protect, adminOnly, getMe);
router.put('/me', protect, adminOnly, accountLimiter, updateMe);

export default router;
