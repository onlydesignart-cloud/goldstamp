import { Response, NextFunction } from 'express';
import { customersService } from './customers.service';
import { sendSuccess, sendError } from '../../utils/response';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';

export class CustomersController {
  async getMyLoyalty(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const programs = await customersService.getCustomerLoyaltyPrograms(req.user!.userId);
      sendSuccess(res, programs, 'Loyalty programs retrieved');
    } catch (err) {
      next(err);
    }
  }

  async joinProgram(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const businessId = req.params.businessId as string;
      const membership = await customersService.joinProgram(req.user!.userId, businessId);
      sendSuccess(res, membership, 'Joined loyalty program successfully', 201);
    } catch (err: any) {
      if (err.message && err.message.startsWith('NOT_FOUND:')) {
        sendError(res, 'NOT_FOUND', 'Business not found', 404);
        return;
      }
      next(err);
    }
  }

  async getMyVisits(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const visits = await customersService.getCustomerVisits(req.user!.userId);
      sendSuccess(res, visits, 'Visit history retrieved');
    } catch (err) {
      next(err);
    }
  }

  async getMyPoints(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const points = await customersService.getCustomerPointsLedger(req.user!.userId);
      sendSuccess(res, points, 'Points ledger retrieved');
    } catch (err) {
      next(err);
    }
  }

  async getBusinessCustomers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const businessId = (req.params.businessId || req.query.businessId) as string;
      if (!businessId) {
        sendError(res, 'BAD_REQUEST', 'businessId is required', 400);
        return;
      }
      const { search, filter, page, limit } = req.query;
      const result = await customersService.getBusinessCustomers({
        businessId,
        search: search as string,
        filter: filter as any,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
      });

      sendSuccess(res, result.items, 'Customers retrieved', 200, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const customersController = new CustomersController();
