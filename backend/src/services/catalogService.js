/**
 * Reference data that describes the catalogue rather than belonging to it:
 * filter dropdowns, headline counters, localities, developers, testimonials.
 *
 * Every option is derived from the listings that actually exist, so a dropdown
 * can never offer a value that returns nothing.
 */
import Property, { CATEGORIES, STATUSES } from '../models/Property.js';
import Locality from '../models/Locality.js';
import Developer from '../models/Developer.js';
import Testimonial from '../models/Testimonial.js';
import { localityMatch } from '../utils/apiFeatures.js';

/** Human labels for the category / status enums (the values themselves stay data driven). */
const CATEGORY_LABELS = {
  residential: 'Residential',
  commercial: 'Commercial',
  plots: 'Plots',
  rent: 'Rent',
  'office-space': 'Office Spaces',
};

const STATUS_LABELS = {
  'new-launch': 'New Launch',
  'under-construction': 'Under Construction',
  'ready-to-move': 'Ready to Move',
  resale: 'Resale',
  'sold-out': 'Sold Out',
};

const ACTIVE = { isActive: true };

/** "Sector 9" before "Sector 86", "Bypass Road" alphabetical. */
const naturalSort = (a, b) =>
  String(a).localeCompare(String(b), 'en', { numeric: true, sensitivity: 'base' });

const clean = (list) => [...new Set(list.filter((v) => typeof v === 'string' && v.trim()))].sort(naturalSort);

/** Everything the UI dropdowns need. */
export async function getFilters() {
  const [
    cities,
    localities,
    sectors,
    propertyTypes,
    developers,
    categoryCounts,
    statusValues,
    bedroomValues,
    priceAgg,
  ] = await Promise.all([
    Property.distinct('location.city', ACTIVE),
    Property.distinct('location.locality', ACTIVE),
    Property.distinct('location.sector', ACTIVE),
    Property.distinct('propertyType', ACTIVE),
    Property.distinct('developer', ACTIVE),
    Property.aggregate([{ $match: ACTIVE }, { $group: { _id: '$category', count: { $sum: 1 } } }]),
    Property.distinct('status', ACTIVE),
    Property.distinct('bedrooms', ACTIVE),
    Property.aggregate([
      {
        $match: {
          ...ACTIVE,
          listingType: 'sale',
          priceUnit: 'total',
          priceOnRequest: { $ne: true },
          price: { $gt: 0 },
        },
      },
      { $group: { _id: null, min: { $min: '$price' }, max: { $max: { $ifNull: ['$maxPrice', '$price'] } } } },
    ]),
  ]);

  const counted = Object.fromEntries(categoryCounts.map((c) => [c._id, c.count]));
  const availableStatuses = STATUSES.filter((s) => statusValues.includes(s));

  return {
    cities: clean(cities),
    // One dropdown covers both localities and sectors - the ?locality= filter matches either.
    localities: clean([...localities, ...sectors]),
    propertyTypes: clean(propertyTypes),
    developers: clean(developers),
    categories: CATEGORIES.filter((key) => counted[key]).map((key) => ({
      key,
      label: CATEGORY_LABELS[key] || key,
      count: counted[key] || 0,
    })),
    // Raw enum keys (send these back as ?status=), plus a labelled variant for selects.
    statuses: availableStatuses,
    statusOptions: availableStatuses.map((key) => ({ key, label: STATUS_LABELS[key] || key })),
    priceRange: {
      min: priceAgg[0]?.min ?? 0,
      max: priceAgg[0]?.max ?? 0,
    },
    bedrooms: bedroomValues.filter((n) => Number(n) > 0).sort((a, b) => a - b),
  };
}

/** Live counters for the category strip and stats band. */
export async function getStats() {
  const [byCategory, total, localities] = await Promise.all([
    Property.aggregate([{ $match: ACTIVE }, { $group: { _id: '$category', count: { $sum: 1 } } }]),
    Property.countDocuments(ACTIVE),
    Property.distinct('location.locality', ACTIVE),
  ]);

  const counted = Object.fromEntries(byCategory.map((c) => [c._id, c.count]));

  return {
    total,
    residential: counted.residential || 0,
    commercial: counted.commercial || 0,
    plots: counted.plots || 0,
    rent: counted.rent || 0,
    officeSpace: counted['office-space'] || 0,
    localities: localities.filter(Boolean).length,
  };
}

/** Locality cards with a live listing count (aliases included in the match). */
export async function getLocalities({ includeInactive = false } = {}) {
  const localities = await Locality.find(includeInactive ? {} : { isActive: true })
    .sort({ order: 1, name: 1 })
    .lean();

  return Promise.all(
    localities.map(async (locality) => {
      const match = localityMatch([locality.name, ...(locality.aliases || [])]);
      const count = match ? await Property.countDocuments({ ...ACTIVE, ...match }) : 0;
      return { ...locality, count };
    })
  );
}

export async function getDevelopers() {
  return Developer.find({ isActive: true }).sort({ order: 1, name: 1 }).lean();
}

export async function getTestimonials() {
  return Testimonial.find({ isActive: true }).sort({ order: 1, createdAt: -1 }).lean();
}
