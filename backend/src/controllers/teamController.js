/** HTTP adapter for the team. Logic lives in services/teamService.js. */
import asyncHandler from '../middleware/asyncHandler.js';
import * as teamService from '../services/teamService.js';

/** GET /api/team?all */
export const listTeam = asyncHandler(async (req, res) => {
  res.json(await teamService.listTeam(req.query, req.user?.role === 'admin'));
});

/** POST /api/team [admin] */
export const createTeamMember = asyncHandler(async (req, res) => {
  const data = await teamService.createTeamMember(req.body);
  res.status(201).json({ success: true, message: 'Team member added.', data });
});

/** PUT /api/team/:id [admin] */
export const updateTeamMember = asyncHandler(async (req, res) => {
  const data = await teamService.updateTeamMember(req.params.id, req.body);
  res.json({ success: true, message: 'Team member updated.', data });
});

/** DELETE /api/team/:id [admin] */
export const deleteTeamMember = asyncHandler(async (req, res) => {
  const data = await teamService.deleteTeamMember(req.params.id);
  res.json({ success: true, message: 'Team member removed.', data });
});
