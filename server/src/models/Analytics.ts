import { Schema, model, Document } from 'mongoose';

export enum AnalyticsType {
  USER_ACTIVITY = 'USER_ACTIVITY',
  EQUIPMENT_RENTAL = 'EQUIPMENT_RENTAL',
  REVENUE = 'REVENUE',
}

export interface IAnalytics extends Document {
  type: AnalyticsType;
  date: Date;
  data: Schema.Types.Mixed;
  createdAt: Date;
  updatedAt: Date;
}

const AnalyticsSchema = new Schema<IAnalytics>(
  {
    type: {
      type: String,
      enum: Object.values(AnalyticsType),
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    data: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Analytics = model<IAnalytics>('Analytics', AnalyticsSchema);
