import { Request, Response, NextFunction } from 'express';
import { campaignsService } from './campaigns.service';
import { sendSuccess, sendError } from '../../utils/response';
import { CreateCampaignSchema } from '@goldstamp/validation';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';

export class CampaignsController {
  async getByBusiness(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const businessId = req.params.businessId || (req.query.businessId as string);
      if (!businessId) {
        sendError(res, 'BAD_REQUEST', 'businessId is required', 400);
        return;
      }
      const campaigns = await campaignsService.getByBusinessId(businessId);
      sendSuccess(res, campaigns, 'Campaigns retrieved');
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const campaign = await campaignsService.getById(id);
      sendSuccess(res, campaign, 'Campaign retrieved');
    } catch (err: any) {
      if (err.message && err.message.startsWith('NOT_FOUND:')) {
        sendError(res, 'NOT_FOUND', 'Campaign not found', 404);
        return;
      }
      next(err);
    }
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const businessId = (req.params.businessId || req.body.businessId) as string;
      if (!businessId) {
        sendError(res, 'BAD_REQUEST', 'businessId is required', 400);
        return;
      }
      const validated = CreateCampaignSchema.parse(req.body);
      const campaign = await campaignsService.create(
        { ...validated, businessId },
        req.user!.userId
      );
      sendSuccess(res, campaign, 'Campaign created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updated = await campaignsService.updateStatus(id, status, req.user!.userId);
      sendSuccess(res, updated, 'Campaign status updated');
    } catch (err) {
      next(err);
    }
  }
}

export const campaignsController = new CampaignsController();
