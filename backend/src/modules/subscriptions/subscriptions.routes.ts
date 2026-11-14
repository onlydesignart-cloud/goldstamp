import { Router } from 'express';
import { subscriptionsController } from './subscriptions.controller';
import { authenticate, requireBusinessAccess } from '../../middlewares/auth.middleware';

const router = Router();

// Public plans
router.get('/plans', (req, res, next) => subscriptionsController.getPlans(req, res, next));

// Business subscription
router.get('/:businessId', authenticate, requireBusinessAccess, (req, res, next) =>
  subscriptionsController.getSubscription(req, res, next)
);

router.post('/checkout', authenticate, (req, res, next) =>
  subscriptionsController.createCheckout(req, res, next)
);

router.post('/verify', authenticate, (req, res, next) =>
  subscriptionsController.verifyPayment(req, res, next)
);

export default router;
