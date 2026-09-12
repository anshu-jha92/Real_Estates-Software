/**
 * Media uploads (Cloudinary).
 *
 * The API secret never leaves the server: the browser posts the file to
 * /api/media/upload, this service signs and forwards it. That is why there is no
 * unsigned upload preset and no Cloudinary key in the frontend bundle.
 *
 * Every upload is capped at 2000px on the long edge and delivered through
 * `f_auto,q_auto` so Cloudinary serves WebP/AVIF to browsers that accept it and
 * falls back to JPEG for the rest. The stored URL is the delivery URL, so the
 * conversion happens once and the database never holds a raw original.
 */
import { v2 as cloudinary } from 'cloudinary';
import { badRequest } from '../utils/AppError.js';

const FOLDER = process.env.CLOUDINARY_FOLDER || 'rama-kripa';

/** Delivery transformation baked into every stored URL. */
const DELIVERY = 'f_auto,q_auto';

/** Longest edge kept on the stored original. Bigger than any layout needs. */
const MAX_EDGE = 2000;

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

export const ALLOWED_MIME = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
  'application/pdf', // brochures
];

let configured = false;

/** True when all three credentials are present, so routes can 503 politely. */
export function isConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

function client() {
  if (!isConfigured()) {
    throw badRequest(
      'Image uploads are not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to backend/.env.'
    );
  }
  if (!configured) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    configured = true;
  }
  return cloudinary;
}

/**
 * Insert the delivery transformation into a Cloudinary URL.
 * `.../upload/v123/x.jpg` -> `.../upload/f_auto,q_auto/v123/x.jpg`
 */
function toDeliveryUrl(secureUrl, resourceType) {
  if (resourceType !== 'image' || !secureUrl.includes('/upload/')) return secureUrl;
  return secureUrl.replace('/upload/', `/upload/${DELIVERY}/`);
}

/**
 * Upload one file buffer.
 * @param {{buffer: Buffer, mimetype: string, originalname: string, size: number}} file
 * @param {{folder?: string}} options
 */
export function uploadImage(file, { folder } = {}) {
  if (!file?.buffer?.length) throw badRequest('No file received.');

  if (!ALLOWED_MIME.includes(file.mimetype)) {
    throw badRequest(`"${file.mimetype}" is not an accepted file type.`, {
      file: 'Upload a JPG, PNG, WebP, AVIF, GIF or PDF.',
    });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw badRequest('That file is too large.', {
      file: `Maximum size is ${MAX_UPLOAD_BYTES / 1024 / 1024} MB.`,
    });
  }

  const isPdf = file.mimetype === 'application/pdf';

  return new Promise((resolve, reject) => {
    const stream = client().uploader.upload_stream(
      {
        folder: [FOLDER, folder].filter(Boolean).join('/'),
        resource_type: isPdf ? 'raw' : 'image',
        // Cap the stored original. `limit` never upscales and keeps the aspect ratio.
        ...(isPdf
          ? {}
          : {
              transformation: [
                { width: MAX_EDGE, height: MAX_EDGE, crop: 'limit' },
                { quality: 'auto:good' },
              ],
            }),
        use_filename: true,
        unique_filename: true,
        overwrite: false,
      },
      (error, result) => {
        if (error || !result) {
          return reject(badRequest(error?.message || 'Cloudinary rejected the upload.'));
        }
        resolve({
          url: toDeliveryUrl(result.secure_url, result.resource_type),
          originalUrl: result.secure_url,
          publicId: result.public_id,
          resourceType: result.resource_type,
          format: result.format,
          width: result.width,
          height: result.height,
          bytes: result.bytes,
        });
      }
    );

    stream.end(file.buffer);
  });
}

/** Upload several files, preserving input order. */
export function uploadMany(files = [], options) {
  if (!files.length) throw badRequest('No files received.');
  return Promise.all(files.map((file) => uploadImage(file, options)));
}

/**
 * Remove an asset. Only ever called with a publicId this account owns, and a
 * missing asset is treated as success so deleting twice is harmless.
 */
export async function deleteAsset(publicId, resourceType = 'image') {
  if (!publicId) throw badRequest('publicId is required.');

  const result = await client().uploader.destroy(publicId, { resource_type: resourceType });

  if (result.result !== 'ok' && result.result !== 'not found') {
    throw badRequest(`Could not delete that file (${result.result}).`);
  }
  return { publicId, result: result.result };
}
