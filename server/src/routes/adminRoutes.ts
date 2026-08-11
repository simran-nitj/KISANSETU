import { Router } from 'express';
import {
  getPendingKYCs,
  verifyKYC,
  getPendingEquipment,
  verifyEquipment,
  getAbuseReports,
  resolveReport,
  exportData,
} from '../controllers/adminController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import { UserRole } from '../models/User.js';

const router = Router();

// Apply auth to all admin dashboard operations
router.use(requireAuth as any);

router.get(
  '/kyc/pending',
  requireRole(UserRole.ADMIN, UserRole.MODERATOR),
  getPendingKYCs
);
router.put(
  '/kyc/:id/verify',
  requireRole(UserRole.ADMIN, UserRole.MODERATOR),
  verifyKYC as any
);
router.get(
  '/equipment/pending',
  requireRole(UserRole.ADMIN, UserRole.MODERATOR, UserRole.CALL_CENTER),
  getPendingEquipment
);
router.put(
  '/equipment/:id/verify',
  requireRole(UserRole.ADMIN, UserRole.MODERATOR),
  verifyEquipment as any
);
router.get(
  '/reports',
  requireRole(UserRole.ADMIN, UserRole.MODERATOR),
  getAbuseReports
);
router.put(
  '/reports/:id/resolve',
  requireRole(UserRole.ADMIN, UserRole.MODERATOR),
  resolveReport as any
);
router.get('/export/:type', requireRole(UserRole.ADMIN), exportData as any);

export default router;
