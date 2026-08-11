import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { Scheme, SchemeType } from '../models/Scheme.js';
import { Profile } from '../models/Profile.js';

/**
 * Get all schemes with filters (crops, states, type)
 * GET /api/schemes
 */
export const listSchemes = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { crop, state, type } = req.query;

    const query: any = {};

    if (crop) {
      query.crops = { $in: [crop as string] };
    }
    if (state) {
      query.states = { $in: [state as string, 'All'] };
    }
    if (type && Object.values(SchemeType).includes(type as SchemeType)) {
      query.type = type;
    }

    const schemes = await Scheme.find(query).sort({ createdAt: -1 });

    return res.status(200).json({ schemes });
  } catch (error) {
    next(error);
  }
};

/**
 * Recommend schemes matching current user profile
 * GET /api/schemes/recommend
 */
export const recommendSchemes = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const userId = req.user?._id;

    // Fetch user profile
    const profile = await Profile.findOne({ userId });
    if (!profile) {
      return res.status(200).json({ recommendedSchemes: [] });
    }

    const state = profile.location?.state || '';
    const crops = profile.cropTypes || [];

    // Query matching state or All, and overlap crops
    const query: any = {
      $or: [
        { states: 'All' },
        ...(state ? [{ states: { $regex: state, $options: 'i' } }] : []),
      ],
    };

    if (crops.length > 0) {
      query.crops = { $in: crops };
    }

    const recommended = await Scheme.find(query).limit(5);

    return res.status(200).json({ recommendedSchemes: recommended });
  } catch (error) {
    next(error);
  }
};
