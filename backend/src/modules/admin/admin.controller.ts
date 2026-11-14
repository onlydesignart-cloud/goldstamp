import { Response, NextFunction } from 'express';
import { adminService } from './admin.service';
import { sendSuccess, sendError } from '../../utils/response';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';

export class AdminController {
  async getBusinesses(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, search, page, limit } = req.query;
      const result = await adminService.getAllBusinesses({
        status: status as any,
        search: search as string,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
      });

      sendSuccess(res, result.items, 'Admin businesses retrieved', 200, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (err) {
      next(err);
    }
  }

  async getBusinessDetail(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const business = await adminService.getBusinessDetail(id);
      sendSuccess(res, business, 'Business detail retrieved');
    } catch (err: any) {
      if (err.message && err.message.startsWith('NOT_FOUND:')) {
        sendError(res, 'NOT_FOUND', 'Business not found', 404);
        return;
      }
      next(err);
    }
  }

  async updateBusinessStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updated = await adminService.setBusinessStatus(id, status, req.user!.userId);
      sendSuccess(res, updated, `Business status updated to ${status}`);
    } catch (err) {
      next(err);
    }
  }

  async getUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { role, search, page, limit } = req.query;
      const result = await adminService.getAllUsers({
        role: role as any,
        search: search as string,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
      });

      sendSuccess(res, result.items, 'Users retrieved', 200, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (err) {
      next(err);
    }
  }

  async updateUserStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updated = await adminService.setUserStatus(id, status, req.user!.userId);
      sendSuccess(res, updated, `User status updated to ${status}`);
    } catch (err) {
      next(err);
    }
  }

  async getAuditLogs(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const logs = await adminService.getAuditLogs();
      sendSuccess(res, logs, 'Audit logs retrieved');
    } catch (err) {
      next(err);
    }
  }

  async getAllVisits(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const visits = await adminService.getAllVisits();
      sendSuccess(res, visits, 'Visits ledger retrieved');
    } catch (err) {
      next(err);
    }
  }

  async getAllRedemptions(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const redemptions = await adminService.getAllRedemptions();
      sendSuccess(res, redemptions, 'Redemptions ledger retrieved');
    } catch (err) {
      next(err);
    }
  }
}

export const adminController = new AdminController();
