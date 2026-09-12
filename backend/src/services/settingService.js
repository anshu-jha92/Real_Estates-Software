/** The single site-settings document (phones, address, socials, hero slides). */
import Setting, { DEFAULT_SETTINGS } from '../models/Setting.js';

const FILTER = { key: 'site' };

// `key` is supplied by the upsert filter, so it must not also appear in $setOnInsert.
const { key: _key, ...DEFAULTS } = DEFAULT_SETTINGS;

/**
 * Always returns a usable document, even before the database is seeded.
 * Upsert rather than create, so two simultaneous first requests cannot collide.
 */
export async function getSettings() {
  return Setting.findOneAndUpdate(
    FILTER,
    { $setOnInsert: DEFAULTS },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();
}

export async function updateSettings(payload = {}) {
  const { _id, key, createdAt, updatedAt, ...updates } = payload;

  return Setting.findOneAndUpdate(
    FILTER,
    { $set: updates },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  ).lean();
}
