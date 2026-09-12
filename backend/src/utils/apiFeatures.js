import Locality from '../models/Locality.js';
import slugify from './slugify.js';

export const DEFAULT_LIMIT = 12;
export const MAX_LIMIT = 60;

/** Escape user input before it goes into a RegExp. */
export const escapeRegex = (value = '') => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Tolerant matcher: "sector-88", "Sector 88" and "sector 88" all hit the same docs.
 * Every non-alphanumeric run becomes "any separator", so slugs match display names.
 */
export const looseRegex = (value = '') =>
  new RegExp(String(value).trim().replace(/[^a-zA-Z0-9]+/g, '[^a-zA-Z0-9]*'), 'i');

const isTrue = (v) => v === true || v === 'true' || v === '1' || v === 'yes';
const isFalse = (v) => v === false || v === 'false' || v === '0' || v === 'no';

/** "residential,plots" -> ['residential','plots'] (also accepts repeated query keys). */
export const csv = (value) =>
  []
    .concat(value ?? [])
    .flatMap((v) => String(v).split(','))
    .map((v) => v.trim())
    .filter(Boolean);

const num = (value) => {
  const n = Number(String(value).replace(/[, ]/g, ''));
  return Number.isFinite(n) ? n : undefined;
};

/** Single value -> exact match, comma list -> $in. */
const oneOrMany = (value) => {
  const list = csv(value);
  if (!list.length) return undefined;
  return list.length === 1 ? list[0] : { $in: list };
};

/** Matches a locality term against both location.locality and location.sector. */
export const localityMatch = (terms) => {
  const list = csv(terms).map(looseRegex);
  if (!list.length) return null;
  return {
    $or: [{ 'location.locality': { $in: list } }, { 'location.sector': { $in: list } }],
  };
};

/**
 * A `locality` query value may be a Locality slug ("greater-faridabad") or a raw
 * sector name ("Sector 86"). If it resolves to a seeded Locality we expand it to
 * that locality's aliases, so one card covers a whole cluster of sectors.
 * Data driven - nothing about Faridabad is hardcoded here.
 */
export const resolveLocalityTerms = async (value) => {
  const raw = String(value || '').trim();
  if (!raw) return [];

  try {
    const doc = await Locality.findOne({
      $or: [{ slug: slugify(raw) }, { slug: raw.toLowerCase() }, { name: looseRegex(raw) }],
    })
      .select('name aliases')
      .lean();

    if (doc) return [doc.name, ...(doc.aliases || [])];
  } catch {
    /* DB down - fall back to the literal term below. */
  }
  return [raw];
};

/** Builds the Mongo filter for GET /api/properties from the query string. */
export const buildPropertyFilter = (query = {}, localityTerms = null) => {
  const and = [];
  const filter = {};

  // Public reads only see active listings; the admin panel can pass isActive=all.
  if (query.isActive === 'all') {
    /* no isActive constraint */
  } else if (isFalse(query.isActive)) {
    filter.isActive = false;
  } else {
    filter.isActive = true;
  }

  // Free text across the fields buyers actually type. $regex beats $text here
  // because it matches partial words ("nehar" finds "Neharpar").
  const search = String(query.search || query.q || '').trim();
  if (search) {
    const rx = new RegExp(escapeRegex(search), 'i');
    and.push({
      $or: [
        { title: rx },
        { developer: rx },
        { 'location.locality': rx },
        { 'location.sector': rx },
        { propertyType: rx },
      ],
    });
  }

  const category = oneOrMany(query.category);
  if (category) filter.category = category;

  const listingType = oneOrMany(query.listingType);
  if (listingType) filter.listingType = listingType;

  const propertyType = oneOrMany(query.propertyType);
  if (propertyType) filter.propertyType = propertyType;

  const status = oneOrMany(query.status);
  if (status) filter.status = status;

  const city = String(query.city || '').trim();
  if (city) filter['location.city'] = looseRegex(city);

  const locality = localityTerms?.length ? localityTerms : csv(query.locality);
  const localityClause = localityMatch(locality);
  if (localityClause) and.push(localityClause);

  // Price. A listing spans price..maxPrice, so we test for range overlap.
  // Anything quoted "on request" is excluded once a budget is applied.
  const minPrice = num(query.minPrice);
  const maxPrice = num(query.maxPrice);
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.priceOnRequest = { $ne: true };
    filter.price = { $ne: null };
    if (minPrice !== undefined) {
      and.push({ $or: [{ maxPrice: { $gte: minPrice } }, { maxPrice: null, price: { $gte: minPrice } }] });
    }
    if (maxPrice !== undefined) and.push({ price: { $lte: maxPrice } });
  }

  // Area, same overlap logic across areaMin..areaMax.
  const minArea = num(query.minArea);
  const maxArea = num(query.maxArea);
  if (minArea !== undefined) {
    and.push({ $or: [{ areaMax: { $gte: minArea } }, { areaMax: null, areaMin: { $gte: minArea } }] });
  }
  if (maxArea !== undefined) and.push({ areaMin: { $lte: maxArea } });

  const bedrooms = num(query.bedrooms);
  if (bedrooms !== undefined && bedrooms > 0) filter.bedrooms = { $gte: bedrooms };

  if (query.featured !== undefined && query.featured !== '') filter.isFeatured = isTrue(query.featured);
  if (query.trending !== undefined && query.trending !== '') filter.isTrending = isTrue(query.trending);

  if (query.developer) filter.developer = looseRegex(query.developer);

  if (and.length) filter.$and = and;
  return filter;
};

export const SORTS = {
  newest: { createdAt: -1, _id: -1 },
  oldest: { createdAt: 1, _id: 1 },
  'price-asc': { priceOnRequest: 1, price: 1, _id: 1 },
  'price-desc': { price: -1, _id: -1 },
  popular: { views: -1, isFeatured: -1, createdAt: -1 },
};

export const buildSort = (sort) => SORTS[String(sort || '').trim()] || { order: 1, createdAt: -1, _id: -1 };

/** page/limit -> { page, limit, skip } with the spec's defaults and cap. */
export const buildPagination = (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const requested = parseInt(query.limit, 10) || DEFAULT_LIMIT;
  const limit = Math.min(MAX_LIMIT, Math.max(1, requested));
  return { page, limit, skip: (page - 1) * limit };
};

/** Everything GET /api/properties needs, in one call. */
export const buildPropertyQuery = async (query = {}) => {
  const localityTerms = query.locality ? await resolveLocalityTerms(query.locality) : null;
  return {
    filter: buildPropertyFilter(query, localityTerms),
    sort: buildSort(query.sort),
    ...buildPagination(query),
  };
};

/** Uniform list envelope: { success, data, page, pages, total, limit }. */
export const paginated = (data, { page, limit, total }) => ({
  success: true,
  data,
  page,
  pages: Math.max(1, Math.ceil(total / limit)),
  total,
  limit,
});
