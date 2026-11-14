import QRCode from 'qrcode';
import prisma from '../../lib/prisma';
import { generateQrToken, generateCustomerPassToken, verifyQrToken } from '../../utils/jwt';
import { config } from '../../config';

export class QrService {
  async generateDynamicCheckInQr(params: {
    businessId: string;
    branchId?: string | null;
    campaignId?: string | null;
    expirySeconds?: number;
  }) {
    // Verify business exists and is active
    const business = await prisma.business.findUnique({
      where: { id: params.businessId },
      select: { id: true, name: true, status: true, cooldownMinutes: true },
    });

    if (!business || business.status !== 'ACTIVE') {
      throw new Error('INVALID_BUSINESS: Business is not active or does not exist');
    }

    const { token, expiresAt } = generateQrToken(params);

    // Save token record in DB for anti-replay tracking
    await prisma.qRCode.create({
      data: {
        businessId: params.businessId,
        branchId: params.branchId || null,
        campaignId: params.campaignId || null,
        token,
        expiresAt,
        type: 'DYNAMIC_CHECKIN',
      },
    });

    // Check-in URL that the customer's phone camera or browser will open
    const checkInUrl = `${config.urls.frontendUrl}/checkin?token=${encodeURIComponent(token)}`;

    // Generate high-quality SVG/DataURL QR Code
    const qrSvg = await QRCode.toString(checkInUrl, {
      type: 'svg',
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });

    const qrDataUrl = await QRCode.toDataURL(checkInUrl, {
      margin: 2,
      width: 400,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });

    return {
      token,
      expiresAt: expiresAt.toISOString(),
      expiresInSeconds: Math.floor((expiresAt.getTime() - Date.now()) / 1000),
      businessId: params.businessId,
      branchId: params.branchId,
      campaignId: params.campaignId,
      checkInUrl,
      qrSvg,
      qrDataUrl,
    };
  }

  async generateCustomerPassQr(userId: string, email: string) {
    const token = generateCustomerPassToken(userId, email);
    const passUrl = `${config.urls.frontendUrl}/pass?token=${encodeURIComponent(token)}`;

    const qrDataUrl = await QRCode.toDataURL(token, {
      margin: 2,
      width: 400,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });

    return {
      token,
      userId,
      qrDataUrl,
    };
  }
}

export const qrService = new QrService();
