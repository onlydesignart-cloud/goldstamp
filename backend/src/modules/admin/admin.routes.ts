import { Router } from 'express';
import { adminController } from './admin.controller';
import { authenticate, requirePlatformAdmin } from '../../middlewares/auth.middleware';

const router = Router();

// Enforce Super Admin on all admin sub-routes
router.use(authenticate, requirePlatformAdmin);

router.get('/businesses', (req, res, next) => adminController.getBusinesses(req, res, next));
router.get('/businesses/:id', (req, res, next) => adminController.getBusinessDetail(req, res, next));
router.patch('/businesses/:id/status', (req, res, next) => adminController.updateBusinessStatus(req, res, next));

router.get('/users', (req, res, next) => adminController.getUsers(req, res, next));
router.patch('/users/:id/status', (req, res, next) => adminController.updateUserStatus(req, res, next));

router.get('/audit-logs', (req, res, next) => adminController.getAuditLogs(req, res, next));
router.get('/visits', (req, res, next) => adminController.getAllVisits(req, res, next));
router.get('/redemptions', (req, res, next) => adminController.getAllRedemptions(req, res, next));

export default router;
