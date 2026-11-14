import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config';
import { UserRole } from '@goldstamp/types';

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  businessId?: string;
}

export interface QrTokenPayload {
  businessId: string;
  branchId?: string | null;
  campaignId?: string | null;
  nonce: string;
  exp: number;
  type: 'DYNAMIC_CHECKIN' | 'CUSTOMER_PASS';
  userId?: string;
}

export const signAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: '1d',
  });
};

export const signRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: '7d',
  });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwt.secret) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwt.refreshSecret) as TokenPayload;
};

export const generateQrToken = (params: {
  businessId: string;
  branchId?: string | null;
  campaignId?: string | null;
  expirySeconds?: number;
}): { token: string; expiresAt: Date } => {
  const expiry = params.expirySeconds || config.qr.expirySeconds;
  const expiresAt = new Date(Date.now() + expiry * 1000);
  const nonce = crypto.randomBytes(8).toString('hex');

  const payload: QrTokenPayload = {
    businessId: params.businessId,
    branchId: params.branchId || null,
    campaignId: params.campaignId || null,
    nonce,
    exp: Math.floor(expiresAt.getTime() / 1000),
    type: 'DYNAMIC_CHECKIN',
  };

  const token = jwt.sign(payload, config.qr.secret);
  return { token, expiresAt };
};

export const verifyQrToken = (token: string): QrTokenPayload => {
  return jwt.verify(token, config.qr.secret) as QrTokenPayload;
};

export const generateCustomerPassToken = (userId: string, email: string): string => {
  return jwt.sign(
    {
      userId,
      email,
      type: 'CUSTOMER_PASS',
      nonce: crypto.randomBytes(6).toString('hex'),
    },
    config.qr.secret,
    { expiresIn: '30d' }
  );
};

export const verifyCustomerPassToken = (token: string): { userId: string; email: string } => {
  return jwt.verify(token, config.qr.secret) as { userId: string; email: string };
};
