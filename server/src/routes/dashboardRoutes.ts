import { Router } from 'express';
import {
  getOwnerDashboard,
  getCustomerDashboard,
  getAdminDashboard,
} from '../controllers/dashboardController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import { UserRole } from '../models/User.js';

const router = Router();

// Apply auth to all dashboard endpoints
router.use(requireAuth as any);

router.get('/owner', requireRole(UserRole.FARMER_OWNER), getOwnerDashboard);
router.get(
  '/customer',
  requireRole(UserRole.FARMER_CUSTOMER, UserRole.FARMER_OWNER),
  getCustomerDashboard
);
router.get('/admin', requireRole(UserRole.ADMIN), getAdminDashboard);

export default router;
