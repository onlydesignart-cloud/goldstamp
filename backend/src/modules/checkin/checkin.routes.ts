import { Router } from 'express';
import { checkInController } from './checkin.controller';
import { authenticate, requireBusinessAccess } from '../../middlewares/auth.middleware';
import { checkInLimiter } from '../../middlewares/rateLimiter';

const router = Router();

// Customer scans QR & calls POST /api/v1/checkin
router.post('/', authenticate, checkInLimiter, (req, res, next) =>
  checkInController.customerCheckIn(req, res, next)
);

// Staff scans customer loyalty pass QR
router.post('/staff/:businessId', authenticate, requireBusinessAccess, (req, res, next) =>
  checkInController.staffCheckIn(req, res, next)
);

export default router;
