/** HTTP adapter for site settings. Logic lives in services/settingService.js. */
import asyncHandler from '../middleware/asyncHandler.js';
import * as settingService from '../services/settingService.js';

/** GET /api/settings - always returns a usable document, even before seeding. */
export const getSettings = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await settingService.getSettings() });
});

/** PUT /api/settings [admin] */
export const updateSettings = asyncHandler(async (req, res) => {
  const data = await settingService.updateSettings(req.body || {});
  res.json({ success: true, message: 'Settings saved.', data });
});
