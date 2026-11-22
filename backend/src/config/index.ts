import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:1234@localhost:5432/digitalstamp?schema=public',
  
  jwt: {
    secret: process.env.JWT_SECRET || 'super-secure-jwt-secret-key-goldstamp-2026-production-grade',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'super-secure-refresh-jwt-secret-key-goldstamp-2026',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  
  qr: {
    secret: process.env.QR_TOKEN_SECRET || 'super-secure-qr-hmac-token-secret-goldstamp-2026',
    expirySeconds: parseInt(process.env.QR_EXPIRY_SECONDS || '1800', 10),
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_goldstamp_key',
    keySecret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_mock_goldstamp_secret',
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || 'rzp_test_mock_webhook_secret',
  },

  urls: {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  }
};
