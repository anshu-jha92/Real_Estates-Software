/** Locality business logic. Public reads reuse the catalogue's live listing counts. */
import Locality from '../models/Locality.js';
import { getLocalities } from './catalogService.js';
import { notFound } from '../utils/AppError.js';

const missing = () => notFound('That locality was not found.');

/** Public list is active-only; the admin table passes `all=true` to see hidden ones too. */
export async function listLocalities(query = {}, isAdmin = false) {
  const data = await getLocalities({ includeInactive: isAdmin && query.all === 'true' });
  return { success: true, data, total: data.length };
}

export async function createLocality(payload) {
  return Locality.create(payload);
}

export async function updateLocality(id, payload = {}) {
  const doc = await Locality.findById(id);
  if (!doc) throw missing();

  // `count` is recomputed live on every read, so never trust a client-sent value.
  const { _id, createdAt, updatedAt, count, ...updates } = payload;
  doc.set(updates);
  await doc.save();

  return doc;
}

export async function deleteLocality(id) {
  const doc = await Locality.findByIdAndDelete(id).lean();
  if (!doc) throw missing();
  return { _id: doc._id };
}
