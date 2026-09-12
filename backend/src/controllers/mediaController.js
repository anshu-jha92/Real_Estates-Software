/** HTTP adapter for uploads. Logic lives in services/mediaService.js. */
import asyncHandler from '../middleware/asyncHandler.js';
import * as mediaService from '../services/mediaService.js';

/** GET /api/media/status [admin] - lets the UI hide the upload button when unconfigured. */
export const getStatus = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      configured: mediaService.isConfigured(),
      maxBytes: mediaService.MAX_UPLOAD_BYTES,
      accepts: mediaService.ALLOWED_MIME,
    },
  });
});

/** POST /api/media/upload [admin] - multipart, field name `file` (or `files` for many). */
export const upload = asyncHandler(async (req, res) => {
  const files = req.files?.length ? req.files : [req.file].filter(Boolean);
  const data = await mediaService.uploadMany(files, { folder: req.body?.folder });

  res.status(201).json({
    success: true,
    message: data.length === 1 ? 'File uploaded.' : `${data.length} files uploaded.`,
    data: data.length === 1 ? data[0] : data,
    files: data,
  });
});

/** DELETE /api/media?publicId=&resourceType= [admin] */
export const remove = asyncHandler(async (req, res) => {
  const { publicId, resourceType } = { ...req.query, ...req.body };
  const data = await mediaService.deleteAsset(publicId, resourceType || 'image');
  res.json({ success: true, message: 'File deleted.', data });
});
