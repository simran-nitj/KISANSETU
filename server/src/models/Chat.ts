import { Schema, model, Document, Types } from 'mongoose';

export interface IChat extends Document {
  participants: Types.ObjectId[];
  bookingId?: Types.ObjectId; // Optional link to an active booking context
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema = new Schema<IChat>(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index participants array for quick chat lookups
ChatSchema.index({ participants: 1 });

export const Chat = model<IChat>('Chat', ChatSchema);
