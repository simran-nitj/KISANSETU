import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { SupportTicket, TicketStatus } from '../models/SupportTicket.js';

/**
 * Raise a new support ticket
 * POST /api/support
 */
export const createTicket = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const userId = req.user?._id;
    const { category, subject, description } = req.body;

    if (!category || !subject || !description) {
      return res.status(400).json({ message: 'Category, subject, and description are required.' });
    }

    const ticket = new SupportTicket({
      userId,
      category,
      subject,
      description,
      status: TicketStatus.OPEN,
      messages: [
        {
          senderId: userId,
          text: description,
          createdAt: new Date(),
        },
      ],
    });

    await ticket.save();

    return res.status(201).json({
      message: 'Support ticket opened successfully.',
      ticket,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get support tickets for authenticated user
 * GET /api/support
 */
export const getMyTickets = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const userId = req.user?._id;
    const tickets = await SupportTicket.find({ userId }).sort({ updatedAt: -1 });
    return res.status(200).json({ tickets });
  } catch (error) {
    next(error);
  }
};

/**
 * View ticket details and messages
 * GET /api/support/:id
 */
export const getTicketById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.params;

    const ticket = await SupportTicket.findById(id).populate('messages.senderId', 'name role');
    if (!ticket) {
      return res.status(404).json({ message: 'Support ticket not found.' });
    }

    // Verify authorized party (creator, admin, moderator, or call center)
    const isCreator = ticket.userId.toString() === (req.user?._id?.toString() || '');
    const hasBackOfficeAccess = ['ADMIN', 'MODERATOR', 'CALL_CENTER'].includes(req.user?.role || '');

    if (!isCreator && !hasBackOfficeAccess) {
      return res.status(403).json({ message: 'Not authorized to view this ticket.' });
    }

    return res.status(200).json({ ticket });
  } catch (error) {
    next(error);
  }
};

/**
 * Add message to support ticket
 * POST /api/support/:id/message
 */
export const addTicketMessage = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    if (!req.user?._id) {
  return res.status(401).json({
    message: "Authentication required",
  });
}

const userId = req.user._id;
    if (!text) {
      return res.status(400).json({ message: 'Message text is required.' });
    }

    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      return res.status(404).json({ message: 'Support ticket not found.' });
    }

    const isCreator = ticket.userId.toString() === (req.user?._id?.toString() || '');
    const hasBackOfficeAccess = ['ADMIN', 'MODERATOR', 'CALL_CENTER'].includes(req.user?.role || '');

    if (!isCreator && !hasBackOfficeAccess) {
      return res.status(403).json({ message: 'Not authorized.' });
    }
    ticket.messages.push({
      senderId: userId,
      text,
      createdAt: new Date(),
    });

    // If staff replies, transition ticket status to IN_PROGRESS
    if (hasBackOfficeAccess && !isCreator) {
      ticket.status = TicketStatus.IN_PROGRESS;
    }

    await ticket.save();

    return res.status(200).json({
      message: 'Message added successfully.',
      ticket,
    });
  } catch (error) {
    next(error);
  }
};
