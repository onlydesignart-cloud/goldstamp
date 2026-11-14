import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import businessesRoutes from '../modules/businesses/businesses.routes';
import industriesRoutes from '../modules/industries/industries.routes';
import campaignsRoutes from '../modules/campaigns/campaigns.routes';
import qrRoutes from '../modules/qr/qr.routes';
import checkinRoutes from '../modules/checkin/checkin.routes';
import rewardsRoutes from '../modules/rewards/rewards.routes';
import redemptionsRoutes from '../modules/redemptions/redemptions.routes';
import customersRoutes from '../modules/customers/customers.routes';
import staffRoutes from '../modules/staff/staff.routes';
import analyticsRoutes from '../modules/analytics/analytics.routes';
import adminRoutes from '../modules/admin/admin.routes';
import subscriptionsRoutes from '../modules/subscriptions/subscriptions.routes';
import notificationsRoutes from '../modules/notifications/notifications.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/businesses', businessesRoutes);
router.use('/industries', industriesRoutes);
router.use('/campaigns', campaignsRoutes);
router.use('/qr', qrRoutes);
router.use('/checkin', checkinRoutes);
router.use('/rewards', rewardsRoutes);
router.use('/redemptions', redemptionsRoutes);
router.use('/customers', customersRoutes);
router.use('/staff', staffRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/admin', adminRoutes);
router.use('/subscriptions', subscriptionsRoutes);
router.use('/notifications', notificationsRoutes);

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Gold Stamp API', timestamp: new Date() });
});

export default router;
