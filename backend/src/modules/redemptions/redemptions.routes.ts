import { Router } from 'express';
import { redemptionsController } from './redemptions.controller';
import { authenticate, requireBusinessAccess } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/:businessId', authenticate, requireBusinessAccess, (req, res, next) =>
  redemptionsController.getBusinessRedemptions(req, res, next)
);

router.post('/verify/:businessId', authenticate, requireBusinessAccess, (req, res, next) =>
  redemptionsController.verifyRedemption(req, res, next)
);

export default router;
