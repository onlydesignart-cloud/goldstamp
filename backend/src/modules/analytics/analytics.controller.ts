import { Response, NextFunction } from 'express';
import { analyticsService } from './analytics.service';
import { sendSuccess, sendError } from '../../utils/response';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';

export class AnalyticsController {
  async getBusinessDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const businessId = (req.params.businessId || req.query.businessId) as string;
      if (!businessId) {
        sendError(res, 'BAD_REQUEST', 'businessId is required', 400);
        return;
      }
      const data = await analyticsService.getBusinessDashboardMetrics(businessId);
      sendSuccess(res, data, 'Business analytics retrieved');
    } catch (err) {
      next(err);
    }
  }

  async getAdminDashboard(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await analyticsService.getPlatformAdminMetrics();
      sendSuccess(res, data, 'Admin platform analytics retrieved');
    } catch (err) {
      next(err);
    }
  }
}

export const analyticsController = new AnalyticsController();
