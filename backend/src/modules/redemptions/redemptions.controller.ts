import { Response, NextFunction } from 'express';
import { redemptionsService } from './redemptions.service';
import { sendSuccess, sendError } from '../../utils/response';
import { VerifyRedemptionSchema } from '@goldstamp/validation';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';

export class RedemptionsController {
  async getBusinessRedemptions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const businessId = (req.params.businessId || req.query.businessId) as string;
      if (!businessId) {
        sendError(res, 'BAD_REQUEST', 'businessId is required', 400);
        return;
      }
      const list = await redemptionsService.getBusinessRedemptions(businessId);
      sendSuccess(res, list, 'Redemptions retrieved');
    } catch (err) {
      next(err);
    }
  }

  async verifyRedemption(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const businessId = (req.params.businessId || req.body.businessId) as string;
      if (!businessId) {
        sendError(res, 'BAD_REQUEST', 'businessId is required', 400);
        return;
      }

      const validated = VerifyRedemptionSchema.parse(req.body);
      const result = await redemptionsService.verifyAndRedeem(
        validated.code,
        businessId,
        req.user!.userId
      );

      sendSuccess(res, result, `Reward "${result.reward.title}" successfully redeemed for ${result.user.name}!`);
    } catch (err: any) {
      if (err.message && err.message.startsWith('CODE_NOT_FOUND:')) {
        sendError(res, 'CODE_NOT_FOUND', 'Redemption code not found or invalid', 404);
        return;
      }
      if (err.message && err.message.startsWith('CROSS_BUSINESS_FORBIDDEN:')) {
        sendError(res, 'CROSS_BUSINESS_FORBIDDEN', 'This code belongs to a different business', 403);
        return;
      }
      if (err.message && err.message.startsWith('ALREADY_REDEEMED:')) {
        sendError(res, 'ALREADY_REDEEMED', 'This reward code has already been redeemed', 400);
        return;
      }
      next(err);
    }
  }
}

export const redemptionsController = new RedemptionsController();
