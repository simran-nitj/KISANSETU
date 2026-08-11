import { Router } from 'express';
import {
  createBooking,
  acceptBooking,
  rejectBooking,
  completeBooking,
  requestReschedule,
  respondReschedule,
  listMyBookings,
} from '../controllers/bookingController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Apply requireAuth to all booking operations
router.use(requireAuth as any);

router.get('/', listMyBookings);
router.post('/', createBooking as any);
router.put('/:id/accept', acceptBooking as any);
router.put('/:id/reject', rejectBooking as any);
router.put('/:id/complete', completeBooking as any);
router.post('/:id/reschedule', requestReschedule as any);
router.put('/:id/reschedule/respond', respondReschedule as any);

export default router;
