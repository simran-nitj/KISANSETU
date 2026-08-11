import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { Profile } from '../models/Profile.js';
import { KYC, KYCStatus } from '../models/KYC.js';
import { Booking, BookingStatus } from '../models/Booking.js';
import { uploadToCloudinary } from '../config/cloudinary.js';

/**
 * Fetch current user profile, including KYC details
 * GET /api/profile
 */
export const getMyProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const userId = req.user?._id;

    const profile = await Profile.findOne({ userId }).populate('userId', 'name phone email role');
    const kyc = await KYC.findOne({ userId });

    return res.status(200).json({
      profile,
      kyc: kyc || { status: KYCStatus.PENDING, bankDetails: {} },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile details
 * PUT /api/profile
 */
export const updateMyProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const userId = req.user?._id;
    const { farmSize, cropTypes, languages, location } = req.body;

    const updatedProfile = await Profile.findOneAndUpdate(
      { userId },
      {
        $set: {
          farmSize,
          cropTypes,
          languages,
          location,
        },
      },
      { new: true }
    );

    return res.status(200).json({
      message: 'Profile updated successfully.',
      profile: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload Aadhaar/PAN documents & submit KYC
 * POST /api/profile/kyc
 */
export const submitKYC = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const userId = req.user?._id;
    const { aadhaarNo, panNo, bankDetails, aadhaarImage, panImage } = req.body;

    let aadhaarUrl = '';
    let panUrl = '';

    // Upload Aadhaar to Cloudinary if provided as Base64 string
    if (aadhaarImage) {
      const uploadRes = await uploadToCloudinary(aadhaarImage, 'kyc_documents');
      aadhaarUrl = uploadRes.secure_url;
    }

    // Upload PAN to Cloudinary
    if (panImage) {
      const uploadRes = await uploadToCloudinary(panImage, 'kyc_documents');
      panUrl = uploadRes.secure_url;
    }

    let kycRecord = await KYC.findOne({ userId });

    const kycData = {
      userId,
      aadhaarNo,
      panNo,
      bankDetails,
      status: KYCStatus.PENDING,
      ...(aadhaarUrl && { aadhaarUrl }),
      ...(panUrl && { panUrl }),
    };

    if (kycRecord) {
      kycRecord = await KYC.findOneAndUpdate({ userId }, kycData, { new: true });
    } else {
      kycRecord = new KYC(kycData);
      await kycRecord.save();
    }

    return res.status(200).json({
      message: 'KYC documents submitted for approval.',
      kyc: kycRecord,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Farmer Income Analytics
 * GET /api/profile/analytics/income
 */
export const getIncomeAnalytics = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const userId = req.user?._id;

    // Get completed bookings where current user is the owner
    const completedBookings = await Booking.find({
      ownerId: userId,
      status: BookingStatus.COMPLETED,
    });

    const activeRentals = await Booking.find({
      ownerId: userId,
      status: BookingStatus.ONGOING,
    });

    const totalIncome = completedBookings.reduce((sum, b) => sum + b.totalPrice, 0);

    // Group income by month
    const monthlyIncome: { [key: string]: number } = {};
    completedBookings.forEach((b) => {
      const month = new Date(b.endDate).toLocaleString('default', {
        month: 'short',
        year: 'numeric',
      });
      monthlyIncome[month] = (monthlyIncome[month] || 0) + b.totalPrice;
    });

    const monthlyData = Object.keys(monthlyIncome).map((key) => ({
      month: key,
      earnings: monthlyIncome[key],
    }));

    return res.status(200).json({
      totalEarnings: totalIncome,
      completedBookingsCount: completedBookings.length,
      activeRentalsCount: activeRentals.length,
      earningsBreakdown: monthlyData,
    });
  } catch (error) {
    next(error);
  }
};
