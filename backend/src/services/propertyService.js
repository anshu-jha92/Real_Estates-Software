/**
 * Property business logic.
 *
 * Knows about listings and Mongo; knows nothing about HTTP. Controllers pass
 * plain objects in and get plain data out. When something is wrong the service
 * throws an AppError rather than writing a response.
 */
import mongoose from 'mongoose';
import Property from '../models/Property.js';
import { buildPropertyQuery, paginated, escapeRegex } from '../utils/apiFeatures.js';
import { notFound } from '../utils/AppError.js';

const SIMILAR_LIMIT = 4;

const missing = () => notFound('That property is no longer listed.');

/** Paginated search across every filter the listings page offers. */
export async function listProperties(query = {}) {
  const { filter, sort, page, limit, skip } = await buildPropertyQuery(query);

  const [data, total] = await Promise.all([
    Property.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Property.countDocuments(filter),
  ]);

  return paginated(data, { page, limit, total });
}

/** Home-page carousel: featured listings in curated order. */
export async function listFeatured({ limit } = {}) {
  const take = Math.min(24, Math.max(1, parseInt(limit, 10) || 6));

  const data = await Property.find({ isActive: true, isFeatured: true })
    .sort({ order: 1, createdAt: -1 })
    .limit(take)
    .lean();

  return { success: true, data, total: data.length, limit: take };
}

/**
 * Listings to show under a property: same category, same locality first, then
 * anything else in that category to make the row up.
 */
async function findSimilar(property) {
  const base = { isActive: true, category: property.category };
  const exclude = [property._id];

  let similar = property.location?.locality
    ? await Property.find({
        ...base,
        _id: { $nin: exclude },
        'location.locality': property.location.locality,
      })
        .sort({ isFeatured: -1, views: -1 })
        .limit(SIMILAR_LIMIT)
        .lean()
    : [];

  if (similar.length < SIMILAR_LIMIT) {
    const fill = await Property.find({
      ...base,
      _id: { $nin: [...exclude, ...similar.map((s) => s._id)] },
    })
      .sort({ isFeatured: -1, views: -1 })
      .limit(SIMILAR_LIMIT - similar.length)
      .lean();
    similar = [...similar, ...fill];
  }

  return similar;
}

/** Detail page. Accepts a slug or a Mongo id. Throws 404 when unknown. */
export async function getPropertyBySlug(slug) {
  const byId = mongoose.isValidObjectId(slug) ? [{ _id: slug }] : [];

  const property = await Property.findOne({ $or: [{ slug }, ...byId] }).lean();
  if (!property) throw missing();

  // Fire and forget - a failed counter must never break the page.
  Property.updateOne({ _id: property._id }, { $inc: { views: 1 } }).catch(() => {});
  property.views = (property.views || 0) + 1;

  return { data: property, similar: await findSimilar(property) };
}

export async function createProperty(payload) {
  return Property.create(payload);
}

/** Assign then save, so the slug and thumbnail hooks run. */
export async function updateProperty(id, payload = {}) {
  const property = await Property.findById(id);
  if (!property) throw missing();

  const { _id, createdAt, updatedAt, ...updates } = payload;
  property.set(updates);
  await property.save();

  return property;
}

export async function deleteProperty(id) {
  const property = await Property.findByIdAndDelete(id).lean();
  if (!property) throw missing();
  return { _id: property._id };
}

const SUGGEST_MIN_CHARS = 2;
const SUGGEST_PER_GROUP = 6;

const clean = (list) => [...new Set(list.map((v) => String(v || '').trim()).filter(Boolean))];

/**
 * "Sector 84, Neharpar, Faridabad" -> ["sector", "84", "neharpar", "faridabad"].
 * Single letters are dropped; single digits are kept because "3 BHK" needs the 3.
 */
const tokenize = (term) =>
  term
    .toLowerCase()
    .split(/[\s,/|-]+/)
    .map((t) => t.trim())
    .filter((t) => t && (t.length >= 2 || /^\d$/.test(t)));

/**
 * A short reference value (a locality, a builder) counts as a hit when it
 * contains what was typed ("neha" -> Neharpar) OR when what was typed contains
 * it — that is what makes a pasted address line light up every part of itself.
 */
const matchesEitherWay = (value, term, tokens) => {
  const v = value.toLowerCase();
  if (v.includes(term)) return true;
  if (term.includes(v)) return true;
  return tokens.length > 1 && tokens.every((t) => v.includes(t));
};

/**
 * Type-ahead for the site search box. Everything comes from live, active
 * listings, so a locality or builder only appears while something is on the
 * books there. `?locality=` on the results page matches either a locality or a
 * sector name, which is why the two are folded into one group here.
 */
export async function suggest(q = '') {
  const term = String(q || '').trim().toLowerCase();
  const empty = { localities: [], projects: [], developers: [], propertyTypes: [] };
  if (term.length < SUGGEST_MIN_CHARS) return empty;

  const tokens = tokenize(term);
  if (!tokens.length) return empty;

  const ACTIVE = { isActive: true };
  const PROJECT_FIELDS = [
    'title',
    'location.locality',
    'location.sector',
    'location.city',
    'developer',
    'propertyType',
  ];

  // Every token must land in at least one field, so a pasted address line
  // ("Sector 84, Neharpar, Faridabad") finds the listing whose sector, locality
  // and city are those three things, and nothing that only shares one of them.
  const tokenFilter = tokens.map((t) => {
    const rx = new RegExp(escapeRegex(t), 'i');
    return { $or: PROJECT_FIELDS.map((field) => ({ [field]: rx })) };
  });

  const [projects, localities, sectors, developers, propertyTypes] = await Promise.all([
    Property.find({ ...ACTIVE, $and: tokenFilter })
      .select('title slug')
      .sort({ isFeatured: -1, createdAt: -1 })
      .limit(SUGGEST_PER_GROUP)
      .lean(),
    // Reference lists are tiny (tens of values), so they are matched in memory
    // where the "either direction" rule is easy to express.
    Property.distinct('location.locality', ACTIVE),
    Property.distinct('location.sector', ACTIVE),
    Property.distinct('developer', ACTIVE),
    Property.distinct('propertyType', ACTIVE),
  ]);

  const pickRefs = (list) =>
    clean(list)
      .filter((v) => matchesEitherWay(v, term, tokens))
      .sort()
      .slice(0, SUGGEST_PER_GROUP);

  return {
    localities: pickRefs([...localities, ...sectors]),
    projects: projects.map((p) => ({ title: p.title, slug: p.slug })),
    developers: pickRefs(developers),
    propertyTypes: pickRefs(propertyTypes),
  };
}
