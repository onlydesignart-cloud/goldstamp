import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// In-memory rate limiting map for OTP dispatch (prevents email spam / quota exhaustion)
// Key: email or IP, Value: array of timestamps
const rateLimitMap: Map<string, number[]> = new Map();
const MAX_REQUESTS_PER_WINDOW = 3;
const WINDOW_MS = 60 * 1000; // 60 seconds

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(key) || [];
  const validTimestamps = timestamps.filter((t) => now - t < WINDOW_MS);

  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    rateLimitMap.set(key, validTimestamps);
    return false;
  }

  validTimestamps.push(now);
  rateLimitMap.set(key, validTimestamps);
  return true;
}

function escapeHtml(str: unknown): string {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'anonymous';
    const body = await req.json();
    const { email, code, businessName, name, type = 'MERCHANT' } = body;

    // 1. Strict Server-Side Input Validation
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'A valid email address is required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address format.' },
        { status: 400 }
      );
    }

    // 2. Strict OTP Code Format (Must be exactly 4 digits)
    const cleanCode = String(code || '').trim();
    if (!/^\d{4}$/.test(cleanCode)) {
      return NextResponse.json(
        { success: false, error: 'Security code must be a 4-digit number.' },
        { status: 400 }
      );
    }

    // 3. Rate-Limiting Protection (Max 3 OTPs per minute per IP / Email)
    if (!checkRateLimit(`${ip}:${cleanEmail}`)) {
      return NextResponse.json(
        {
          success: false,
          error: 'RATE_LIMIT_EXCEEDED: Too many OTP requests. Please wait 60 seconds before requesting a new code.',
        },
        { status: 429 }
      );
    }

    // 4. Sanitize strings to prevent email HTML injection
    const safeName = escapeHtml(name || '');
    const safeBizName = escapeHtml(businessName || '');
    const isMerchant = type === 'MERCHANT';
    const recipientName = safeName || (isMerchant ? safeBizName || 'Business Owner' : 'Customer');
    const subject = `GoldStamp Security: Your 4-Digit Verification Code is ${cleanCode}`;

    const smtpUser = process.env.SMTP_USER || 'goldstamployalty@gmail.com';
    const smtpPass = process.env.SMTP_PASS || 'kyeiumidwllzyojl';

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>GoldStamp Security Verification</title>
      </head>
      <body style="margin: 0; padding: 24px 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          
          <div style="background-color: #059669; padding: 28px 24px; text-align: center;">
            <div style="display: inline-block; background-color: rgba(255, 255, 255, 0.2); border-radius: 9999px; padding: 8px 18px; margin-bottom: 12px;">
              <span style="font-size: 15px; font-weight: 800; color: #ffffff; letter-spacing: 0.5px;">⭐ GOLDSTAMP</span>
            </div>
            <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">Email Verification Code</h1>
          </div>

          <div style="padding: 32px 28px; text-align: center;">
            <p style="color: #334155; font-size: 15px; line-height: 1.5; margin: 0 0 8px 0;">
              Hello <strong>${recipientName}</strong>,
            </p>
            <p style="color: #64748b; font-size: 14px; line-height: 1.5; margin: 0 0 24px 0;">
              Use the following 4-digit security code to verify and activate your GoldStamp account:
            </p>

            <div style="background: #f8fafc; border: 2px dashed #10b981; border-radius: 16px; padding: 20px 16px; margin: 0 auto 24px auto; max-width: 280px;">
              <span style="font-family: 'Courier New', Courier, monospace; font-size: 44px; font-weight: 900; letter-spacing: 14px; color: #0f172a; display: inline-block; padding-left: 14px;">${cleanCode}</span>
            </div>

            <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin: 0 0 8px 0;">
              ⏳ This 4-digit code will expire in <strong>15 minutes</strong>.
            </p>
            <p style="color: #94a3b8; font-size: 11px; margin: 0;">
              If you didn't request this verification code, you can safely ignore this email.
            </p>
          </div>

          <div style="background-color: #f8fafc; border-top: 1px solid #f1f5f9; padding: 16px 24px; text-align: center;">
            <p style="color: #94a3b8; font-size: 11px; margin: 0;">
              © 2026 GoldStamp Loyalty Platform. Automated Security Dispatch.
            </p>
          </div>

        </div>
      </body>
    </html>
    `;

    const info = await transporter.sendMail({
      from: '"GoldStamp Security" <goldstamployalty@gmail.com>',
      to: cleanEmail,
      subject,
      html: htmlContent,
    });

    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error: any) {
    console.error('Failed to dispatch 4-digit OTP email:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to send verification email' },
      { status: 500 }
    );
  }
}
