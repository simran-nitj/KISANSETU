import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { Notification } from '../models/Notification.js';

/**
 * Get all notifications for authenticated user
 * GET /api/notifications
 */
export const getMyNotifications = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const userId = req.user?._id;
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    return res.status(200).json({ notifications });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark notifications as read
 * PUT /api/notifications/read
 */
export const markNotificationsAsRead = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const userId = req.user?._id;
    const { notificationIds } = req.body;

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return res.status(400).json({ message: 'notificationIds must be a valid array.' });
    }

    await Notification.updateMany(
      { _id: { $in: notificationIds }, userId },
      { $set: { isRead: true } }
    );

    return res.status(200).json({ message: 'Notifications marked as read successfully.' });
  } catch (error) {
    next(error);
  }
};
