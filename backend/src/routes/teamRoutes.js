import { Router } from 'express';
import {
  listTeam,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
} from '../controllers/teamController.js';
import { protect, adminOnly, attachUser } from '../middleware/auth.js';

const router = Router();

router.get('/', attachUser, listTeam);

router.post('/', protect, adminOnly, createTeamMember);
router.put('/:id', protect, adminOnly, updateTeamMember);
router.delete('/:id', protect, adminOnly, deleteTeamMember);

export default router;
