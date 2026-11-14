import { Request, Response, NextFunction } from 'express';
import { businessesService } from './businesses.service';
import { sendSuccess, sendError } from '../../utils/response';
import { CreateBusinessSchema, UpdateBusinessSchema } from '@goldstamp/validation';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';

export class BusinessesController {
  async getPublicList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { industry, search, city, page, limit } = req.query;
      const result = await businessesService.getPublicList({
        industrySlug: industry as string,
        search: search as string,
        city: city as string,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 12,
      });
      sendSuccess(res, result.items, 'Businesses retrieved', 200, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (err) {
      next(err);
    }
  }

  async getBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { slug } = req.params;
      const business = await businessesService.getBySlug(slug);
      sendSuccess(res, business, 'Business details retrieved');
    } catch (err: any) {
      if (err.message && err.message.startsWith('NOT_FOUND:')) {
        sendError(res, 'NOT_FOUND', 'Business not found', 404);
        return;
      }
      next(err);
    }
  }

  async getMine(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const business = await businessesService.getByOwnerId(req.user!.userId);
      sendSuccess(res, business, 'Business retrieved for owner');
    } catch (err: any) {
      if (err.message && err.message.startsWith('NOT_FOUND:')) {
        sendError(res, 'NOT_FOUND', 'No business profile found for this owner', 404);
        return;
      }
      next(err);
    }
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = CreateBusinessSchema.parse(req.body);
      const business = await businessesService.create(validated, req.user!.userId);
      sendSuccess(res, business, 'Business created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.businessId || req.params.id;
      const validated = UpdateBusinessSchema.parse(req.body);
      const business = await businessesService.update(
        id,
        validated,
        req.user!.userId,
        req.user!.role
      );
      sendSuccess(res, business, 'Business updated successfully');
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const business = await businessesService.updateStatus(id, status, req.user!.userId);
      sendSuccess(res, business, `Business status updated to ${status}`);
    } catch (err) {
      next(err);
    }
  }

  async getBranches(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const branches = await businessesService.getBranches(id);
      sendSuccess(res, branches, 'Branches retrieved');
    } catch (err) {
      next(err);
    }
  }

  async createBranch(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const branch = await businessesService.createBranch(id, req.body);
      sendSuccess(res, branch, 'Branch created successfully', 201);
    } catch (err) {
      next(err);
    }
  }
}

export const businessesController = new BusinessesController();
