/** HTTP adapter for localities. Logic lives in services/localityService.js. */
import asyncHandler from '../middleware/asyncHandler.js';
import * as localityService from '../services/localityService.js';

/** GET /api/localities?all */
export const listLocalities = asyncHandler(async (req, res) => {
  res.json(await localityService.listLocalities(req.query, req.user?.role === 'admin'));
});

/** POST /api/localities [admin] */
export const createLocality = asyncHandler(async (req, res) => {
  const data = await localityService.createLocality(req.body);
  res.status(201).json({ success: true, message: 'Locality added.', data });
});

/** PUT /api/localities/:id [admin] */
export const updateLocality = asyncHandler(async (req, res) => {
  const data = await localityService.updateLocality(req.params.id, req.body);
  res.json({ success: true, message: 'Locality updated.', data });
});

/** DELETE /api/localities/:id [admin] */
export const deleteLocality = asyncHandler(async (req, res) => {
  const data = await localityService.deleteLocality(req.params.id);
  res.json({ success: true, message: 'Locality deleted.', data });
});
