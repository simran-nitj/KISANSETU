import { Schema, model, Document, Types } from 'mongoose';

export enum BookingStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}
export interface IRescheduleRequest {
  _id?: Types.ObjectId;
  requestedStartDate: Date;
  requestedEndDate: Date;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: Date;
}

export interface IBooking extends Document {
  equipmentId: Types.ObjectId;
  customerId: Types.ObjectId;
  ownerId: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  securityDeposit: number;
  advancePayment: number;
  status: BookingStatus;
  cancellationReason?: string;

  rescheduleRequests: IRescheduleRequest[];

  timeline: {
    status: BookingStatus;
    timestamp: Date;
    note?: string;
  }[];

  invoiceUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    equipmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Equipment',
      required: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    securityDeposit: {
      type: Number,
      default: 0,
    },
    advancePayment: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: Object.values(BookingStatus),
      default: BookingStatus.PENDING,
    },
    cancellationReason: {
      type: String,
    },
    rescheduleRequests: [
      {
        requestedStartDate: { type: Date, required: true },
        requestedEndDate: { type: Date, required: true },
        status: {
          type: String,
          enum: ['PENDING', 'APPROVED', 'REJECTED'],
          default: 'PENDING',
        },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    timeline: [
      {
        status: { type: String, enum: Object.values(BookingStatus), required: true },
        timestamp: { type: Date, default: Date.now },
        note: { type: String },
      },
    ],
    invoiceUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Booking = model<IBooking>('Booking', BookingSchema);
