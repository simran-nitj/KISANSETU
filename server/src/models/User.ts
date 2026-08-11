import { Schema, model, Document } from 'mongoose';

export enum UserRole {
  FARMER_OWNER = 'FARMER_OWNER',
  FARMER_CUSTOMER = 'FARMER_CUSTOMER',
  ADMIN = 'ADMIN',
  CALL_CENTER = 'CALL_CENTER',
  MODERATOR = 'MODERATOR',
}

export interface IUser extends Document {
  firebaseUid: string;

  name: string;
  email?: string;
  phone: string;
  role: UserRole;
  isBanned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    
    firebaseUid: {
  type: String,
  required: true,
  unique: true,
  index: true,
},
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true, // Allows null/missing values to not collide
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.FARMER_CUSTOMER,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const User = model<IUser>("User", UserSchema);
