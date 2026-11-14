import { Request, Response, NextFunction } from 'express';
import { industriesService } from './industries.service';
import { sendSuccess, sendError } from '../../utils/response';
import { CreateIndustrySchema } from '@goldstamp/validation';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';

export class IndustriesController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const includeInactive = req.query.all === 'true';
      const result = await industriesService.getAll(includeInactive);
      sendSuccess(res, result, 'Industries retrieved');
    } catch (err) {
      next(err);
    }
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = CreateIndustrySchema.parse(req.body);
      const result = await industriesService.create(validated, req.user!.userId);
      sendSuccess(res, result, 'Industry created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await industriesService.update(id, req.body, req.user!.userId);
      sendSuccess(res, result, 'Industry updated successfully');
    } catch (err) {
      next(err);
    }
  }

  async toggleActive(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await industriesService.toggleActive(id, req.user!.userId);
      sendSuccess(res, result, 'Industry status updated');
    } catch (err: any) {
      if (err.message && err.message.startsWith('NOT_FOUND:')) {
        sendError(res, 'NOT_FOUND', 'Industry not found', 404);
        return;
      }
      next(err);
    }
  }
}

export const industriesController = new IndustriesController();
