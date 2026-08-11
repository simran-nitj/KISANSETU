import { Router } from 'express';
import {
  createReview,
  getEquipmentReviews,
  flagReview,
} from '../controllers/reviewController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Public routes
router.get('/equipment/:equipmentId', getEquipmentReviews);

// Protected routes
router.post('/', requireAuth as any, createReview as any);
router.put('/:id/flag', requireAuth as any, flagReview as any);

export default router;
