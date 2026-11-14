import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { sendSuccess, sendError } from '../../utils/response';
import { RegisterSchema, LoginSchema, RefreshTokenSchema } from '@goldstamp/validation';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = RegisterSchema.parse(req.body);
      const result = await authService.register(validatedData);
      sendSuccess(res, result, 'User registered successfully', 201);
    } catch (err: any) {
      if (err.message && err.message.startsWith('EMAIL_EXISTS:')) {
        sendError(res, 'EMAIL_EXISTS', 'An account with this email already exists', 409);
        return;
      }
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = LoginSchema.parse(req.body);
      const result = await authService.login(validatedData);
      sendSuccess(res, result, 'Login successful');
    } catch (err: any) {
      if (err.message && err.message.startsWith('INVALID_CREDENTIALS:')) {
        sendError(res, 'INVALID_CREDENTIALS', 'Invalid email or password', 401);
        return;
      }
      if (err.message && err.message.startsWith('ACCOUNT_SUSPENDED:')) {
        sendError(res, 'ACCOUNT_SUSPENDED', 'Your account has been suspended', 403);
        return;
      }
      next(err);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = RefreshTokenSchema.parse(req.body);
      const result = await authService.refresh(validated.refreshToken);
      sendSuccess(res, result, 'Token refreshed successfully');
    } catch (err: any) {
      if (err.message && err.message.startsWith('INVALID_TOKEN:')) {
        sendError(res, 'INVALID_TOKEN', 'Refresh token is expired or invalid', 401);
        return;
      }
      next(err);
    }
  }

  async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'UNAUTHORIZED', 'Not authenticated', 401);
        return;
      }
      const user = await authService.getMe(req.user.userId);
      sendSuccess(res, user, 'Current user profile retrieved');
    } catch (err) {
      next(err);
    }
  }

  async logout(_req: Request, res: Response): Promise<void> {
    // In stateless JWT, logout on frontend clears tokens
    sendSuccess(res, null, 'Logged out successfully');
  }
}

export const authController = new AuthController();
