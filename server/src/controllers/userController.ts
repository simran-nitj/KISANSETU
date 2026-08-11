import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { User, UserRole } from '../models/User.js';
import { Profile } from '../models/Profile.js';
import { Booking } from '../models/Booking.js';
import { AdminLog } from '../models/AdminLog.js';

/**
 * Search and list users
 * GET /api/users
 */
export const listUsers = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { role, isBanned, search, limit = 10, page = 1 } = req.query;

    const query: any = {};

    if (role && Object.values(UserRole).includes(role as UserRole)) {
      query.role = role;
    }
    if (isBanned) {
      query.isBanned = isBanned === 'true';
    }
    if (search) {
      query.$or = [
        { name: { $regex: search as string, $options: 'i' } },
        { phone: { $regex: search as string, $options: 'i' } },
        { email: { $regex: search as string, $options: 'i' } },
      ];
    }

    const skipCount = (Number(page) - 1) * Number(limit);
    const users = await User.find(query)
      .limit(Number(limit))
      .skip(skipCount)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    return res.status(200).json({
      users,
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
 * Get user detail
 * GET /api/users/:id
 */
export const getUserById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const profile = await Profile.findOne({ userId: id });

    return res.status(200).json({
      user,
      profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user role (Admin only)
 * PUT /api/users/:id/role
 */
export const updateUserRole = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!Object.values(UserRole).includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified.' });
    }

    const user = await User.findByIdAndUpdate(id, { role }, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Log admin action
    await AdminLog.create({
      adminId: req.user?._id,
      action: 'UPDATE_ROLE',
      targetType: 'User',
      targetId: user._id,
      details: `Changed role of user ${user.phone} to ${role}`,
    });

    return res.status(200).json({
      message: 'User role updated successfully.',
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Ban or unban user (Admin / Moderator only)
 * PUT /api/users/:id/ban
 */
export const toggleUserBan = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.params;
    const { isBanned } = req.body;

    if (typeof isBanned !== 'boolean') {
      return res.status(400).json({ message: 'isBanned status must be a boolean.' });
    }

    // Prevent banning yourself
    if (id === req.user?._id.toString()) {
      return res.status(400).json({ message: 'You cannot suspend your own account.' });
    }

    const user = await User.findByIdAndUpdate(id, { isBanned }, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Log action
    await AdminLog.create({
      adminId: req.user?._id,
      action: isBanned ? 'BAN_USER' : 'UNBAN_USER',
      targetType: 'User',
      targetId: user._id,
      details: `${isBanned ? 'Suspended' : 'Reactivated'} account of user ${user.phone}`,
    });

    return res.status(200).json({
      message: `User account has been ${isBanned ? 'suspended' : 'reactivated'}.`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user bookings / rental history
 * GET /api/users/:id/activity
 */
export const getUserActivity = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.params;

    const rentalsAsOwner = await Booking.find({ ownerId: id }).populate('equipmentId');
    const rentalsAsCustomer = await Booking.find({ customerId: id }).populate('equipmentId');

    return res.status(200).json({
      rentalsAsOwner,
      rentalsAsCustomer,
    });
  } catch (error) {
    next(error);
  }
};
