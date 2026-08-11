import { Router } from 'express';
import { getMyRecommendations } from '../controllers/recommendationController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Apply auth to all recommendation routes
router.use(requireAuth as any);

router.get('/', getMyRecommendations);

export default router;
