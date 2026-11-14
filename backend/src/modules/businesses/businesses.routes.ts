import { Router } from 'express';
import { businessesController } from './businesses.controller';
import { authenticate, authorize, requireBusinessAccess, requirePlatformAdmin } from '../../middlewares/auth.middleware';

const router = Router();

// Public routes
router.get('/', (req, res, next) => businessesController.getPublicList(req, res, next));
router.get('/mine', authenticate, (req, res, next) => businessesController.getMine(req, res, next));
router.get('/:slug', (req, res, next) => businessesController.getBySlug(req, res, next));

// Protected routes (business owners & admins)
router.post('/', authenticate, authorize('BUSINESS_OWNER', 'SUPER_ADMIN'), (req, res, next) =>
  businessesController.create(req, res, next)
);
router.patch('/:businessId', authenticate, requireBusinessAccess, (req, res, next) =>
  businessesController.update(req, res, next)
);
router.get('/:businessId/branches', authenticate, requireBusinessAccess, (req, res, next) =>
  businessesController.getBranches(req, res, next)
);
router.post('/:businessId/branches', authenticate, requireBusinessAccess, (req, res, next) =>
  businessesController.createBranch(req, res, next)
);

// Admin-only route
router.patch('/:id/status', authenticate, requirePlatformAdmin, (req, res, next) =>
  businessesController.updateStatus(req, res, next)
);

export default router;
