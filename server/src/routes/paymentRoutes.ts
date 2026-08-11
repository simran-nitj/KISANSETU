import { Router } from 'express';
import {
  initiatePayment,
  verifyPayment,
  getMyTransactions,
} from '../controllers/paymentController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Apply auth to all payment endpoints
router.use(requireAuth as any);

router.post('/initiate', initiatePayment as any);
router.post('/verify', verifyPayment as any);
router.get('/transactions', getMyTransactions);

export default router;
