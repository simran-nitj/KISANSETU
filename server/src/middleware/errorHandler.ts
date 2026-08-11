import { Request, Response, NextFunction } from 'express';

export interface CustomError extends Error {
  status?: number;
  code?: number;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): any => {
  console.error('Unhandled Server Error:', err);

  const statusCode = err.status || 500;
  let message = err.message || 'Server error';

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: 'Validation failed', details: err.message });
  }

  // Handle Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({ message: 'Resource already exists (duplicate key error).' });
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format.' });
  }

  return res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};
