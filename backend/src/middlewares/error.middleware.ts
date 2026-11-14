import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { sendError } from '../utils/response';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('[Error Middleware]:', err);

  // Zod Validation Error
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    sendError(res, 'VALIDATION_ERROR', 'Validation failed', 400, formattedErrors);
    return;
  }

  // Prisma Unique Constraint Violation
  if (err.code === 'P2002') {
    const target = (err.meta?.target as string[])?.join(', ') || 'field';
    sendError(res, 'CONFLICT_ERROR', `A record with this ${target} already exists`, 409);
    return;
  }

  // Prisma Record Not Found
  if (err.code === 'P2025') {
    sendError(res, 'NOT_FOUND', 'Requested resource was not found', 404);
    return;
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    sendError(res, 'INVALID_TOKEN', 'Token verification failed', 401);
    return;
  }

  if (err.name === 'TokenExpiredError') {
    sendError(res, 'TOKEN_EXPIRED', 'Token has expired', 401);
    return;
  }

  // Generic fallback
  const message = process.env.NODE_ENV === 'production' 
    ? 'An unexpected internal server error occurred' 
    : err.message || 'Internal Server Error';

  sendError(res, 'INTERNAL_SERVER_ERROR', message, 500);
};
