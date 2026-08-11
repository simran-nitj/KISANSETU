import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';

interface DecodedToken {
  id: string;
  role: string;
}

export const initSocket = (server: HTTPServer) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Simple token authentication middleware for Socket.io
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization;
    if (!token) {
      // Allow connection but with restricted access (or reject if strict)
      return next();
    }
    
    try {
      const parsedToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
      const secret = process.env.JWT_SECRET || 'replace_this_with_a_long_random_secret_key';
      const decoded = jwt.verify(parsedToken, secret) as DecodedToken;
      socket.data.userId = decoded.id;
      socket.data.role = decoded.role;
      next();
    } catch (err) {
      console.error('Socket authentication failed:', (err as Error).message);
      next(); // Continue as unauthenticated or error out
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log(`Socket connected: ${socket.id} (User: ${socket.data.userId || 'Guest'})`);

    // User joins their personal room to receive real-time notifications
    if (socket.data.userId) {
      socket.join(`user:${socket.data.userId}`);
    }

    // Join a specific chat room
    socket.on('join_chat', (chatId: string) => {
      socket.join(`chat:${chatId}`);
      console.log(`Socket ${socket.id} joined chat: ${chatId}`);
    });

    // Leave a specific chat room
    socket.on('leave_chat', (chatId: string) => {
      socket.leave(`chat:${chatId}`);
      console.log(`Socket ${socket.id} left chat: ${chatId}`);
    });

    // Send typing status to other participants in the chat room
    socket.on('typing', ({ chatId, isTyping }: { chatId: string; isTyping: boolean }) => {
      if (socket.data.userId) {
        socket.to(`chat:${chatId}`).emit('user_typing', {
          chatId,
          userId: socket.data.userId,
          isTyping,
        });
      }
    });

    // Mark messages as seen
    socket.on('messages_seen', ({ chatId, messageIds }: { chatId: string; messageIds: string[] }) => {
      if (socket.data.userId) {
        socket.to(`chat:${chatId}`).emit('messages_seen_update', {
          chatId,
          seenBy: socket.data.userId,
          messageIds,
          seenAt: new Date(),
        });
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};
