import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";

import { firebaseAuth } from "../config/firebaseAdmin.js";
import { User, IUser } from "../models/User.js";

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

/**
 * Verify Firebase ID Token
 *
 * Frontend sends:
 *
 * Authorization: Bearer <Firebase ID Token>
 *
 * Firebase Admin SDK verifies the token.
 * Then we find the corresponding KisanSetu user in MongoDB.
 */
export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Authentication token missing.",
      });
      return;
    }

    const idToken = authHeader.substring(7);

    if (!idToken) {
      res.status(401).json({
        success: false,
        message: "Authentication token missing.",
      });
      return;
    }

    // Verify Firebase ID token
    const decodedToken = await firebaseAuth.verifyIdToken(idToken);

    const firebaseUid = decodedToken.uid;

    // Find corresponding KisanSetu user
    const user = await User.findOne({
      firebaseUid,
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: "KisanSetu user account not found.",
      });
      return;
    }

    // Check whether account is banned
    if (user.isBanned) {
      res.status(403).json({
        success: false,
        message: "Your account has been suspended.",
      });
      return;
    }

    // Attach MongoDB user to request
    req.user = user;

    next();
  } catch (error) {
    console.error(
      "Firebase authentication error:",
      error instanceof Error ? error.message : error
    );

    res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token.",
    });
  }
};