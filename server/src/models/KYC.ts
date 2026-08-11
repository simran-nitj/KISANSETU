import { Schema, model, Document, Types } from 'mongoose';

export enum KYCStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface IKYC extends Document {
  userId: Types.ObjectId;
  aadhaarNo?: string;
  panNo?: string;
  aadhaarUrl?: string;
  panUrl?: string;
  bankDetails: {
    accountNo?: string;
    ifsc?: string;
    bankName?: string;
    holderName?: string;
  };
  status: KYCStatus;
  rejectedReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const KYCSchema = new Schema<IKYC>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    aadhaarNo: {
      type: String,
      trim: true,
    },
    panNo: {
      type: String,
      trim: true,
    },
    aadhaarUrl: {
      type: String,
    },
    panUrl: {
      type: String,
    },
    bankDetails: {
      accountNo: { type: String, trim: true },
      ifsc: { type: String, trim: true },
      bankName: { type: String, trim: true },
      holderName: { type: String, trim: true },
    },
    status: {
      type: String,
      enum: Object.values(KYCStatus),
      default: KYCStatus.PENDING,
    },
    rejectedReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const KYC = model<IKYC>('KYC', KYCSchema);
