import { Schema, model, Document, Types } from 'mongoose';

export enum ReportTargetType {
  USER = 'USER',
  EQUIPMENT = 'EQUIPMENT',
  REVIEW = 'REVIEW',
}

export enum ReportStatus {
  PENDING = 'PENDING',
  RESOLVED = 'RESOLVED',
}

export interface IReport extends Document {
  reporterId: Types.ObjectId;
  targetType: ReportTargetType;
  targetId: Types.ObjectId; // References User, Equipment, or Review id
  reason: string;
  status: ReportStatus;
  actionTaken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    reporterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetType: {
      type: String,
      enum: Object.values(ReportTargetType),
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'targetType', // Dynamic reference based on targetType
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(ReportStatus),
      default: ReportStatus.PENDING,
    },
    actionTaken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Report = model<IReport>('Report', ReportSchema);
