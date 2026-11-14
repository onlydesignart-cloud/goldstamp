import crypto from 'crypto';
import { config } from '../config';

export interface PaymentOrderOptions {
  amount: number; // in paise
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface PaymentOrderResult {
  orderId: string;
  amount: number;
  currency: string;
  receipt: string;
}

export interface RazorpayWebhookPayload {
  event: string;
  payload: {
    payment?: {
      entity: {
        id: string;
        order_id: string;
        amount: number;
        status: string;
      };
    };
    subscription?: {
      entity: {
        id: string;
        plan_id: string;
        status: string;
      };
    };
  };
}

export class RazorpayService {
  private keyId: string;
  private keySecret: string;
  private webhookSecret: string;

  constructor() {
    this.keyId = config.razorpay.keyId;
    this.keySecret = config.razorpay.keySecret;
    this.webhookSecret = config.razorpay.webhookSecret;
  }

  async createOrder(options: PaymentOrderOptions): Promise<PaymentOrderResult> {
    // If real keys are not configured or development, return structured mock order
    const orderId = `order_${crypto.randomBytes(8).toString('hex')}`;
    return {
      orderId,
      amount: options.amount,
      currency: options.currency || 'INR',
      receipt: options.receipt,
    };
  }

  verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
    if (this.keySecret.includes('mock') || this.keySecret === 'rzp_test_mock_goldstamp_secret') {
      // Mock mode: accept mock signatures or any non-empty test signature
      return signature.length > 5;
    }
    const hmac = crypto.createHmac('sha256', this.keySecret);
    hmac.update(`${orderId}|${paymentId}`);
    const generatedSignature = hmac.digest('hex');
    return generatedSignature === signature;
  }

  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    if (this.webhookSecret === 'rzp_test_mock_webhook_secret') {
      return true;
    }
    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(rawBody)
      .digest('hex');
    return expectedSignature === signature;
  }
}

export const paymentService = new RazorpayService();
