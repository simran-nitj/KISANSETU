import { Router } from 'express';
import {
  getMyNotifications,
  markNotificationsAsRead,
} from '../controllers/notificationController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Apply auth to all notification routes
router.use(requireAuth as any);

router.get('/', getMyNotifications);
router.put('/read', markNotificationsAsRead as any);

export default router;
