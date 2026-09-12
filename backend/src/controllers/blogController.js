/** HTTP adapter for the blog. Logic lives in services/blogService.js. */
import asyncHandler from '../middleware/asyncHandler.js';
import * as blogService from '../services/blogService.js';

/** GET /api/blogs?page,limit,tag,search,all */
export const listBlogs = asyncHandler(async (req, res) => {
  res.json(await blogService.listBlogs(req.query, req.user?.role === 'admin'));
});

/** GET /api/blogs/:slug - increments views, returns related posts. */
export const getBlogBySlug = asyncHandler(async (req, res) => {
  const { data, related } = await blogService.getBlogBySlug(req.params.slug);
  res.json({ success: true, data, related });
});

/** POST /api/blogs [admin] */
export const createBlog = asyncHandler(async (req, res) => {
  const data = await blogService.createBlog(req.body);
  res.status(201).json({ success: true, message: 'Article published.', data });
});

/** PUT /api/blogs/:id [admin] */
export const updateBlog = asyncHandler(async (req, res) => {
  const data = await blogService.updateBlog(req.params.id, req.body);
  res.json({ success: true, message: 'Article updated.', data });
});

/** DELETE /api/blogs/:id [admin] */
export const deleteBlog = asyncHandler(async (req, res) => {
  const data = await blogService.deleteBlog(req.params.id);
  res.json({ success: true, message: 'Article deleted.', data });
});
