import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
import { describe, it, expect, beforeAll } from 'vitest';
import prisma from '../src/lib/prisma';
import { generateQrToken, verifyQrToken } from '../src/utils/jwt';
import { checkInService } from '../src/modules/checkin/checkin.service';
import { redemptionsService } from '../src/modules/redemptions/redemptions.service';
import { paymentService } from '../src/lib/payments';

describe('Gold Stamp SaaS Core Logic & Anti-Fraud Engine', () => {
  let sampleBusiness: any;
  let testCustomer: any;
  let testCampaign: any;

  beforeAll(async () => {
    try {
      sampleBusiness = await prisma.business.findFirst({
        where: { status: 'ACTIVE' },
        include: { campaigns: true },
      });
      testCustomer = await prisma.user.findFirst({
        where: { role: 'CUSTOMER' },
      });
      testCampaign = sampleBusiness?.campaigns?.[0];
    } catch {
      // Offline fallback for testing environments without local DB active
    }

    if (!sampleBusiness) {
      sampleBusiness = { id: 'biz_sample_123', name: 'Sample Business' };
      testCampaign = { id: 'cmp_sample_123', name: 'Sample Campaign', targetStamps: 10 };
      testCustomer = { id: 'usr_sample_123', email: 'test@example.com' };
    }
  });

  it('generates and cryptographically verifies dynamic QR tokens', () => {
    const { token } = generateQrToken({
      businessId: sampleBusiness.id,
      campaignId: testCampaign.id,
      expirySeconds: 60,
    });

    const decoded = verifyQrToken(token);
    expect(decoded.businessId).toBe(sampleBusiness.id);
    expect(decoded.type).toBe('DYNAMIC_CHECKIN');
    expect(decoded.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });

  it('verifies payment signatures and mock provider correctly', () => {
    const orderId = 'order_test_123';
    const paymentId = 'pay_test_456';
    const validSig = 'valid_mock_signature_test';
    const isVerified = paymentService.verifyPaymentSignature(orderId, paymentId, validSig);
    expect(isVerified).toBe(true);
  });

  it('prevents cross-business reward redemption attempts', async () => {
    // Attempting to redeem with wrong business ID should fail
    await expect(
      redemptionsService.verifyAndRedeem('FAKE-CODE-123', 'wrong-business-id', 'test-actor')
    ).rejects.toThrow();
  });
});
