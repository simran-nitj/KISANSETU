import { Request, Response, NextFunction } from "express";
import { User, UserRole } from "../models/User.js";
import { Profile } from "../models/Profile.js";
import { Wallet } from "../models/Wallet.js";
import { firebaseAuth } from "../config/firebaseAdmin.js";
import { AuthenticatedRequest } from "../middleware/auth.js";

/**
 * Extract Firebase ID token from Authorization header.
 */
const getFirebaseToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.substring(7);
};

/**
 * POST /api/auth/sync
 *
 * Firebase authenticates the user.
 * This endpoint synchronizes that Firebase user
 * with the KisanSetu MongoDB User collection.
 *
 * Frontend flow:
 *
 * Firebase Phone Auth
 *        ↓
 * OTP verified
 *        ↓
 * Firebase ID Token
 *        ↓
 * POST /api/auth/sync
 *        ↓
 * Firebase Admin verifies token
 *        ↓
 * MongoDB User
 */
export const syncUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = getFirebaseToken(req);

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Firebase authentication token is required.",
      });
      return;
    }

    // Verify Firebase ID token
    const decodedToken = await firebaseAuth.verifyIdToken(token);

    const firebaseUid = decodedToken.uid;

    const firebasePhone = decodedToken.phone_number;
    const firebaseEmail = decodedToken.email;

    /*
     * Name is not normally available from Firebase Phone Auth.
     * The frontend can send the user's name during initial signup.
     */
    const { name, role } = req.body;

    if (!name || typeof name !== "string" || !name.trim()) {
      res.status(400).json({
        success: false,
        message: "Name is required.",
      });
      return;
    }

    /*
     * First look up by Firebase UID.
     */
    let user = await User.findOne({ firebaseUid });

    /*
     * If the Firebase UID isn't found, try matching
     * an existing KisanSetu account by phone/email.
     *
     * This helps avoid creating duplicate users if
     * the user already existed before Firebase migration.
     */
    if (!user && firebasePhone) {
      user = await User.findOne({ phone: firebasePhone });
    }

    if (!user && firebaseEmail) {
      user = await User.findOne({ email: firebaseEmail.toLowerCase() });
    }

    /*
     * Existing user
     */
    if (user) {
      /*
       * Attach Firebase UID if this is an existing
       * KisanSetu account being migrated to Firebase.
       */
      if (user.firebaseUid !== firebaseUid) {
        user.firebaseUid = firebaseUid;
      }

      /*
       * Update verified Firebase contact information.
       */
      if (firebasePhone && user.phone !== firebasePhone) {
        user.phone = firebasePhone;
      }

      if (firebaseEmail && !user.email) {
        user.email = firebaseEmail.toLowerCase();
      }

      /*
       * Update name only if the user doesn't already
       * have a meaningful name.
       */
      if (
        (!user.name || user.name === "Farmer Partner") &&
        name.trim()
      ) {
        user.name = name.trim();
      }

      if (user.isBanned) {
        res.status(403).json({
          success: false,
          message: "Your account has been suspended.",
        });
        return;
      }

      await user.save();

      res.status(200).json({
        success: true,
        message: "User synchronized successfully.",
        isNewUser: false,
        user: {
          id: user._id,
          firebaseUid: user.firebaseUid,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role,
          isBanned: user.isBanned,
        },
      });

      return;
    }

    /*
     * New user
     */
    const selectedRole =
      role && Object.values(UserRole).includes(role)
        ? role
        : UserRole.FARMER_CUSTOMER;

    /*
     * Phone is required for KisanSetu.
     *
     * Since we're using Firebase Phone Authentication,
     * phone_number comes from the verified Firebase token.
     */
    if (!firebasePhone) {
      res.status(400).json({
        success: false,
        message:
          "A verified phone number is required to create a KisanSetu account.",
      });
      return;
    }

    user = new User({
      firebaseUid,
      name: name.trim(),
      phone: firebasePhone,
      email: firebaseEmail?.toLowerCase(),
      role: selectedRole,
      isBanned: false,
    });

    await user.save();

    /*
     * Create related KisanSetu resources.
     */
    await Profile.create({
      userId: user._id,
    });

    await Wallet.create({
      userId: user._id,
    });

    res.status(201).json({
      success: true,
      message: "KisanSetu account created successfully.",
      isNewUser: true,
      user: {
        id: user._id,
        firebaseUid: user.firebaseUid,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        isBanned: user.isBanned,
      },
    });
  } catch (error) {
    console.error("Firebase user synchronization error:", error);

    next(error);
  }
};

/**
 * GET /api/auth/me
 *
 * Returns the currently authenticated KisanSetu user.
 *
 * requireAuth middleware verifies the Firebase ID token
 * and attaches the MongoDB User to req.user.
 */
export const getCurrentUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        firebaseUid: req.user.firebaseUid,
        name: req.user.name,
        phone: req.user.phone,
        email: req.user.email,
        role: req.user.role,
        isBanned: req.user.isBanned,
        createdAt: req.user.createdAt,
        updatedAt: req.user.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};