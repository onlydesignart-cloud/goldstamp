import { Request, Response, NextFunction } from 'express';
import { subscriptionsService } from './subscriptions.service';
import { sendSuccess, sendError } from '../../utils/response';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';

export class SubscriptionsController {
  async getPlans(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const plans = await subscriptionsService.getPlans();
      sendSuccess(res, plans, 'Plans retrieved');
    } catch (err) {
      next(err);
    }
  }

  async getSubscription(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const businessId = (req.params.businessId || req.query.businessId) as string;
      if (!businessId) {
        sendError(res, 'BAD_REQUEST', 'businessId is required', 400);
        return;
      }
      const sub = await subscriptionsService.getBusinessSubscription(businessId);
      sendSuccess(res, sub, 'Subscription retrieved');
    } catch (err) {
      next(err);
    }
  }

  async createCheckout(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { businessId, planId } = req.body;
      if (!businessId || !planId) {
        sendError(res, 'BAD_REQUEST', 'businessId and planId are required', 400);
        return;
      }
      const order = await subscriptionsService.createCheckoutOrder(businessId, planId);
      sendSuccess(res, order, 'Checkout order created');
    } catch (err) {
      next(err);
    }
  }

  async verifyPayment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { businessId, planId, orderId, paymentId, signature } = req.body;
      const sub = await subscriptionsService.verifyAndActivateSubscription({
        businessId,
        planId,
        orderId,
        paymentId,
        signature,
        actorUserId: req.user!.userId,
      });
      sendSuccess(res, sub, 'Subscription activated successfully');
    } catch (err: any) {
      if (err.message && err.message.startsWith('INVALID_PAYMENT_SIGNATURE:')) {
        sendError(res, 'INVALID_PAYMENT_SIGNATURE', 'Payment signature could not be verified', 400);
        return;
      }
      next(err);
    }
  }
}

export const subscriptionsController = new SubscriptionsController();
