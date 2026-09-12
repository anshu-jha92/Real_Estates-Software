/**
 * HTTP adapter for catalogue reference data.
 * Logic lives in services/catalogService.js.
 */
import asyncHandler from '../middleware/asyncHandler.js';
import * as catalogService from '../services/catalogService.js';

/** GET /api/meta/filters - everything the UI dropdowns need. */
export const getFilters = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await catalogService.getFilters() });
});

/** GET /api/meta/stats - live counters for the category strip and stats band. */
export const getStats = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await catalogService.getStats() });
});

/** GET /api/localities - locality cards with a live listing count. */
export const getLocalities = asyncHandler(async (req, res) => {
  const data = await catalogService.getLocalities();
  res.json({ success: true, data, total: data.length });
});

/** GET /api/developers */
export const getDevelopers = asyncHandler(async (req, res) => {
  const data = await catalogService.getDevelopers();
  res.json({ success: true, data, total: data.length });
});

/** GET /api/testimonials */
export const getTestimonials = asyncHandler(async (req, res) => {
  const data = await catalogService.getTestimonials();
  res.json({ success: true, data, total: data.length });
});
