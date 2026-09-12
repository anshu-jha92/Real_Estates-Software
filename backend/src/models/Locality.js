import mongoose from 'mongoose';
import { uniqueSlug } from '../utils/slugify.js';

const localitySchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Locality name is required'], trim: true },
    slug: { type: String, unique: true, index: true, lowercase: true, trim: true },
    city: { type: String, trim: true, default: 'Faridabad' },
    state: { type: String, trim: true, default: 'Haryana' },
    image: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    /** Sector / road names that belong to this locality. Drives search + counts. */
    aliases: { type: [String], default: [] },
    priceFrom: { type: Number, default: null },
    priceNote: { type: String, trim: true, default: '' },
    /** Snapshot count; the API recomputes it live on every request. */
    count: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 100 },
  },
  { timestamps: true }
);

localitySchema.pre('validate', async function generateSlug(next) {
  if (!this.slug || this.isModified('name')) {
    this.slug = await uniqueSlug(this.constructor, this.name, this._id);
  }
  next();
});

export default mongoose.models.Locality || mongoose.model('Locality', localitySchema);
