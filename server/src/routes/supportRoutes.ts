import { Router } from 'express';
import {
  createTicket,
  getMyTickets,
  getTicketById,
  addTicketMessage,
} from '../controllers/supportController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Apply auth to all support operations
router.use(requireAuth as any);

router.post('/', createTicket as any);
router.get('/', getMyTickets);
router.get('/:id', getTicketById as any);
router.post('/:id/message', addTicketMessage as any);

export default router;
