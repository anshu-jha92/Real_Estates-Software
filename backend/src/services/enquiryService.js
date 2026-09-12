/**
 * Enquiry (lead) business logic.
 *
 * This is the service most likely to grow: email and WhatsApp notifications,
 * CRM hand-off and duplicate-lead detection all belong here, not in the
 * controller, so the HTTP layer never has to change again.
 */
import Enquiry, { ENQUIRY_STATUSES } from '../models/Enquiry.js';
import Property from '../models/Property.js';
import { buildPagination, paginated, escapeRegex } from '../utils/apiFeatures.js';
import { badRequest, notFound } from '../utils/AppError.js';
import { notifyOwner, sendEnquirerReply } from './mailService.js';

const missing = () => notFound('Enquiry not found.');

const toNumberOrNull = (value) => (value === '' || value == null ? null : Number(value));

/**
 * Record a lead.
 * `meta` carries request context (ip, userAgent) that only the controller knows.
 */
export async function createEnquiry(input = {}, meta = {}) {
  const payload = {
    name: input.name,
    phone: input.phone,
    email: input.email,
    subject: input.subject,
    message: input.message,
    propertySlug: input.propertySlug,
    propertyTitle: input.propertyTitle,
    budgetMin: toNumberOrNull(input.budgetMin),
    budgetMax: toNumberOrNull(input.budgetMax),
    interestedIn: input.interestedIn,
    source: input.source || 'website',
    ip: meta.ip,
    userAgent: meta.userAgent || '',
  };

  // Only trust a property reference that actually exists, and copy its title in
  // so the admin inbox stays readable even if the listing is later removed.
  if (input.propertyId) {
    const property = await Property.findById(input.propertyId)
      .select('title slug')
      .lean()
      .catch(() => null);

    if (property) {
      payload.propertyId = property._id;
      payload.propertySlug = property.slug;
      payload.propertyTitle = property.title;
    }
  }

  const enquiry = await Enquiry.create(payload);
  const doc = enquiry.toObject();

  // Fire-and-forget emails: send to owner and to enquirer if email provided.
  // Errors are logged but don't fail the enquiry creation.
  notifyOwner(doc).catch((err) => console.error('[enquiry] Mail to owner failed:', err.message));
  sendEnquirerReply(doc).catch((err) =>
    console.error('[enquiry] Mail to enquirer failed:', err.message)
  );

  return enquiry;
}

/** Admin inbox: newest first, with per-status counts for the filter tabs. */
export async function listEnquiries(query = {}) {
  const { page, limit, skip } = buildPagination({ ...query, limit: query.limit || 20 });

  const filter = {};
  if (query.status && ENQUIRY_STATUSES.includes(query.status)) filter.status = query.status;
  if (query.search) {
    const rx = new RegExp(escapeRegex(String(query.search)), 'i');
    filter.$or = [{ name: rx }, { phone: rx }, { email: rx }, { propertyTitle: rx }];
  }

  const [data, total, counts] = await Promise.all([
    Enquiry.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Enquiry.countDocuments(filter),
    Enquiry.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]),
  ]);

  return {
    ...paginated(data, { page, limit, total }),
    counts: Object.fromEntries(
      ENQUIRY_STATUSES.map((s) => [s, counts.find((c) => c._id === s)?.n || 0])
    ),
  };
}

/** Change status and/or the internal note. */
export async function updateEnquiry(id, changes = {}) {
  const updates = {};

  if (changes.status !== undefined) {
    if (!ENQUIRY_STATUSES.includes(changes.status)) {
      throw badRequest('Invalid status.', {
        status: `Status must be one of: ${ENQUIRY_STATUSES.join(', ')}`,
      });
    }
    updates.status = changes.status;
  }
  if (changes.note !== undefined) updates.note = changes.note;

  const enquiry = await Enquiry.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  }).lean();

  if (!enquiry) throw missing();
  return enquiry;
}

export async function deleteEnquiry(id) {
  const enquiry = await Enquiry.findByIdAndDelete(id).lean();
  if (!enquiry) throw missing();
  return { _id: enquiry._id };
}
