import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { Booking, BookingStatus } from '../models/Booking.js';
import { Equipment } from '../models/Equipment.js';
import { User } from '../models/User.js';
import { Wallet } from '../models/Wallet.js';
import { Invoice } from '../models/Invoice.js';
import { Notification, NotificationType } from '../models/Notification.js';
import { generateInvoicePDF } from '../utils/pdfGenerator.js';
import { generateQRCode } from '../utils/qrCode.js';

/**
 * Helper to calculate booking financial totals
 */
const calculatePricing = (
  startDate: Date,
  endDate: Date,
  dailyPrice: number
) => {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const durationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

  const subtotal = dailyPrice * durationDays;
  const securityDeposit = Math.round(subtotal * 0.15); // 15% security deposit
  const platformFee = Math.round(subtotal * 0.05); // 5% platform fee
  const gst = Math.round(platformFee * 0.18); // 18% GST on platform fee
  const totalAmount = subtotal + securityDeposit + platformFee + gst;

  return { durationDays, subtotal, securityDeposit, platformFee, gst, totalAmount };
};

/**
 * Create a new booking request
 * POST /api/bookings
 */
export const createBooking = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const customerId = req.user?._id;
    const { equipmentId, startDate, endDate } = req.body;

    if (!equipmentId || !startDate || !endDate) {
      return res.status(400).json({ message: 'Equipment ID, start date, and end date are required.' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return res.status(400).json({ message: 'Start date must be prior to end date.' });
    }

    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found.' });
    }

    // Calculate billing
    const pricing = calculatePricing(start, end, equipment.dailyPrice);

    // Create booking
    const booking = new Booking({
      equipmentId,
      customerId,
      ownerId: equipment.ownerId,
      startDate: start,
      endDate: end,
      totalPrice: pricing.totalAmount,
      securityDeposit: pricing.securityDeposit,
      advancePayment: pricing.subtotal,
      status: BookingStatus.PENDING,
      timeline: [
        {
          status: BookingStatus.PENDING,
          note: 'Booking request sent by customer.',
        },
      ],
  
    });

    await booking.save();

    // Create notification for equipment owner
    await Notification.create({
      userId: equipment.ownerId,
      title: 'New Booking Request Received',
      body: `You received a request for ${equipment.name} from ${req.user?.name}.`,
      type: NotificationType.BOOKING,
    });

    return res.status(201).json({
      message: 'Booking request submitted successfully.',
      booking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Owner accepts booking request & generates Invoice
 * PUT /api/bookings/:id/accept
 */
export const acceptBooking = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.params;
    const ownerId = req.user?._id;

    const booking = await Booking.findById(id).populate('equipmentId customerId');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    if (ownerId!=null &&booking.ownerId.toString() !== ownerId.toString()) {
      return res.status(403).json({ message: 'Not authorized to accept this booking.' });
    }

    if (booking.status !== BookingStatus.PENDING) {
      return res.status(400).json({ message: `Cannot accept booking. Current status is ${booking.status}.` });
    }

    // Accept booking and update timeline
    booking.status = BookingStatus.ACCEPTED;
    booking.timeline.push({
  status: BookingStatus.ACCEPTED,
  timestamp: new Date(),
  note: "Booking request accepted by owner.",
});

    // Generate Invoice
    const equipment = booking.equipmentId as any;
    const customer = booking.customerId as any;
    const farmer = await User.findById(ownerId);

    const pricing = calculatePricing(booking.startDate, booking.endDate, equipment.dailyPrice);
    const invoiceNo = `KS-${Date.now()}`;

    // PDF generation
    const pdfUrl = await generateInvoicePDF({
      invoiceNo,
      date: new Date(),
      farmerName: farmer?.name || 'Owner',
      farmerPhone: farmer?.phone || '',
      customerName: customer.name,
      customerPhone: customer.phone,
      equipmentName: equipment.name,
      startDate: booking.startDate.toLocaleDateString(),
      endDate: booking.endDate.toLocaleDateString(),
      durationDays: pricing.durationDays,
      rate: equipment.dailyPrice,
      subtotal: pricing.subtotal,
      gst: pricing.gst,
      platformFee: pricing.platformFee,
      securityDeposit: pricing.securityDeposit,
      totalAmount: pricing.totalAmount,
    });

    // QR generation
    const qrCode = await generateQRCode(
      `https://kisansetu.com/invoices/${invoiceNo}?booking=${booking._id}`
    );

    const invoice = new Invoice({
      bookingId: booking._id,
      invoiceNo,
      subtotal: pricing.subtotal,
      gst: pricing.gst,
      platformFee: pricing.platformFee,
      securityDeposit: pricing.securityDeposit,
      totalAmount: pricing.totalAmount,
      pdfUrl,
      qrCode,
    });

    await invoice.save();

    booking.invoiceUrl = pdfUrl;
    await booking.save();

    // Notify customer
    await Notification.create({
      userId: booking.customerId,
      title: 'Booking Request Approved',
      body: `Your rental request for ${equipment.name} has been approved by the owner. Invoice generated.`,
      type: NotificationType.BOOKING,
    });

    return res.status(200).json({
      message: 'Booking accepted. Invoice generated successfully.',
      booking,
      invoice,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Owner rejects booking request
 * PUT /api/bookings/:id/reject
 */
export const rejectBooking = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findById(id).populate('equipmentId');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    if (booking.ownerId.toString() !== req.user?._id.toString()) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    if (booking.status !== BookingStatus.PENDING) {
      return res.status(400).json({ message: 'Can only reject pending bookings.' });
    }

    booking.status = BookingStatus.CANCELLED;
    booking.cancellationReason = reason || 'Rejected by owner';
    booking.timeline.push({
      status: BookingStatus.CANCELLED,
      timestamp: new Date(),
      note: `Rejected by owner. Reason: ${booking.cancellationReason}`,
    });

    await booking.save();

    // Notify customer
    await Notification.create({
      userId: booking.customerId,
      title: 'Booking Request Rejected',
      body: `Your rental request for ${(booking.equipmentId as any).name} was declined.`,
      type: NotificationType.BOOKING,
    });

    return res.status(200).json({
      message: 'Booking request rejected successfully.',
      booking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Complete booking & settle payment releases
 * PUT /api/bookings/:id/complete
 */
export const completeBooking = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id).populate('equipmentId');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    // Only owner or admin can mark complete
    if (booking.ownerId.toString() !== req.user?._id.toString() && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    if (booking.status !== BookingStatus.ONGOING) {
      return res.status(400).json({ message: 'Only active/ongoing rentals can be completed.' });
    }

    booking.status = BookingStatus.COMPLETED;
    booking.timeline.push({
      status: BookingStatus.COMPLETED,
      timestamp: new Date(),
      note: 'Equipment returned. Rental completed.',
    });

    await booking.save();

    // Credit earnings to owner's wallet (net of platform fee)
    const pricing = calculatePricing(
      booking.startDate,
      booking.endDate,
      (booking.equipmentId as any).dailyPrice
    );
    const ownerEarnings = pricing.subtotal;

    await Wallet.findOneAndUpdate(
      { userId: booking.ownerId },
      { $inc: { balance: ownerEarnings } }
    );

    // Release/Refund security deposit to customer's wallet
    await Wallet.findOneAndUpdate(
      { userId: booking.customerId },
      { $inc: { balance: pricing.securityDeposit } }
    );

    // Notify customer
    await Notification.create({
      userId: booking.customerId,
      title: 'Rental Completed & Deposit Released',
      body: `Your rental for ${(booking.equipmentId as any).name} is complete. Security deposit returned to wallet.`,
      type: NotificationType.BOOKING,
    });

    return res.status(200).json({
      message: 'Rental completed, earnings settled and security deposit refunded.',
      booking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reschedule booking request
 * POST /api/bookings/:id/reschedule
 */
export const requestReschedule = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.params;
    const { requestedStartDate, requestedEndDate } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    if (booking.customerId.toString() !== req.user?._id.toString()) {
      return res.status(403).json({ message: 'Only the renter can request rescheduling.' });
    }

    booking.rescheduleRequests.push({
      
      requestedStartDate: new Date(requestedStartDate),
      requestedEndDate: new Date(requestedEndDate),
      status: 'PENDING',
      createdAt: new Date(),
    });

await booking.save();

    // Notify owner
    await Notification.create({
      userId: booking.ownerId,
      title: 'Reschedule Request Received',
      body: `Customer requested to change dates for booking ${booking._id}.`,
      type: NotificationType.BOOKING,
    });

    return res.status(200).json({
      message: 'Reschedule request sent to owner.',
      booking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle reschedule response
 * PUT /api/bookings/:id/reschedule/respond
 */
export const respondReschedule = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.params;
    const { requestId, status } = req.body; // 'APPROVED' or 'REJECTED'

    const booking = await Booking.findById(id).populate('equipmentId');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    if (booking.ownerId.toString() !== req.user?._id.toString()) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    const request = booking.rescheduleRequests.find(
  (request) => request._id?.toString() === requestId
);

if (!request || request.status !== "PENDING") {
  return res.status(400).json({
    message: "Reschedule request not found or already processed.",
  });
}

    request.status = status;

    if (status === 'APPROVED') {
      booking.startDate = request.requestedStartDate;
      booking.endDate = request.requestedEndDate;

      // Recalculate price
      const pricing = calculatePricing(
        booking.startDate,
        booking.endDate,
        (booking.equipmentId as any).dailyPrice
      );
      booking.totalPrice = pricing.totalAmount;
      booking.securityDeposit = pricing.securityDeposit;
      booking.advancePayment = pricing.subtotal;

      booking.timeline.push({
        status: booking.status,
        timestamp: new Date(),
        note: `Booking rescheduled to ${booking.startDate.toLocaleDateString()} - ${booking.endDate.toLocaleDateString()}`,
      });
    }

    await booking.save();

    // Notify customer
    await Notification.create({
      userId: booking.customerId,
      title: `Reschedule Request ${status}`,
      body: `Owner has ${status.toLowerCase()} your dates rescheduling request.`,
      type: NotificationType.BOOKING,
    });

    return res.status(200).json({
      message: `Reschedule request ${status.toLowerCase()} successfully.`,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List bookings of current authenticated user
 * GET /api/bookings
 */
export const listMyBookings = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const userId = req.user?._id;
    const { role } = req.query; // 'owner' or 'customer'

    let filter: any = {};
    if (role === 'owner') {
      filter.ownerId = userId;
    } else if (role === 'customer') {
      filter.customerId = userId;
    } else {
      filter.$or = [{ customerId: userId }, { ownerId: userId }];
    }

    const bookings = await Booking.find(filter)
      .populate('equipmentId')
      .populate('customerId', 'name phone')
      .populate('ownerId', 'name phone')
      .sort({ createdAt: -1 });

    return res.status(200).json({ bookings });
  } catch (error) {
    next(error);
  }
};
