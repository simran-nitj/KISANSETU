import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { Equipment, EquipmentStatus } from '../models/Equipment.js';
import { uploadToCloudinary } from '../config/cloudinary.js';

/**
 * Add a new equipment listing
 * POST /api/equipment
 */
export const createEquipment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const ownerId = req.user?._id;
    const {
      name,
      category,
      brand,
      condition,
      description,
      hourlyPrice,
      dailyPrice,
      weeklyPrice,
      longitude,
      latitude,
      address,
      availabilityCalendar,
      imageBase64List = [],
      videoBase64List = [],
    } = req.body;

    // Verify coordinates
    if (longitude === undefined || latitude === undefined) {
      return res.status(400).json({ message: 'GPS Location coordinates are required.' });
    }

    // Upload media to Cloudinary
    const images: string[] = [];
    for (const imgBase64 of imageBase64List) {
      const uploadRes = await uploadToCloudinary(imgBase64, 'equipments/images');
      images.push(uploadRes.secure_url);
    }

    const videos: string[] = [];
    for (const vidBase64 of videoBase64List) {
      const uploadRes = await uploadToCloudinary(vidBase64, 'equipments/videos');
      videos.push(uploadRes.secure_url);
    }

    const equipment = new Equipment({
      ownerId,
      name,
      category,
      brand,
      condition,
      description,
      hourlyPrice,
      dailyPrice,
      weeklyPrice,
      images,
      videos,
      location: {
        type: 'Point',
        coordinates: [Number(longitude), Number(latitude)], // [lng, lat]
      },
      address,
      availabilityCalendar: availabilityCalendar || [],
    });

    await equipment.save();

    return res.status(201).json({
      message: 'Equipment listing created successfully. Under verification review.',
      equipment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all equipment listings with filters & geospatial searches
 * GET /api/equipment
 */
export const listEquipment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const {
      category,
      brand,
      state,
      district,
      village,
      minPrice,
      maxPrice,
      rating,
      search,
      longitude,
      latitude,
      maxDistance = 50, // default 50 km
      sortBy = 'newest',
      page = 1,
      limit = 10,
    } = req.query;

    const query: any = { verificationStatus: EquipmentStatus.APPROVED };

    // Apply filters
    if (category) query.category = category;
    if (brand) query.brand = brand;
    if (state) query['address.state'] = { $regex: state as string, $options: 'i' };
    if (district) query['address.district'] = { $regex: district as string, $options: 'i' };
    if (village) query['address.village'] = { $regex: village as string, $options: 'i' };

    if (minPrice || maxPrice) {
      query.dailyPrice = {};
      if (minPrice) query.dailyPrice.$gte = Number(minPrice);
      if (maxPrice) query.dailyPrice.$lte = Number(maxPrice);
    }

    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    // Keyword Text search
    if (search) {
      query.$text = { $search: search as string };
    }

    // Geolocation search: Find equipment within maxDistance in kilometers
    if (longitude && latitude) {
      const radiusInMeters = Number(maxDistance) * 1000;
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [Number(longitude), Number(latitude)],
          },
          $maxDistance: radiusInMeters,
        },
      };
    }

    // Setup Sort criteria
    let sort: any = {};
    if (sortBy === 'price_asc') {
      sort.dailyPrice = 1;
    } else if (sortBy === 'price_desc') {
      sort.dailyPrice = -1;
    } else if (sortBy === 'popularity') {
      sort.reviewsCount = -1;
    } else if (sortBy === 'rating') {
      sort.rating = -1;
    } else if (sortBy === 'newest') {
      sort.createdAt = -1;
    }

    // Execute paginated query
    const skipCount = (Number(page) - 1) * Number(limit);
    const equipment = await Equipment.find(query)
      .sort(sort)
      .limit(Number(limit))
      .skip(skipCount)
      .populate('ownerId', 'name phone rating');

    const total = await Equipment.countDocuments(query);

    return res.status(200).json({
      equipment,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch detail of a single equipment
 * GET /api/equipment/:id
 */
export const getEquipmentById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.params;
    const equipment = await Equipment.findById(id).populate('ownerId', 'name phone rating reviewsCount');
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment listing not found.' });
    }
    return res.status(200).json({ equipment });
  } catch (error) {
    next(error);
  }
};

/**
 * Edit an equipment listing
 * PUT /api/equipment/:id
 */
export const updateEquipment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.params;

    const equipment = await Equipment.findById(id);
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment listing not found.' });
    }
    if (!req.user?._id) {
  return res.status(401).json({
    message: "Authentication required",
  });
}
 const ownerId = req.user?._id;
    // Ensure user is the owner
    if (equipment.ownerId.toString() !== ownerId.toString() && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to modify this listing.' });
    }

    const {
      name,
      category,
      brand,
      condition,
      description,
      hourlyPrice,
      dailyPrice,
      weeklyPrice,
      availabilityCalendar,
      address,
    } = req.body;

    const updated = await Equipment.findByIdAndUpdate(
      id,
      {
        $set: {
          name,
          category,
          brand,
          condition,
          description,
          hourlyPrice,
          dailyPrice,
          weeklyPrice,
          availabilityCalendar,
          address,
          verificationStatus: EquipmentStatus.PENDING, // Require re-verification after edits
        },
      },
      { new: true }
    );

    return res.status(200).json({
      message: 'Listing updated successfully. Under review for re-verification.',
      equipment: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an equipment listing
 * DELETE /api/equipment/:id
 */
export const deleteEquipment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.params;
    if (!req.user?._id) {
  return res.status(401).json({
    message: "Authentication required",
  });
}
    const ownerId = req.user?._id;

    const equipment = await Equipment.findById(id);
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment listing not found.' });
    }

    if (equipment.ownerId.toString() !== ownerId.toString() && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to delete this listing.' });
    }

    await Equipment.findByIdAndDelete(id);

    return res.status(200).json({ message: 'Equipment listing deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
