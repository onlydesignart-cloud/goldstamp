import prisma from '../../lib/prisma';
import { paymentService } from '../../lib/payments';
import { logAudit } from '../../utils/audit';
import { notificationService } from '../../lib/notifications';
import { SubscriptionStatus } from '@prisma/client';

export class SubscriptionsService {
  async getPlans() {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    });

    return plans.map((p) => ({
      ...p,
      features: typeof p.features === 'string' ? JSON.parse(p.features) : p.features,
    }));
  }

  async getBusinessSubscription(businessId: string) {
    const sub = await prisma.subscription.findUnique({
      where: { businessId },
      include: { plan: true },
    });

    if (!sub) return null;

    return {
      ...sub,
      plan: {
        ...sub.plan,
        features: typeof sub.plan.features === 'string' ? JSON.parse(sub.plan.features) : sub.plan.features,
      },
    };
  }

  /**
   * Initialize checkout order for subscribing to a plan
   */
  async createCheckoutOrder(businessId: string, planId: string) {
    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
    if (!plan) throw new Error('NOT_FOUND: Subscription plan not found');

    const order = await paymentService.createOrder({
      amount: Math.round(plan.price * 100), // convert to paise
      currency: plan.currency,
      receipt: `sub_${businessId.substring(0, 8)}_${Date.now()}`,
      notes: { businessId, planId },
    });

    return {
      orderId: order.orderId,
      amount: plan.price,
      currency: plan.currency,
      planName: plan.name,
      planCode: plan.code,
    };
  }

  /**
   * Activate / renew subscription after payment verification
   */
  async verifyAndActivateSubscription(params: {
    businessId: string;
    planId: string;
    orderId: string;
    paymentId: string;
    signature: string;
    actorUserId: string;
  }) {
    // 1. Verify payment signature on backend
    const isValid = paymentService.verifyPaymentSignature(
      params.orderId,
      params.paymentId,
      params.signature
    );

    if (!isValid) {
      throw new Error('INVALID_PAYMENT_SIGNATURE: Payment verification failed');
    }

    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: params.planId } });
    if (!plan) throw new Error('NOT_FOUND: Plan not found');

    // 2. Upsert Subscription record
    const periodStart = new Date();
    const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const subscription = await prisma.subscription.upsert({
      where: { businessId: params.businessId },
      create: {
        businessId: params.businessId,
        planId: params.planId,
        status: SubscriptionStatus.ACTIVE,
        razorpaySubscriptionId: params.paymentId,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
      },
      update: {
        planId: params.planId,
        status: SubscriptionStatus.ACTIVE,
        razorpaySubscriptionId: params.paymentId,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
      },
      include: { plan: true },
    });

    await logAudit({
      actorId: params.actorUserId,
      actorRole: 'BUSINESS_OWNER',
      action: 'SUBSCRIPTION_ACTIVATED',
      entityType: 'SUBSCRIPTION',
      entityId: subscription.id,
      metadata: { planCode: plan.code, price: plan.price, paymentId: params.paymentId },
    });

    await notificationService.notify({
      userId: params.actorUserId,
      title: '🎉 Subscription Activated!',
      message: `Your ${plan.name} plan is now active until ${periodEnd.toLocaleDateString()}. Thank you for choosing Gold Stamp!`,
      type: 'SUBSCRIPTION_ACTIVATED',
    });

    return subscription;
  }
}

export const subscriptionsService = new SubscriptionsService();
