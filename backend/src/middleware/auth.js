import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import asyncHandler from './asyncHandler.js';

/** True when the token was minted before the account's last password change. */
const isStale = (user, decoded) =>
  Boolean(user.passwordChangedAt) && decoded.iat * 1000 < new Date(user.passwordChangedAt).getTime();

const getToken = (req) => {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7).trim() : null;
};

/** Requires a valid Bearer token; puts the user on req.user. */
export const protect = asyncHandler(async (req, res, next) => {
  const token = getToken(req);
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorised. Please sign in.' });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).select('-password').lean();

  if (!user || user.isActive === false) {
    return res.status(401).json({ success: false, message: 'This account is no longer active.' });
  }
  if (isStale(user, decoded)) {
    return res.status(401).json({
      success: false,
      message: 'Your password was changed. Please sign in again.',
    });
  }

  req.user = user;
  next();
});

/**
 * Resolves a Bearer token when one is present but never rejects the request.
 * Lets a public list endpoint widen its results for a signed-in admin without
 * locking anonymous visitors out.
 */
export const attachUser = asyncHandler(async (req, res, next) => {
  const token = getToken(req);
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password').lean();
    if (user && user.isActive !== false && !isStale(user, decoded)) req.user = user;
  } catch {
    // An expired or forged token is simply treated as anonymous here.
  }

  next();
});

/** Use after protect. Blocks anyone who is not an admin. */
export const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access is required for this action.' });
  }
  next();
};

export const signToken = (user) =>
  jwt.sign({ id: String(user._id), role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || '7d',
  });

export default protect;
