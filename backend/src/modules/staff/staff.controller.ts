import { Response, NextFunction } from 'express';
import { staffService } from './staff.service';
import { sendSuccess, sendError } from '../../utils/response';
import { CreateStaffSchema } from '@goldstamp/validation';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';

export class StaffController {
  async getStaff(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const businessId = (req.params.businessId || req.query.businessId) as string;
      if (!businessId) {
        sendError(res, 'BAD_REQUEST', 'businessId is required', 400);
        return;
      }
      const staffList = await staffService.getBusinessStaff(businessId);
      sendSuccess(res, staffList, 'Staff members retrieved');
    } catch (err) {
      next(err);
    }
  }

  async createStaff(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const businessId = (req.params.businessId || req.body.businessId) as string;
      if (!businessId) {
        sendError(res, 'BAD_REQUEST', 'businessId is required', 400);
        return;
      }
      const validated = CreateStaffSchema.parse(req.body);
      const staff = await staffService.createStaff({
        businessId,
        name: validated.name,
        email: validated.email,
        password: validated.password,
        branchId: validated.branchId,
        actorUserId: req.user!.userId,
      });
      sendSuccess(res, staff, 'Staff member added successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async toggleStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { staffId } = req.params;
      const updated = await staffService.toggleStaffStatus(staffId, req.user!.userId);
      sendSuccess(res, updated, 'Staff status updated');
    } catch (err) {
      next(err);
    }
  }
}

export const staffController = new StaffController();
