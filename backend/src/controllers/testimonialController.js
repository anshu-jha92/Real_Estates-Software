/** HTTP adapter for testimonials. Logic lives in services/testimonialService.js. */
import asyncHandler from '../middleware/asyncHandler.js';
import * as testimonialService from '../services/testimonialService.js';

/** GET /api/testimonials?all,search */
export const listTestimonials = asyncHandler(async (req, res) => {
  res.json(await testimonialService.listTestimonials(req.query, req.user?.role === 'admin'));
});

/** POST /api/testimonials [admin] */
export const createTestimonial = asyncHandler(async (req, res) => {
  const data = await testimonialService.createTestimonial(req.body);
  res.status(201).json({ success: true, message: 'Testimonial added.', data });
});

/** PUT /api/testimonials/:id [admin] */
export const updateTestimonial = asyncHandler(async (req, res) => {
  const data = await testimonialService.updateTestimonial(req.params.id, req.body);
  res.json({ success: true, message: 'Testimonial updated.', data });
});

/** DELETE /api/testimonials/:id [admin] */
export const deleteTestimonial = asyncHandler(async (req, res) => {
  const data = await testimonialService.deleteTestimonial(req.params.id);
  res.json({ success: true, message: 'Testimonial deleted.', data });
});
