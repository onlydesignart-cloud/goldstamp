import { Router } from 'express';
import { analyticsController } from './analytics.controller';
import { authenticate, requireBusinessAccess, requirePlatformAdmin } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/business/:businessId', authenticate, requireBusinessAccess, (req, res, next) =>
  analyticsController.getBusinessDashboard(req, res, next)
);

router.get('/admin', authenticate, requirePlatformAdmin, (req, res, next) =>
  analyticsController.getAdminDashboard(req, res, next)
);

export default router;
