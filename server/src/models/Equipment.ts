import { Schema, model, Document, Types } from 'mongoose';

export enum EquipmentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface IEquipment extends Document {
  ownerId: Types.ObjectId;
  name: string;
  category: string;
  brand: string;
  condition: string;
  description?: string;
  hourlyPrice: number;
  dailyPrice: number;
  weeklyPrice: number;
  images: string[];
  videos: string[];
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  address: {
    state: string;
    district: string;
    village: string;
    pincode: string;
  };
  availabilityCalendar: {
    startDate: Date;
    endDate: Date;
  }[];
  insuranceStatus: EquipmentStatus;
  verificationStatus: EquipmentStatus;
  usageHours: number;
  rating: number;
  reviewsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const EquipmentSchema = new Schema<IEquipment>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    condition: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    hourlyPrice: {
      type: Number,
      required: true,
    },
    dailyPrice: {
      type: Number,
      required: true,
    },
    weeklyPrice: {
      type: Number,
      required: true,
    },
    images: {
      type: [String],
      default: [],
    },
    videos: {
      type: [String],
      default: [],
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    address: {
      state: { type: String, required: true, trim: true },
      district: { type: String, required: true, trim: true },
      village: { type: String, required: true, trim: true },
      pincode: { type: String, required: true, trim: true },
    },
    availabilityCalendar: [
      {
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
      },
    ],
    insuranceStatus: {
      type: String,
      enum: Object.values(EquipmentStatus),
      default: EquipmentStatus.PENDING,
    },
    verificationStatus: {
      type: String,
      enum: Object.values(EquipmentStatus),
      default: EquipmentStatus.PENDING,
    },
    usageHours: {
      type: Number,
      default: 0,
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

// Create 2dsphere index for location-based geospatial queries
EquipmentSchema.index({ location: '2dsphere' });
// Create text index for search filtering
EquipmentSchema.index({ name: 'text', brand: 'text', category: 'text', description: 'text' });

export const Equipment = model<IEquipment>('Equipment', EquipmentSchema);
