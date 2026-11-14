import { Response, NextFunction } from 'express';
import { checkInService } from './checkin.service';
import { sendSuccess, sendError } from '../../utils/response';
import { CheckInSchema, StaffCheckInSchema } from '@goldstamp/validation';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';

export class CheckInController {
  async customerCheckIn(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = CheckInSchema.parse(req.body);
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;

      const result = await checkInService.processCheckIn({
        token: validated.token,
        userId: req.user!.userId,
        deviceInfo: validated.deviceInfo || req.headers['user-agent'],
        ipAddress: ip,
      });

      sendSuccess(res, result, result.message);
    } catch (err: any) {
      if (err.message && err.message.startsWith('INVALID_TOKEN:')) {
        sendError(res, 'INVALID_TOKEN', err.message.replace('INVALID_TOKEN: ', ''), 400);
        return;
      }
      if (err.message && err.message.startsWith('COOLDOWN_ACTIVE:')) {
        sendError(res, 'COOLDOWN_ACTIVE', err.message.replace('COOLDOWN_ACTIVE: ', ''), 429);
        return;
      }
      if (err.message && err.message.startsWith('BUSINESS_INACTIVE:')) {
        sendError(res, 'BUSINESS_INACTIVE', err.message.replace('BUSINESS_INACTIVE: ', ''), 400);
        return;
      }
      if (err.message && err.message.startsWith('NO_ACTIVE_CAMPAIGN:')) {
        sendError(res, 'NO_ACTIVE_CAMPAIGN', err.message.replace('NO_ACTIVE_CAMPAIGN: ', ''), 400);
        return;
      }
      next(err);
    }
  }

  async staffCheckIn(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const businessId = (req.params.businessId || req.body.businessId) as string;
      if (!businessId) {
        sendError(res, 'BAD_REQUEST', 'businessId is required', 400);
        return;
      }

      const validated = StaffCheckInSchema.parse(req.body);
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;

      const result = await checkInService.processStaffCheckIn({
        customerPassToken: validated.customerPassToken,
        customerUserId: validated.customerUserId,
        businessId,
        branchId: validated.branchId,
        campaignId: validated.campaignId,
        staffUserId: req.user!.userId,
        deviceInfo: req.headers['user-agent'],
        ipAddress: ip,
      });

      sendSuccess(res, result, result.message);
    } catch (err: any) {
      if (err.message && err.message.startsWith('COOLDOWN_ACTIVE:')) {
        sendError(res, 'COOLDOWN_ACTIVE', err.message.replace('COOLDOWN_ACTIVE: ', ''), 429);
        return;
      }
      next(err);
    }
  }
}

export const checkInController = new CheckInController();
