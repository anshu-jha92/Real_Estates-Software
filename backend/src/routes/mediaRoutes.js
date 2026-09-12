import { Router } from 'express';
import multer from 'multer';
import { getStatus, upload, remove } from '../controllers/mediaController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { MAX_UPLOAD_BYTES, ALLOWED_MIME } from '../services/mediaService.js';

/**
 * Files are held in memory and streamed straight to Cloudinary, so nothing ever
 * lands on the server's disk. The type check runs here as well as in the service
 * so an oversized or wrong-typed file is rejected before it is fully buffered.
 */
const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES, files: 12 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME.includes(file.mimetype)) return cb(null, true);
    const err = new Error('Upload a JPG, PNG, WebP, AVIF, GIF or PDF.');
    err.statusCode = 400;
    cb(err);
  },
});

const router = Router();

router.use(protect, adminOnly);

router.get('/status', getStatus);
router.post('/upload', uploadMiddleware.array('files', 12), upload);
router.delete('/', remove);

export default router;
