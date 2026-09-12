import mongoose from 'mongoose';
import { uniqueSlug } from '../utils/slugify.js';

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Blog title is required'], trim: true, maxlength: 180 },
    slug: { type: String, unique: true, index: true, lowercase: true, trim: true },
    excerpt: { type: String, trim: true, maxlength: 400, default: '' },
    content: { type: String, required: [true, 'Blog content is required'] },
    coverImage: { type: String, trim: true, default: '' },
    author: { type: String, trim: true, default: 'Rama Kripa Estates' },
    authorRole: { type: String, trim: true, default: 'Property Advisory Team' },
    tags: { type: [String], default: [], index: true },
    category: { type: String, trim: true, default: 'Faridabad Insights' },
    readTime: { type: Number, default: 5, min: 1 },
    isPublished: { type: Boolean, default: true, index: true },
    publishedAt: { type: Date, default: Date.now },
    views: { type: Number, default: 0, min: 0 },
    seo: {
      metaTitle: { type: String, trim: true, default: '' },
      metaDescription: { type: String, trim: true, default: '' },
      keywords: { type: [String], default: [] },
    },
  },
  { timestamps: true }
);

blogSchema.index({ title: 'text', excerpt: 'text', content: 'text' });
blogSchema.index({ publishedAt: -1 });

blogSchema.pre('validate', async function generateSlug(next) {
  if (!this.slug || this.isModified('title')) {
    this.slug = await uniqueSlug(this.constructor, this.title, this._id);
  }
  // ~200 words per minute, rounded up.
  if (this.isModified('content') && this.content) {
    this.readTime = Math.max(1, Math.round(this.content.split(/\s+/).length / 200));
  }
  next();
});

export default mongoose.models.Blog || mongoose.model('Blog', blogSchema);
