import { Schema, model, Document, Types } from 'mongoose';

export enum WalletStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export interface IWallet extends Document {
  userId: Types.ObjectId;
  balance: number;
  reservedBalance: number; // Balance frozen for active bookings or pending withdrawals
  status: WalletStatus;
  createdAt: Date;
  updatedAt: Date;
}

const WalletSchema = new Schema<IWallet>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },
    reservedBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(WalletStatus),
      default: WalletStatus.ACTIVE,
    },
  },
  {
    timestamps: true,
  }
);

export const Wallet = model<IWallet>('Wallet', WalletSchema);
