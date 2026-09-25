import mongoose from 'mongoose';
import { uniqueSlug } from '../utils/slugify.js';
import geocode from '../utils/geocode.js';

export const CATEGORIES = ['residential', 'commercial', 'plots', 'rent', 'office-space'];
export const STATUSES = ['new-launch', 'under-construction', 'ready-to-move', 'resale', 'sold-out'];
export const AREA_UNITS = ['sqft', 'sqyd', 'acre'];
export const PRICE_UNITS = ['total', 'per-sqft', 'per-sqyd', 'per-month'];

const configurationSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true, required: [true, 'Configuration label is required'] },
    areaValue: { type: Number, min: 0 },
    areaUnit: { type: String, enum: AREA_UNITS, default: 'sqft' },
    price: { type: Number, min: 0 },
    priceOnRequest: { type: Boolean, default: false },
  },
  { _id: false }
);

const nearbySchema = new mongoose.Schema(
  {
    label: { type: String, trim: true, required: true },
    distance: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const locationSchema = new mongoose.Schema(
  {
    locality: { type: String, trim: true, default: '' },
    sector: { type: String, trim: true, default: '' },
    city: { type: String, trim: true, default: 'Faridabad' },
    state: { type: String, trim: true, default: 'Haryana' },
    pincode: { type: String, trim: true, default: '' },
    address: { type: String, trim: true, default: '' },
    landmark: { type: String, trim: true, default: '' },
    lat: { type: Number, min: -90, max: 90 },
    lng: { type: Number, min: -180, max: 180 },
    mapEmbedUrl: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Property title is required'],
      trim: true,
      maxlength: [180, 'Title cannot exceed 180 characters'],
    },
    slug: { type: String, unique: true, index: true, lowercase: true, trim: true },
    shortDescription: { type: String, trim: true, maxlength: 320, default: '' },
    description: { type: String, trim: true, default: '' },

    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: { values: CATEGORIES, message: '{VALUE} is not a valid category' },
      index: true,
    },
    propertyType: { type: String, trim: true, default: '', index: true },
    listingType: { type: String, enum: ['sale', 'rent'], default: 'sale', index: true },
    status: {
      type: String,
      enum: { values: STATUSES, message: '{VALUE} is not a valid status' },
      default: 'ready-to-move',
      index: true,
    },

    price: { type: Number, min: 0, default: null },
    maxPrice: { type: Number, min: 0, default: null },
    priceOnRequest: { type: Boolean, default: false },
    priceUnit: { type: String, enum: PRICE_UNITS, default: 'total' },

    areaMin: { type: Number, min: 0, default: null },
    areaMax: { type: Number, min: 0, default: null },
    areaUnit: { type: String, enum: AREA_UNITS, default: 'sqft' },

    bedrooms: { type: Number, min: 0, default: 0 },
    bathrooms: { type: Number, min: 0, default: 0 },
    balconies: { type: Number, min: 0, default: 0 },
    floorsTotal: { type: Number, min: 0, default: 0 },
    parking: { type: Number, min: 0, default: 0 },
    furnishing: {
      type: String,
      enum: ['unfurnished', 'semi-furnished', 'furnished'],
      default: 'unfurnished',
    },

    configurations: { type: [configurationSchema], default: [] },
    location: { type: locationSchema, default: () => ({}) },

    developer: { type: String, trim: true, default: '', index: true },
    reraNumber: { type: String, trim: true, default: '' },
    possession: { type: String, trim: true, default: '' },
    launchDate: { type: String, trim: true, default: '' },

    amenities: { type: [String], default: [] },
    highlights: { type: [String], default: [] },
    nearby: { type: [nearbySchema], default: [] },

    images: { type: [String], default: [] },
    thumbnail: { type: String, trim: true, default: '' },
    brochureUrl: { type: String, trim: true, default: '' },
    videoUrl: { type: String, trim: true, default: '' },

    badges: { type: [String], default: [] },
    isFeatured: { type: Boolean, default: false, index: true },
    isTrending: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true, index: true },

    views: { type: Number, default: 0, min: 0 },
    order: { type: Number, default: 100 },

    seo: {
      metaTitle: { type: String, trim: true, default: '' },
      metaDescription: { type: String, trim: true, default: '' },
      keywords: { type: [String], default: [] },
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

propertySchema.index({
  title: 'text',
  shortDescription: 'text',
  description: 'text',
  developer: 'text',
  'location.locality': 'text',
  'location.sector': 'text',
  'location.city': 'text',
  propertyType: 'text',
});
propertySchema.index({ category: 1, isActive: 1, order: 1 });
propertySchema.index({ price: 1 });
propertySchema.index({ 'location.locality': 1 });

/** Auto slug from the title, kept unique. */
propertySchema.pre('validate', async function generateSlug(next) {
  if (!this.slug || this.isModified('title')) {
    this.slug = await uniqueSlug(this.constructor, this.title, this._id);
  }
  if (!this.thumbnail && this.images?.length) this.thumbnail = this.images[0];
  next();
});

/**
 * An address but no pin: look the coordinates up once and keep them, so the
 * map shows the place that was typed instead of Google's guess at it. Given
 * coordinates are never second-guessed — clearing both is how you ask for a
 * fresh lookup after moving a property's address.
 */
propertySchema.pre('validate', async function fillCoordinates(next) {
  const loc = this.location;
  const pinned = loc && loc.lat != null && loc.lng != null;

  if (!pinned && loc && this.isModified('location')) {
    const point = await geocode(loc.toObject ? loc.toObject() : loc);
    if (point) {
      loc.lat = point.lat;
      loc.lng = point.lng;
    }
  }

  next();
});

export default mongoose.models.Property || mongoose.model('Property', propertySchema);
