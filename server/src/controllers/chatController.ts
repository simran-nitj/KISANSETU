import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { Chat } from '../models/Chat.js';
import { Message, MediaType } from '../models/Message.js';
import { User } from '../models/User.js';
import { uploadToCloudinary } from '../config/cloudinary.js';

/**
 * Initialize a new chat or retrieve existing one
 * POST /api/chat
 */
export const startChat = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const senderId = req.user?._id;
    const { recipientId, bookingId } = req.body;

    if (!recipientId) {
      return res.status(400).json({ message: 'Recipient ID is required.' });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient user not found.' });
    }

    // Check if chat already exists between these participants
    let chat = await Chat.findOne({
      participants: { $all: [senderId, recipientId] },
    });

    if (!chat) {
      chat = new Chat({
        participants: [senderId, recipientId],
        bookingId,
      });
      await chat.save();
    }

    return res.status(200).json({ chat });
  } catch (error) {
    next(error);
  }
};

/**
 * Get chats list for authenticated user
 * GET /api/chat
 */
export const getMyChats = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const userId = req.user?._id;

    const chats = await Chat.find({ participants: userId })
      .populate('participants', 'name phone role')
      .populate('bookingId')
      .sort({ lastMessageAt: -1 });

    return res.status(200).json({ chats });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch messages inside a chat room (paginated)
 * GET /api/chat/:chatId/messages
 */
export const getChatMessages = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat room not found.' });
    }
    if (!req.user?._id) {
  return res.status(401).json({
    message: "Authentication required",
  });
}

const userId = req.user._id;
    // Verify participant
    if (!chat.participants.includes(userId)) {
      return res.status(403).json({ message: 'Not authorized to view messages in this chat room.' });
    }

    // Fetch messages
    const skipCount = (Number(page) - 1) * Number(limit);
    const messages = await Message.find({ chatId })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(skipCount);

    // Mark other participant's messages as seen
    await Message.updateMany(
      { chatId, senderId: { $ne: userId }, isSeen: false },
      { $set: { isSeen: true, seenAt: new Date() } }
    );

    return res.status(200).json({
      messages: messages.reverse(), // Return in chronological order
      pagination: {
        page: Number(page),
        limit: Number(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Post a new message with media support
 * POST /api/chat/:chatId/messages
 */
export const postMessage = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { chatId } = req.params;
    if (!req.user?._id) {
  return res.status(401).json({
    message: "Authentication required",
  });
}

const senderId = req.user._id;
    const { text, mediaBase64, mediaType } = req.body;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat room not found.' });
    }

    if (!chat.participants.includes(senderId)) {
      return res.status(403).json({ message: 'Not authorized to send messages here.' });
    }

    let mediaUrl = '';
    if (mediaBase64 && mediaType) {
      const uploadRes = await uploadToCloudinary(mediaBase64, 'chats/media');
      mediaUrl = uploadRes.secure_url;
    }

    const message = new Message({
      chatId,
      senderId,
      text,
      mediaUrl,
      mediaType: mediaType as MediaType,
      isSeen: false,
    });

    await message.save();

    // Update lastMessageAt on Chat
    await Chat.findByIdAndUpdate(chatId, { lastMessageAt: new Date() });

    return res.status(201).json({ message });
  } catch (error) {
    next(error);
  }
};
