/** Blog / insights business logic. */
import mongoose from 'mongoose';
import Blog from '../models/Blog.js';
import { buildPagination, paginated, escapeRegex } from '../utils/apiFeatures.js';
import { notFound } from '../utils/AppError.js';

const RELATED_LIMIT = 3;

const missing = () => notFound('That article was not found.');

/** Published posts (or everything when `all=true`), plus the tag list for the chips. */
export async function listBlogs(query = {}, isAdmin = false) {
  const { page, limit, skip } = buildPagination({ ...query, limit: query.limit || 9 });

  const filter = isAdmin && query.all === 'true' ? {} : { isPublished: true };
  if (query.tag) filter.tags = new RegExp(`^${escapeRegex(query.tag)}$`, 'i');
  if (query.search) {
    const rx = new RegExp(escapeRegex(query.search), 'i');
    filter.$or = [{ title: rx }, { excerpt: rx }, { tags: rx }];
  }

  const [data, total, tags] = await Promise.all([
    Blog.find(filter)
      .select('-content')
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Blog.countDocuments(filter),
    Blog.distinct('tags', { isPublished: true }),
  ]);

  return { ...paginated(data, { page, limit, total }), tags: tags.filter(Boolean).sort() };
}

/** One article, its view counted, plus posts sharing a tag. */
export async function getBlogBySlug(slug) {
  const byId = mongoose.isValidObjectId(slug) ? [{ _id: slug }] : [];

  const blog = await Blog.findOne({ $or: [{ slug }, ...byId] }).lean();
  if (!blog) throw missing();

  Blog.updateOne({ _id: blog._id }, { $inc: { views: 1 } }).catch(() => {});
  blog.views = (blog.views || 0) + 1;

  const related = await Blog.find({
    _id: { $ne: blog._id },
    isPublished: true,
    ...(blog.tags?.length ? { tags: { $in: blog.tags } } : {}),
  })
    .select('-content')
    .sort({ publishedAt: -1 })
    .limit(RELATED_LIMIT)
    .lean();

  return { data: blog, related };
}

export async function createBlog(payload) {
  return Blog.create(payload);
}

export async function updateBlog(id, payload = {}) {
  const blog = await Blog.findById(id);
  if (!blog) throw missing();

  const { _id, createdAt, updatedAt, ...updates } = payload;
  blog.set(updates);
  await blog.save();

  return blog;
}

export async function deleteBlog(id) {
  const blog = await Blog.findByIdAndDelete(id).lean();
  if (!blog) throw missing();
  return { _id: blog._id };
}
