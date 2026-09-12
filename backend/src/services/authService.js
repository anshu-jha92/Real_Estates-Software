/** Admin authentication. */
import User from '../models/User.js';
import { signToken } from '../middleware/auth.js';
import { badRequest, forbidden, unauthorized } from '../utils/AppError.js';

/** The only shape of a user that ever leaves the server. */
export const publicUser = (user) => ({
  _id: user._id,
  id: String(user._id),
  name: user.name,
  email: user.email,
  role: user.role,
});

/**
 * Verify credentials and issue a token.
 * Unknown email and wrong password give the identical message, so the endpoint
 * cannot be used to discover which addresses have accounts.
 */
export async function login({ email, password } = {}) {
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanPassword = String(password || '');

  if (!cleanEmail || !cleanPassword) {
    throw badRequest('Please enter both email and password.', {
      ...(cleanEmail ? {} : { email: 'Email is required' }),
      ...(cleanPassword ? {} : { password: 'Password is required' }),
    });
  }

  const user = await User.findOne({ email: cleanEmail }).select('+password');

  if (!user || !(await user.matchPassword(cleanPassword))) {
    throw unauthorized('Incorrect email or password.');
  }
  if (user.isActive === false) {
    throw forbidden('This account has been disabled.');
  }

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  return { token: signToken(user), user: publicUser(user) };
}

/**
 * Change the signed-in admin's own name, email or password.
 *
 * The current password is required for every change, not just a password
 * change: without it, anyone who reaches an unattended logged-in browser could
 * swap the email and password and lock the real owner out for good.
 */
export async function updateAccount(userId, { name, email, currentPassword, newPassword } = {}) {
  const user = await User.findById(userId).select('+password');
  if (!user) throw unauthorized('Please sign in again.');

  const confirmation = String(currentPassword || '');
  if (!confirmation) {
    throw badRequest('Enter your current password to save these changes.', {
      currentPassword: 'Enter your current password',
    });
  }
  if (!(await user.matchPassword(confirmation))) {
    throw badRequest('That is not your current password.', {
      currentPassword: 'This does not match your current password',
    });
  }

  const nextEmail = String(email || '').trim().toLowerCase();
  if (nextEmail && nextEmail !== user.email) {
    // The unique index would also catch this, but a duplicate-key error is not
    // something we want to show a human.
    const taken = await User.findOne({ email: nextEmail, _id: { $ne: user._id } }).lean();
    if (taken) {
      throw badRequest('That email address is already in use.', {
        email: 'Another account already uses this address',
      });
    }
    user.email = nextEmail;
  }

  const nextPassword = String(newPassword || '');
  if (nextPassword) {
    if (nextPassword.length < 8) {
      throw badRequest('Your new password must be at least 8 characters.', {
        newPassword: 'Use at least 8 characters',
      });
    }
    if (nextPassword === confirmation) {
      throw badRequest('Your new password must be different from the current one.', {
        newPassword: 'Choose a password you have not used here before',
      });
    }
    user.password = nextPassword; // the pre-save hook hashes it
    // Backdated one second: a JWT's `iat` is whole seconds, so a token minted a
    // few milliseconds from now would otherwise look older than this stamp and
    // sign the admin out of the very browser they just changed it in.
    user.passwordChangedAt = new Date(Date.now() - 1000);
  }

  const nextName = String(name || '').trim();
  if (nextName) {
    if (nextName.length > 80) {
      throw badRequest('That name is too long.', { name: 'Use 80 characters or fewer' });
    }
    user.name = nextName;
  }

  await user.save();

  // A fresh token keeps this browser signed in and carries the new details back.
  return { token: signToken(user), user: publicUser(user) };
}
