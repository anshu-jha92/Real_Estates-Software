/** HTTP adapter for admin auth. Logic lives in services/authService.js. */
import asyncHandler from '../middleware/asyncHandler.js';
import * as authService from '../services/authService.js';

/** POST /api/auth/login { email, password } */
export const login = asyncHandler(async (req, res) => {
  const { token, user } = await authService.login(req.body || {});
  res.json({ success: true, token, user });
});

/** GET /api/auth/me [admin] */
export const getMe = asyncHandler(async (req, res) => {
  const user = authService.publicUser(req.user);
  res.json({ success: true, user, data: user });
});

/** PUT /api/auth/me [admin] - change your own name, email or password. */
export const updateMe = asyncHandler(async (req, res) => {
  const { token, user } = await authService.updateAccount(req.user._id, req.body || {});
  res.json({ success: true, message: 'Your sign-in details have been updated.', token, user });
});
