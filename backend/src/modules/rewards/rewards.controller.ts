import { Response, NextFunction } from 'express';
import { rewardsService } from './rewards.service';
import { sendSuccess, sendError } from '../../utils/response';
import { RedeemRewardSchema } from '@goldstamp/validation';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';

export class RewardsController {
  async getBusinessRewards(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const businessId = (req.params.businessId || req.query.businessId) as string;
      if (!businessId) {
        sendError(res, 'BAD_REQUEST', 'businessId is required', 400);
        return;
      }
      const rewards = await rewardsService.getBusinessRewards(businessId);
      sendSuccess(res, rewards, 'Business rewards retrieved');
    } catch (err) {
      next(err);
    }
  }

  async getCustomerRewards(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const all = req.query.all === 'true';
      const rewards = all
        ? await rewardsService.getCustomerAllRewards(req.user!.userId)
        : await rewardsService.getCustomerAvailableRewards(req.user!.userId);
      sendSuccess(res, rewards, 'Customer rewards retrieved');
    } catch (err) {
      next(err);
    }
  }

  async claimReward(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = RedeemRewardSchema.parse(req.body);
      const redemption = await rewardsService.claimReward(req.user!.userId, validated.rewardId);
      sendSuccess(res, redemption, 'Reward claimed successfully, show code to staff', 201);
    } catch (err: any) {
      if (err.message && err.message.startsWith('NOT_FOUND:')) {
        sendError(res, 'NOT_FOUND', 'Reward not found', 404);
        return;
      }
      if (err.message && err.message.startsWith('REWARD_EXPIRED:')) {
        sendError(res, 'REWARD_EXPIRED', 'This reward has expired', 400);
        return;
      }
      next(err);
    }
  }
}

export const rewardsController = new RewardsController();
