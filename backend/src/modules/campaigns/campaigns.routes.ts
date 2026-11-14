import { Router } from 'express';
import { campaignsController } from './campaigns.controller';
import { authenticate, requireBusinessAccess } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/', (req, res, next) => campaignsController.getByBusiness(req, res, next));
router.get('/:id', (req, res, next) => campaignsController.getById(req, res, next));

router.post('/:businessId', authenticate, requireBusinessAccess, (req, res, next) =>
  campaignsController.create(req, res, next)
);
router.patch('/:id/status', authenticate, (req, res, next) =>
  campaignsController.updateStatus(req, res, next)
);

export default router;
