import { Router } from 'express';
import mongoose from 'mongoose';
import { isDbConnected } from '../config/db.js';
import propertyRoutes from './propertyRoutes.js';
import enquiryRoutes from './enquiryRoutes.js';
import blogRoutes from './blogRoutes.js';
import metaRoutes from './metaRoutes.js';
import authRoutes from './authRoutes.js';
import settingRoutes from './settingRoutes.js';
import mediaRoutes from './mediaRoutes.js';
import localityRoutes from './localityRoutes.js';
import testimonialRoutes from './testimonialRoutes.js';
import teamRoutes from './teamRoutes.js';

const router = Router();

const DB_STATES = ['disconnected', 'connected', 'connecting', 'disconnecting'];

/** GET /api/health - answers even when MongoDB is down. */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Rama Kripa Estates API is running.',
    db: DB_STATES[mongoose.connection.readyState] || 'unknown',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// Mounted above the database guard: an upload goes straight to Cloudinary and
// does not need Mongo, so it must keep working even if the database hiccups.
router.use('/media', mediaRoutes);

/**
 * Without a database, fail fast with an empty list instead of letting Mongoose
 * buffer for 10 seconds. The frontend renders its empty state and stays usable.
 */
router.use((req, res, next) => {
  if (isDbConnected()) return next();
  res.status(503).json({
    success: false,
    message: 'The database is unavailable right now. Please try again in a moment.',
    data: [],
    page: 1,
    pages: 1,
    total: 0,
    limit: 12,
  });
});

router.use('/properties', propertyRoutes);
router.use('/enquiries', enquiryRoutes);
router.use('/blogs', blogRoutes);
router.use('/auth', authRoutes);
router.use('/settings', settingRoutes);
router.use('/localities', localityRoutes);
router.use('/testimonials', testimonialRoutes);
router.use('/team', teamRoutes);
router.use('/', metaRoutes); // /meta/filters, /meta/stats, /developers

export default router;
