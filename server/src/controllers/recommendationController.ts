import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { Equipment } from '../models/Equipment.js';
import { Profile } from '../models/Profile.js';
import { Recommendation } from '../models/Recommendation.js';

/**
 * Fetch personalized recommendations
 * GET /api/recommendations
 */
export const getMyRecommendations = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const userId = req.user?._id;

    // Load Profile
    const profile = await Profile.findOne({ userId });

    // 1. Crop-Based Recommendation
    // Match equipment category/description against crops grown by this farmer
    const userCrops = profile?.cropTypes || [];
    let cropBased: any[] = [];
    if (userCrops.length > 0) {
      cropBased = await Equipment.find({
        verificationStatus: 'APPROVED',
        $or: [
          { category: { $in: userCrops } },
          { description: { $regex: userCrops.join('|'), $options: 'i' } },
        ],
      })
        .limit(3)
        .populate('ownerId', 'name rating');
    }

    // 2. Seasonal Recommendation
    // Deduce season based on current calendar month
    const currentMonth = new Date().getMonth(); // 0-11
    let seasonalCategories: string[] = [];

    if (currentMonth >= 5 && currentMonth <= 8) {
      // Monsoon (June-September) - plowing, planting, seeders, sprayers
      seasonalCategories = ['Plough', 'Seeder', 'Sprayer', 'Tractor'];
    } else if (currentMonth >= 9 && currentMonth <= 11) {
      // Autumn/Harvest (October-December) - harvesters, balers
      seasonalCategories = ['Harvester', 'Baler', 'Thresher'];
    } else {
      // General/Spring - cultivators, irrigation pumps
      seasonalCategories = ['Cultivator', 'Pump', 'Tractor'];
    }

    const seasonal = await Equipment.find({
      verificationStatus: 'APPROVED',
      category: { $in: seasonalCategories },
    })
      .limit(3)
      .populate('ownerId', 'name rating');

    // 3. Nearby Recommendation
    // Look up nearest based on profile pincode or generic first 5 items if coordinate is missing
    let nearby: any[] = [];
    if (profile?.location?.district) {
      nearby = await Equipment.find({
        verificationStatus: 'APPROVED',
        'address.district': profile.location.district,
      })
        .limit(3)
        .populate('ownerId', 'name rating');
    }

    // 4. Trending Equipment (Popularity based)
    const trending = await Equipment.find({ verificationStatus: 'APPROVED' })
      .sort({ rating: -1, reviewsCount: -1 })
      .limit(3)
      .populate('ownerId', 'name rating');

    // Merge & Save to Recommendation cache database collection
    const allIds = [
      ...cropBased.map((e) => e._id),
      ...seasonal.map((e) => e._id),
      ...nearby.map((e) => e._id),
      ...trending.map((e) => e._id),
    ];
    
    // Unique list of Equipment IDs
    const uniqueIds = Array.from(new Set(allIds.map((id) => id.toString()))).slice(0, 10);

    await Recommendation.findOneAndUpdate(
      { userId },
      {
        userId,
        recommendedEquipment: uniqueIds,
        lastUpdated: new Date(),
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      cropBased: cropBased.length > 0 ? cropBased : trending.slice(0, 3),
      seasonal,
      nearby: nearby.length > 0 ? nearby : trending.slice(0, 3),
      trending,
    });
  } catch (error) {
    next(error);
  }
};
