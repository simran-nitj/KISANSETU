import { Schema, model, Document, Types } from 'mongoose';

export enum RevieweeType {
  EQUIPMENT = 'EQUIPMENT',
  OWNER = 'OWNER',
  CUSTOMER = 'CUSTOMER',
}

export interface IReview extends Document {
  bookingId: Types.ObjectId;
  reviewerId: Types.ObjectId;
  equipmentId?: Types.ObjectId; // Present if type is EQUIPMENT
  revieweeId?: Types.ObjectId;  // Present if type is OWNER or CUSTOMER
  revieweeType: RevieweeType;
  rating: number;
  comment?: string;
  photos: string[];
  isFlagged: boolean;
  reportReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    reviewerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    equipmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Equipment',
    },
    revieweeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    revieweeType: {
      type: String,
      enum: Object.values(RevieweeType),
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
    },
    photos: {
      type: [String],
      default: [],
    },
    isFlagged: {
      type: Boolean,
      default: false,
    },
    reportReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index so a reviewer can review a booking for a specific target only once
ReviewSchema.index({ bookingId: 1, reviewerId: 1, revieweeType: 1 }, { unique: true });

export const Review = model<IReview>('Review', ReviewSchema);
