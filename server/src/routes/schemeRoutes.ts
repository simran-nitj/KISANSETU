import { Router } from 'express';
import { listSchemes, recommendSchemes } from '../controllers/schemeController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Public route to list schemes
router.get('/', listSchemes);

// Protected recommendation route
router.get('/recommend', requireAuth as any, recommendSchemes as any);

export default router;
