import mongoose from 'mongoose';
import { uniqueSlug } from '../utils/slugify.js';

const developerSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Developer name is required'], trim: true },
    slug: { type: String, unique: true, index: true, lowercase: true, trim: true },
    logo: { type: String, trim: true, default: '' },
    website: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    establishedYear: { type: Number, default: null },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 100 },
  },
  { timestamps: true }
);

developerSchema.pre('validate', async function generateSlug(next) {
  if (!this.slug || this.isModified('name')) {
    this.slug = await uniqueSlug(this.constructor, this.name, this._id);
  }
  next();
});

export default mongoose.models.Developer || mongoose.model('Developer', developerSchema);
