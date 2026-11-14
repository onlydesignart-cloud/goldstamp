import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';
import { sendError } from '../utils/response';
import prisma from '../lib/prisma';
import { UserRole } from '@goldstamp/types';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload & {
    name?: string;
    status?: string;
  };
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(res, 'UNAUTHORIZED', 'Missing or invalid authentication token', 401);
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyAccessToken(token);

    // Verify user exists and is active in DB
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true, role: true, status: true },
    });

    if (!user) {
      sendError(res, 'USER_NOT_FOUND', 'User no longer exists', 401);
      return;
    }

    if (user.status === 'SUSPENDED') {
      sendError(res, 'ACCOUNT_SUSPENDED', 'Your account has been suspended by an administrator', 403);
      return;
    }

    // Attach to request
    req.user = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
      status: user.status,
    };

    next();
  } catch (error) {
    sendError(res, 'INVALID_TOKEN', 'Token has expired or is invalid', 401);
  }
};

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      sendError(
        res,
        'FORBIDDEN',
        `Access denied. Requires one of roles: ${allowedRoles.join(', ')}`,
        403
      );
      return;
    }

    next();
  };
};

export const requirePlatformAdmin = authorize('SUPER_ADMIN');

export const requireBusinessAccess = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
    return;
  }

  // Super admin can access any business
  if (req.user.role === 'SUPER_ADMIN') {
    return next();
  }

  const businessId = (req.params.businessId || req.body.businessId || req.query.businessId) as string;
  if (!businessId) {
    sendError(res, 'BAD_REQUEST', 'Business ID is required for tenant context', 400);
    return;
  }

  // Check if owner
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { ownerId: true, status: true },
  });

  if (!business) {
    sendError(res, 'NOT_FOUND', 'Business not found', 404);
    return;
  }

  if (business.ownerId === req.user.userId) {
    return next();
  }

  // Check if active staff
  const staff = await prisma.businessStaff.findUnique({
    where: {
      businessId_userId: {
        businessId,
        userId: req.user.userId,
      },
    },
  });

  if (staff && staff.isActive) {
    return next();
  }

  sendError(res, 'FORBIDDEN', 'You do not have access to this business tenant', 403);
};
