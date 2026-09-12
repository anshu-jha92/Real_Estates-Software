/** Client testimonial business logic. */
import Testimonial from '../models/Testimonial.js';
import { escapeRegex } from '../utils/apiFeatures.js';
import { notFound } from '../utils/AppError.js';

const missing = () => notFound('That testimonial was not found.');

/** Public list is active-only; the admin table passes `all=true` to see hidden ones too. */
export async function listTestimonials(query = {}, isAdmin = false) {
  const filter = isAdmin && query.all === 'true' ? {} : { isActive: true };

  if (query.search) {
    const rx = new RegExp(escapeRegex(query.search), 'i');
    filter.$or = [{ name: rx }, { message: rx }, { locality: rx }, { propertyTitle: rx }];
  }

  const data = await Testimonial.find(filter).sort({ order: 1, createdAt: -1 }).lean();
  return { success: true, data, total: data.length };
}

export async function createTestimonial(payload) {
  return Testimonial.create(payload);
}

export async function updateTestimonial(id, payload = {}) {
  const doc = await Testimonial.findById(id);
  if (!doc) throw missing();

  const { _id, createdAt, updatedAt, ...updates } = payload;
  doc.set(updates);
  await doc.save();

  return doc;
}

export async function deleteTestimonial(id) {
  const doc = await Testimonial.findByIdAndDelete(id).lean();
  if (!doc) throw missing();
  return { _id: doc._id };
}
