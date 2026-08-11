import { Schema, model, Document } from 'mongoose';

export enum SchemeType {
  SUBSIDY = 'SUBSIDY',
  LOAN = 'LOAN',
  INSURANCE = 'INSURANCE',
  SCHEME = 'SCHEME',
}

export interface IScheme extends Document {
  title: string;
  description: string;
  benefitDetails: string;
  eligibilityCriteria: string;
  type: SchemeType;
  governmentUrl?: string;
  crops: string[];
  states: string[];
  createdAt: Date;
  updatedAt: Date;
}

const SchemeSchema = new Schema<IScheme>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    benefitDetails: {
      type: String,
      required: true,
    },
    eligibilityCriteria: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(SchemeType),
      required: true,
    },
    governmentUrl: {
      type: String,
      trim: true,
    },
    crops: {
      type: [String],
      default: [],
    },
    states: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Index crops and states for filtering recommendation queries
SchemeSchema.index({ crops: 1, states: 1 });

export const Scheme = model<IScheme>('Scheme', SchemeSchema);
