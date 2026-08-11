import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { Booking, BookingStatus } from '../models/Booking.js';
import { Equipment, EquipmentStatus } from '../models/Equipment.js';
import { User } from '../models/User.js';
import { KYC, KYCStatus } from '../models/KYC.js';
import { Wishlist } from '../models/Wishlist.js';
import { Report } from '../models/Report.js';

/**
 * Get aggregated data for Owner Dashboard
 * GET /api/dashboard/owner
 */
export const getOwnerDashboard = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const ownerId = req.user?._id;

    // Revenue completed
    const completedBookings = await Booking.find({
      ownerId,
      status: BookingStatus.COMPLETED,
    });
    const revenue = completedBookings.reduce((sum, b) => sum + b.totalPrice, 0);

    // Bookings count total
    const totalBookings = await Booking.countDocuments({ ownerId });

    // Active rentals count
    const activeRentals = await Booking.countDocuments({
      ownerId,
      status: BookingStatus.ONGOING,
    });

    // Equipment listings count
    const equipmentCount = await Equipment.countDocuments({ ownerId });

    // Most Booked Equipment
    const bookingsGrouped = await Booking.aggregate([
      { $match: { ownerId } },
      { $group: { _id: '$equipmentId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);

    let mostBooked = null;
    if (bookingsGrouped.length > 0) {
      mostBooked = await Equipment.findById(bookingsGrouped[0]._id);
    }

    return res.status(200).json({
      revenue,
      totalBookings,
      activeRentals,
      equipmentCount,
      mostBooked: mostBooked ? { equipment: mostBooked, count: bookingsGrouped[0].count } : null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get aggregated data for Customer Dashboard
 * GET /api/dashboard/customer
 */
export const getCustomerDashboard = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const customerId = req.user?._id;

    const currentRentals = await Booking.find({
      customerId,
      status: BookingStatus.ONGOING,
    }).populate('equipmentId');

    const totalRentals = await Booking.countDocuments({ customerId });
    const completedRentals = await Booking.countDocuments({
      customerId,
      status: BookingStatus.COMPLETED,
    });

    const wishlistRecord = await Wishlist.findOne({ userId: customerId }).populate('equipmentIds');
    const wishlistCount = wishlistRecord ? wishlistRecord.equipmentIds.length : 0;

    return res.status(200).json({
      currentRentals,
      totalRentals,
      completedRentals,
      wishlistCount,
      wishlist: wishlistRecord ? wishlistRecord.equipmentIds : [],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get aggregated statistics for Admin Dashboard
 * GET /api/dashboard/admin
 */
export const getAdminDashboard = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const usersCount = await User.countDocuments();
    const bookingsCount = await Booking.countDocuments();
    
    // Revenue completed
    const completedBookings = await Booking.find({ status: BookingStatus.COMPLETED });
    const totalRevenue = completedBookings.reduce((sum, b) => sum + b.totalPrice, 0);

    const pendingKYC = await KYC.countDocuments({ status: KYCStatus.PENDING });
    const pendingEquipmentApprovals = await Equipment.countDocuments({
      verificationStatus: EquipmentStatus.PENDING,
    });

    const activeDisputes = await Report.countDocuments({ status: 'PENDING' });

    return res.status(200).json({
      usersCount,
      bookingsCount,
      totalRevenue,
      pendingKYC,
      pendingEquipmentApprovals,
      activeDisputes,
    });
  } catch (error) {
    next(error);
  }
};
