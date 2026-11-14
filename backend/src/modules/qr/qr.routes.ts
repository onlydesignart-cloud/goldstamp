import { Router } from 'express';
import { qrController } from './qr.controller';
import { authenticate, requireBusinessAccess } from '../../middlewares/auth.middleware';

const router = Router();

router.post('/generate', authenticate, requireBusinessAccess, (req, res, next) =>
  qrController.generateDynamicQr(req, res, next)
);
router.post('/generate/:businessId', authenticate, requireBusinessAccess, (req, res, next) =>
  qrController.generateDynamicQr(req, res, next)
);
router.get('/customer-pass', authenticate, (req, res, next) =>
  qrController.getCustomerPass(req, res, next)
);

export default router;
