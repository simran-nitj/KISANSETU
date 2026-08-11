import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { Wallet } from '../models/Wallet.js';
import { KYC } from '../models/KYC.js';
import { Transaction, TransactionStatus, TransactionType, PaymentProvider } from '../models/Transaction.js';

/**
 * Get current user wallet details
 * GET /api/wallet
 */
export const getMyWallet = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const userId = req.user?._id;
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = new Wallet({ userId });
      await wallet.save();
    }
    return res.status(200).json({ wallet });
  } catch (error) {
    next(error);
  }
};

/**
 * Request money withdrawal from wallet
 * POST /api/wallet/withdraw
 */
export const requestWithdrawal = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const userId = req.user?._id;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'A positive withdrawal amount is required.' });
    }

    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found.' });
    }

    if (wallet.balance < amount) {
      return res.status(400).json({ message: 'Insufficient wallet balance.' });
    }

    // Verify KYC status
    const kyc = await KYC.findOne({ userId });
    if (!kyc || kyc.status !== 'APPROVED') {
      return res.status(403).json({ message: 'KYC approval is required before initiating withdrawals.' });
    }

    // Freeze balance: decrement balance, increment reservedBalance
    wallet.balance -= amount;
    wallet.reservedBalance += amount;
    await wallet.save();

    // Register PENDING withdrawal transaction
    const transaction = new Transaction({
      userId,
      amount,
      type: TransactionType.SETTLEMENT,
      status: TransactionStatus.PENDING,
      provider: PaymentProvider.WALLET,
      paymentDetails: {
        withdrawalAccount: kyc.bankDetails.accountNo,
        notes: `Payout request for bank details: Account=${kyc.bankDetails.accountNo}, Bank=${kyc.bankDetails.bankName}`,
      },
    });

    await transaction.save();

    return res.status(200).json({
      message: 'Withdrawal settlement request submitted successfully.',
      wallet,
      transaction,
    });
  } catch (error) {
    next(error);
  }
};
