import { Router } from 'express';
import { customersController } from './customers.controller';
import { authenticate, requireBusinessAccess } from '../../middlewares/auth.middleware';

const router = Router();

// Customer personal loyalty actions
router.get('/me/loyalty', authenticate, (req, res, next) =>
  customersController.getMyLoyalty(req, res, next)
);
router.post('/join/:businessId', authenticate, (req, res, next) =>
  customersController.joinProgram(req, res, next)
);
router.get('/me/visits', authenticate, (req, res, next) =>
  customersController.getMyVisits(req, res, next)
);
router.get('/me/points', authenticate, (req, res, next) =>
  customersController.getMyPoints(req, res, next)
);

// Business owner / staff view customer directory
router.get('/business/:businessId', authenticate, requireBusinessAccess, (req, res, next) =>
  customersController.getBusinessCustomers(req, res, next)
);

export default router;
