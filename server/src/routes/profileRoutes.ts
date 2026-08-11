import { Router } from 'express';
import {
  getMyProfile,
  updateMyProfile,
  submitKYC,
  getIncomeAnalytics,
} from '../controllers/profileController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Apply auth middleware to all profile routes
router.use(requireAuth as any);

router.get('/', getMyProfile);
router.put('/', updateMyProfile);
router.post('/kyc', submitKYC);
router.get('/analytics/income', getIncomeAnalytics);

export default router;
