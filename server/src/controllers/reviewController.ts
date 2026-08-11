import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { Review, RevieweeType } from '../models/Review.js';
import { Booking, BookingStatus } from '../models/Booking.js';
import { Equipment } from '../models/Equipment.js';
import { Profile } from '../models/Profile.js';
import { uploadToCloudinary } from '../config/cloudinary.js';

/**
 * Recalculate average rating for Equipment
 */
const updateEquipmentRating = async (equipmentId: string) => {
  const stats = await Review.aggregate([
    { $match: { equipmentId: equipmentId, revieweeType: RevieweeType.EQUIPMENT } },
    {
      $group: {
        _id: '$equipmentId',
        avgRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Equipment.findByIdAndUpdate(equipmentId, {
      rating: parseFloat(stats[0].avgRating.toFixed(1)),
      reviewsCount: stats[0].totalReviews,
    });
  }
};

/**
 * Recalculate average rating for User Profile
 */
const updateProfileRating = async (userId: string) => {
  const stats = await Review.aggregate([
    { $match: { revieweeId: userId, revieweeType: { $in: [RevieweeType.OWNER, RevieweeType.CUSTOMER] } } },
    {
      $group: {
        _id: '$revieweeId',
        avgRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Profile.findOneAndUpdate(
      { userId },
      {
        rating: parseFloat(stats[0].avgRating.toFixed(1)),
        reviewsCount: stats[0].totalReviews,
      }
    );
  }
};

/**
 * Submit a review for a booking
 * POST /api/reviews
 */
export const createReview = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { bookingId, revieweeType, rating, comment, photoBase64List = [] } = req.body;

    if (!bookingId || !revieweeType || !rating) {
      return res.status(400).json({ message: 'Booking ID, reviewee type, and rating (1-5) are required.' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    // Verify booking is completed
    if (booking.status !== BookingStatus.COMPLETED) {
      return res.status(400).json({ message: 'Reviews can only be submitted for completed rentals.' });
    }

    // Verify reviewer belongs to booking
    if (!req.user?._id) {
  return res.status(401).json({
    message: "Authentication required",
  });
}

    const reviewerId = req.user._id;
    const isCustomer = booking.customerId.toString() === reviewerId.toString();
    const isOwner =booking.ownerId.toString() === reviewerId.toString();
    if (!isCustomer && !isOwner) {
      return res.status(403).json({ message: 'You are not authorized to review this booking.' });
    }

    // Upload photos
    const photos: string[] = [];
    for (const base64 of photoBase64List) {
      const uploadRes = await uploadToCloudinary(base64, 'reviews');
      photos.push(uploadRes.secure_url);
    }

    // Identify target IDs
    let equipmentId = undefined;
    let revieweeId = undefined;

    if (revieweeType === RevieweeType.EQUIPMENT) {
      if (!isCustomer) {
        return res.status(400).json({ message: 'Only customers can review the equipment.' });
      }
      equipmentId = booking.equipmentId;
    } else if (revieweeType === RevieweeType.OWNER) {
      if (!isCustomer) {
        return res.status(400).json({ message: 'Only customers can review the owner.' });
      }
      revieweeId = booking.ownerId;
    } else if (revieweeType === RevieweeType.CUSTOMER) {
      if (!isOwner) {
        return res.status(400).json({ message: 'Only owners can review the customer.' });
      }
      revieweeId = booking.customerId;
    }

    const review = new Review({
      bookingId,
      reviewerId,
      equipmentId,
      revieweeId,
      revieweeType,
      rating,
      comment,
      photos,
    });

    await review.save();

    // Trigger ratings updates
    if (equipmentId) {
      await updateEquipmentRating(equipmentId.toString());
    } else if (revieweeId) {
      await updateProfileRating(revieweeId.toString());
    }

    return res.status(201).json({
      message: 'Review submitted successfully.',
      review,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get reviews for an equipment listing
 * GET /api/reviews/equipment/:equipmentId
 */
export const getEquipmentReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { equipmentId } = req.params;
    const reviews = await Review.find({
      equipmentId,
      revieweeType: RevieweeType.EQUIPMENT,
      isFlagged: false,
    })
      .populate('reviewerId', 'name phone')
      .sort({ createdAt: -1 });

    return res.status(200).json({ reviews });
  } catch (error) {
    next(error);
  }
};

/**
 * Flag a review for moderation
 * PUT /api/reviews/:id/flag
 */
export const flagReview = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: 'Reason for flagging is required.' });
    }

    const review = await Review.findByIdAndUpdate(
      id,
      { isFlagged: true, reportReason: reason },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ message: 'Review not found.' });
    }

    return res.status(200).json({
      message: 'Review flagged for admin moderation.',
      review,
    });
  } catch (error) {
    next(error);
  }
};
