import { Router } from 'express';
import { staffController } from './staff.controller';
import { authenticate, requireBusinessAccess } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/:businessId', authenticate, requireBusinessAccess, (req, res, next) =>
  staffController.getStaff(req, res, next)
);

router.post('/:businessId', authenticate, requireBusinessAccess, (req, res, next) =>
  staffController.createStaff(req, res, next)
);

router.patch('/:businessId/:staffId/toggle', authenticate, requireBusinessAccess, (req, res, next) =>
  staffController.toggleStatus(req, res, next)
);

export default router;
