import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Config & Infrastructure
import connectDB from './config/db.js';
import { initSocket } from './config/socket.js';

// Middleware
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';

// Routers
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import equipmentRoutes from './routes/equipmentRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import recommendationRoutes from './routes/recommendationRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import supportRoutes from './routes/supportRoutes.js';
import schemeRoutes from './routes/schemeRoutes.js';
import walletRoutes from './routes/walletRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

// Connect to MongoDB Database
connectDB();

// Initialize Realtime Socket.io Server
const io = initSocket(httpServer);

// Attach Socket.io instance to the request context
app.use((req: any, res, next) => {
  req.io = io;
  next();
});

// Core Security & Request Parsing Middlewares
app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
  })
);
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Serve Static Uploads (PDF Invoices, dynamic files)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Mount API Limiter globally on API endpoints
app.use('/api/', apiLimiter);

// Mount Modular API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/wallet', walletRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'KisanSetu production backend is running' });
});

// Catch-all route not found handler
app.use('*', (req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found.` });
});

// Global Error Handler Middleware
app.use(errorHandler as any);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`  KISAN SETU Express Server running on Port ${PORT}`);
  console.log(`  Realtime WebSockets active & bound successfully`);
  console.log(`==================================================`);
});

export { app, httpServer };
