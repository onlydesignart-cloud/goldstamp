import { Router } from 'express';
import { industriesController } from './industries.controller';
import { authenticate, requirePlatformAdmin } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/', (req, res, next) => industriesController.getAll(req, res, next));
router.post('/', authenticate, requirePlatformAdmin, (req, res, next) => industriesController.create(req, res, next));
router.put('/:id', authenticate, requirePlatformAdmin, (req, res, next) => industriesController.update(req, res, next));
router.patch('/:id/toggle', authenticate, requirePlatformAdmin, (req, res, next) => industriesController.toggleActive(req, res, next));

export default router;
