import { Router } from 'express';
import { getMyWallet, requestWithdrawal } from '../controllers/walletController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Apply auth to all wallet operations
router.use(requireAuth as any);

router.get('/', getMyWallet);
router.post('/withdraw', requestWithdrawal as any);

export default router;
