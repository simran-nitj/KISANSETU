import { Schema, model, Document, Types } from 'mongoose';

export enum MediaType {
  IMAGE = 'IMAGE',
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO',
}

export interface IMessage extends Document {
  chatId: Types.ObjectId;
  senderId: Types.ObjectId;
  text?: string;
  mediaUrl?: string;
  mediaType?: MediaType;
  isSeen: boolean;
  seenAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    chatId: {
      type: Schema.Types.ObjectId,
      ref: 'Chat',
      required: true,
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      trim: true,
    },
    mediaUrl: {
      type: String,
    },
    mediaType: {
      type: String,
      enum: Object.values(MediaType),
    },
    isSeen: {
      type: Boolean,
      default: false,
    },
    seenAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const Message = model<IMessage>('Message', MessageSchema);
