/**
 * HTTP adapter for properties: read the request, call the service, shape the
 * response. All listing logic lives in services/propertyService.js.
 */
import asyncHandler from '../middleware/asyncHandler.js';
import * as propertyService from '../services/propertyService.js';

/**
 * GET /api/properties
 * ?search,category,listingType,propertyType,status,city,locality,minPrice,maxPrice,
 *  bedrooms,minArea,maxArea,featured,trending,sort,page,limit
 */
export const listProperties = asyncHandler(async (req, res) => {
  res.json(await propertyService.listProperties(req.query));
});

/** GET /api/properties/featured?limit= */
export const getFeaturedProperties = asyncHandler(async (req, res) => {
  res.json(await propertyService.listFeatured({ limit: req.query.limit }));
});

/** GET /api/properties/:slug  (a Mongo id also works) */
export const getPropertyBySlug = asyncHandler(async (req, res) => {
  const { data, similar } = await propertyService.getPropertyBySlug(req.params.slug);
  res.json({ success: true, data, similar });
});

/** POST /api/properties [admin] */
export const createProperty = asyncHandler(async (req, res) => {
  const data = await propertyService.createProperty(req.body);
  res.status(201).json({ success: true, message: 'Property created.', data });
});

/** PUT /api/properties/:id [admin] */
export const updateProperty = asyncHandler(async (req, res) => {
  const data = await propertyService.updateProperty(req.params.id, req.body);
  res.json({ success: true, message: 'Property updated.', data });
});

/** DELETE /api/properties/:id [admin] */
export const deleteProperty = asyncHandler(async (req, res) => {
  const data = await propertyService.deleteProperty(req.params.id);
  res.json({ success: true, message: 'Property deleted.', data });
});

/** GET /api/properties/suggest?q= - type-ahead for the search box. */
export const suggestProperties = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await propertyService.suggest(req.query.q) });
});
