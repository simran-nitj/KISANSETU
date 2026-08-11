import { Router } from 'express';
import {
  listUsers,
  getUserById,
  updateUserRole,
  toggleUserBan,
  getUserActivity,
} from '../controllers/userController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import { UserRole } from '../models/User.js';

const router = Router();

// Apply auth middleware to all user management routes
router.use(requireAuth as any);

router.get(
  '/',
  requireRole(UserRole.ADMIN, UserRole.CALL_CENTER, UserRole.MODERATOR),
  listUsers
);
router.get(
  '/:id',
  requireRole(UserRole.ADMIN, UserRole.CALL_CENTER, UserRole.MODERATOR),
  getUserById
);
router.put('/:id/role', requireRole(UserRole.ADMIN), updateUserRole);
router.put('/:id/ban', requireRole(UserRole.ADMIN, UserRole.MODERATOR), toggleUserBan);
router.get(
  '/:id/activity',
  requireRole(UserRole.ADMIN, UserRole.CALL_CENTER),
  getUserActivity
);

export default router;
