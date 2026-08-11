import { Schema, model, Document, Types } from 'mongoose';

export enum TransactionType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
  REFUND = 'REFUND',
  SETTLEMENT = 'SETTLEMENT',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export enum PaymentProvider {
  RAZORPAY = 'RAZORPAY',
  WALLET = 'WALLET',
}

export interface ITransaction extends Document {
  bookingId?: Types.ObjectId;
  walletId?: Types.ObjectId;
  userId: Types.ObjectId;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  provider: PaymentProvider;
  transactionId?: string; // external txn ID (e.g. Razorpay payment ID)
  paymentDetails: {
    platformFee?: number;
    gstAmount?: number;
    commissionAmount?: number;
    razorpayOrderId?: string;
    razorpaySignature?: string;
    withdrawalAccount?: string;
    notes?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
    },
    walletId: {
      type: Schema.Types.ObjectId,
      ref: 'Wallet',
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(TransactionType),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(TransactionStatus),
      default: TransactionStatus.PENDING,
    },
    provider: {
      type: String,
      enum: Object.values(PaymentProvider),
      required: true,
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true,
    },
    paymentDetails: {
      platformFee: { type: Number, default: 0 },
      gstAmount: { type: Number, default: 0 },
      commissionAmount: { type: Number, default: 0 },
      razorpayOrderId: { type: String },
      razorpaySignature: { type: String },
      withdrawalAccount: { type: String },
      notes: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

export const Transaction = model<ITransaction>('Transaction', TransactionSchema);
