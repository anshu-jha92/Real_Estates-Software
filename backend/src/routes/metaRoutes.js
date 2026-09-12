import { Router } from 'express';
import { getFilters, getStats, getDevelopers } from '../controllers/metaController.js';

const router = Router();

router.get('/meta/filters', getFilters);
router.get('/meta/stats', getStats);

// Developer tie-ups change a few times a year, so they stay developer-managed
// (seed only). Localities and testimonials moved to their own admin-writable routers.
router.get('/developers', getDevelopers);

export default router;
