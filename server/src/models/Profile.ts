import { Schema, model, Document, Types } from 'mongoose';

export interface IProfile extends Document {
  userId: Types.ObjectId;
  farmSize?: number; // In acres
  cropTypes: string[];
  languages: string[];
  location: {
    state?: string;
    district?: string;
    village?: string;
    pincode?: string;
  };
  rating: number;
  reviewsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProfileSchema = new Schema<IProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    farmSize: {
      type: Number,
    },
    cropTypes: {
      type: [String],
      default: [],
    },
    languages: {
      type: [String],
      default: ['English', 'Hindi'],
    },
    location: {
      state: { type: String, trim: true },
      district: { type: String, trim: true },
      village: { type: String, trim: true },
      pincode: { type: String, trim: true },
    },
    rating: {
      type: Number,
      default: 5.0,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Profile = model<IProfile>('Profile', ProfileSchema);
