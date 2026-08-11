import { Router } from "express";

import {
  syncUser,
  getCurrentUser,
} from "../controllers/authController.js";

import { requireAuth } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = Router();

// Create/update KisanSetu MongoDB user
// Firebase ID token is verified inside the controller.
router.post("/sync", authLimiter, syncUser);

// Get currently authenticated KisanSetu user
router.get("/me", requireAuth, getCurrentUser);

export default router;