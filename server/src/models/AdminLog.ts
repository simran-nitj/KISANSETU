import { Schema, model, Document, Types } from 'mongoose';

export interface IAdminLog extends Document {
  adminId: Types.ObjectId;
  action: string;
  targetType?: string; // e.g. User, Equipment, Booking, Scheme
  targetId?: Types.ObjectId;
  details?: string;
  ipAddress?: string;
  createdAt: Date;
}

const AdminLogSchema = new Schema<IAdminLog>(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    targetType: {
      type: String,
    },
    targetId: {
      type: Schema.Types.ObjectId,
    },
    details: {
      type: String,
    },
    ipAddress: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only log creation time
  }
);

export const AdminLog = model<IAdminLog>('AdminLog', AdminLogSchema);
