import { Router } from 'express';
import {
  createEquipment,
  listEquipment,
  getEquipmentById,
  updateEquipment,
  deleteEquipment,
} from '../controllers/equipmentController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Public routes
router.get('/', listEquipment);
router.get('/:id', getEquipmentById);

// Protected routes (requires login)
router.post('/', requireAuth as any, createEquipment as any);
router.put('/:id', requireAuth as any, updateEquipment as any);
router.delete('/:id', requireAuth as any, deleteEquipment as any);

export default router;
