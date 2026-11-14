import { Response } from 'express';
import { ApiResponse } from '@goldstamp/types';

export const sendSuccess = <T>(
  res: Response,
  data?: T,
  message = 'Success',
  statusCode = 200,
  meta?: any
): Response => {
  const payload: ApiResponse<T> = {
    success: true,
    message,
    ...(data !== undefined && { data }),
    ...(meta && { meta }),
  };
  return res.status(statusCode).json(payload);
};

export const sendError = (
  res: Response,
  code: string,
  message: string,
  statusCode = 400,
  details?: any
): Response => {
  const payload: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
  };
  return res.status(statusCode).json(payload);
};
