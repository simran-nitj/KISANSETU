import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { Transaction, TransactionStatus, TransactionType, PaymentProvider } from '../models/Transaction.js';
import { Booking, BookingStatus } from '../models/Booking.js';
import { Wallet } from '../models/Wallet.js';
import { Notification, NotificationType } from '../models/Notification.js';
import { createRazorpayOrder, verifyRazorpaySignature } from '../config/razorpay.js';

/**
 * Initiate Razorpay payment for a booking
 * POST /api/payments/initiate
 */
export const initiatePayment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { bookingId } = req.body;
    if (!req.user?._id) {
  return res.status(401).json({
    message: "Authentication required",
  });
}
    const userId = req.user?._id;

    const booking = await Booking.findById(bookingId).populate('equipmentId');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    if (booking.customerId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to pay for this booking.' });
    }

    if (booking.status !== BookingStatus.ACCEPTED) {
      return res.status(400).json({ message: 'Payment can only be initiated for approved/accepted bookings.' });
    }

    // Initiate order
    const amount = booking.totalPrice;
    const receiptId = `receipt_${bookingId.toString().substring(0, 10)}_${Date.now().toString().substring(8)}`;
    const rzpOrder = await createRazorpayOrder(amount, receiptId);

    // Save pending transaction
    const transaction = new Transaction({
      bookingId: booking._id,
      userId,
      amount,
      type: TransactionType.DEBIT,
      status: TransactionStatus.PENDING,
      provider: PaymentProvider.RAZORPAY,
      transactionId: rzpOrder.id,
      paymentDetails: {
        razorpayOrderId: rzpOrder.id,
        notes: `Advance payment + deposit for booking ${booking._id}`,
      },
    });

    await transaction.save();

    return res.status(200).json({
      message: 'Razorpay order created successfully.',
      razorpayOrder: rzpOrder,
      transaction,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify Razorpay payment signature
 * POST /api/payments/verify
 */
export const verifyPayment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;
    const userId = req.user?._id;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Razorpay checkout verification fields are required.' });
    }

    // Verify signature
    const isValid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) {
      // Mark transaction as failed
      await Transaction.findOneAndUpdate(
        { transactionId: razorpay_order_id },
        { status: TransactionStatus.FAILED }
      );
      return res.status(400).json({ message: 'Payment signature verification failed.' });
    }

    // Find and update transaction
    const transaction = await Transaction.findOneAndUpdate(
      { transactionId: razorpay_order_id },
      {
        $set: {
          status: TransactionStatus.SUCCESS,
          transactionId: razorpay_payment_id, // Save actual gateway txn ID
          'paymentDetails.razorpaySignature': razorpay_signature,
        },
      },
      { new: true }
    );

    // Update booking status to active/ongoing
    const booking = await Booking.findById(bookingId);
    if (booking) {
      booking.status = BookingStatus.ONGOING;
      booking.timeline.push({
        status: BookingStatus.ONGOING,
        timestamp: new Date(),
        note: `Payment verified. Transaction ID: ${razorpay_payment_id}. Rental active.`,
      });
      await booking.save();

      // Create notification
      await Notification.create({
        userId: booking.ownerId,
        title: 'Payment Received & Rental Active',
        body: `Payment for booking ${booking._id} received. The customer has started the rental.`,
        type: NotificationType.PAYMENT,
      });

      await Notification.create({
        userId: booking.customerId,
        title: 'Payment Successful',
        body: `Your payment of INR ${booking.totalPrice.toFixed(2)} was verified successfully.`,
        type: NotificationType.PAYMENT,
      });
    }

    return res.status(200).json({
      message: 'Payment verified and captured successfully.',
      transaction,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch all payments/transactions for authenticated user
 * GET /api/payments/transactions
 */
export const getMyTransactions = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const userId = req.user?._id;
    const transactions = await Transaction.find({ userId })
      .populate('bookingId')
      .sort({ createdAt: -1 });

    return res.status(200).json({ transactions });
  } catch (error) {
    next(error);
  }
};
