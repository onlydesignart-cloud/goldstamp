import { Request, Response, NextFunction } from 'express';
import { qrService } from './qr.service';
import { sendSuccess, sendError } from '../../utils/response';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';

export class QrController {
  async generateDynamicQr(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { businessId, branchId, campaignId, expirySeconds } = req.body;
      const targetBusinessId = businessId || req.params.businessId;

      if (!targetBusinessId) {
        sendError(res, 'BAD_REQUEST', 'businessId is required', 400);
        return;
      }

      const result = await qrService.generateDynamicCheckInQr({
        businessId: targetBusinessId,
        branchId,
        campaignId,
        expirySeconds: expirySeconds ? parseInt(expirySeconds, 10) : undefined,
      });

      sendSuccess(res, result, 'Dynamic QR generated successfully');
    } catch (err: any) {
      if (err.message && err.message.startsWith('INVALID_BUSINESS:')) {
        sendError(res, 'INVALID_BUSINESS', err.message.replace('INVALID_BUSINESS: ', ''), 400);
        return;
      }
      next(err);
    }
  }

  async getCustomerPass(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await qrService.generateCustomerPassQr(req.user!.userId, req.user!.email);
      sendSuccess(res, result, 'Customer pass generated');
    } catch (err) {
      next(err);
    }
  }
}

export const qrController = new QrController();
