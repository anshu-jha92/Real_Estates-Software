/** HTTP adapter for enquiries. Logic lives in services/enquiryService.js. */
import asyncHandler from '../middleware/asyncHandler.js';
import * as enquiryService from '../services/enquiryService.js';

/** POST /api/enquiries - public, rate limited to 5 per 10 minutes per IP. */
export const createEnquiry = asyncHandler(async (req, res) => {
  await enquiryService.createEnquiry(req.body || {}, {
    ip: req.ip,
    userAgent: req.get('user-agent') || '',
  });

  res.status(201).json({
    success: true,
    message: 'Thank you. Our Faridabad advisory team will call you shortly.',
  });
});

/** GET /api/enquiries?status,search,page,limit [admin] */
export const listEnquiries = asyncHandler(async (req, res) => {
  res.json(await enquiryService.listEnquiries(req.query));
});

/** PATCH /api/enquiries/:id { status, note } [admin] */
export const updateEnquiry = asyncHandler(async (req, res) => {
  const data = await enquiryService.updateEnquiry(req.params.id, req.body || {});
  res.json({ success: true, message: 'Enquiry updated.', data });
});

/** DELETE /api/enquiries/:id [admin] */
export const deleteEnquiry = asyncHandler(async (req, res) => {
  const data = await enquiryService.deleteEnquiry(req.params.id);
  res.json({ success: true, message: 'Enquiry deleted.', data });
});

/** POST /api/enquiries/:id/reply [admin] { message } - email the visitor back. */
export const replyToEnquiry = asyncHandler(async (req, res) => {
  const data = await enquiryService.replyToEnquiry(req.params.id, req.body || {}, req.user?.name || '');
  res.json({ success: true, message: `Reply sent to ${data.email}.`, data });
});
