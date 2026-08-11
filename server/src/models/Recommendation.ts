import { Schema, model, Document, Types } from 'mongoose';

export interface IRecommendation extends Document {
  userId: Types.ObjectId;
  recommendedEquipment: Types.ObjectId[];
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RecommendationSchema = new Schema<IRecommendation>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    recommendedEquipment: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Equipment',
      },
    ],
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const Recommendation = model<IRecommendation>('Recommendation', RecommendationSchema);
