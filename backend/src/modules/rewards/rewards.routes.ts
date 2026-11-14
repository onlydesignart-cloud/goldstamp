import { Router } from 'express';
import { rewardsController } from './rewards.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

// Customer endpoints
router.get('/my-rewards', authenticate, (req, res, next) =>
  rewardsController.getCustomerRewards(req, res, next)
);
router.post('/claim', authenticate, (req, res, next) =>
  rewardsController.claimReward(req, res, next)
);

// Business endpoints
router.get('/business/:businessId', authenticate, (req, res, next) =>
  rewardsController.getBusinessRewards(req, res, next)
);

export default router;
