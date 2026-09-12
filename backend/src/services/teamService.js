/** Team member business logic — powers the "Our team" band on /about. */
import TeamMember from '../models/TeamMember.js';
import { notFound } from '../utils/AppError.js';

const missing = () => notFound('That team member was not found.');

/** Public list is active-only; the admin table passes `all=true` to see hidden ones too. */
export async function listTeam(query = {}, isAdmin = false) {
  const filter = isAdmin && query.all === 'true' ? {} : { isActive: true };
  const data = await TeamMember.find(filter).sort({ order: 1, createdAt: 1 }).lean();
  return { success: true, data, total: data.length };
}

export async function createTeamMember(payload) {
  return TeamMember.create(payload);
}

export async function updateTeamMember(id, payload = {}) {
  const doc = await TeamMember.findById(id);
  if (!doc) throw missing();

  const { _id, createdAt, updatedAt, ...updates } = payload;
  doc.set(updates);
  await doc.save();

  return doc;
}

export async function deleteTeamMember(id) {
  const doc = await TeamMember.findByIdAndDelete(id).lean();
  if (!doc) throw missing();
  return { _id: doc._id };
}
