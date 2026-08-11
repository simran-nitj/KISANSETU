import { Router } from 'express';
import {
  startChat,
  getMyChats,
  getChatMessages,
  postMessage,
} from '../controllers/chatController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Apply auth to all chat operations
router.use(requireAuth as any);

router.post('/', startChat as any);
router.get('/', getMyChats);
router.get('/:chatId/messages', getChatMessages as any);
router.post('/:chatId/messages', postMessage as any);

export default router;
