import { Schema, model, Document, Types } from 'mongoose';

export interface IWishlist extends Document {
  userId: Types.ObjectId;
  equipmentIds: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const WishlistSchema = new Schema<IWishlist>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    equipmentIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Equipment',
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Wishlist = model<IWishlist>('Wishlist', WishlistSchema);
