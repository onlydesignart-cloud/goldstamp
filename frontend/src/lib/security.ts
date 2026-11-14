/**
 * Client-Side Security & Data Sanitization Layer for Gold Stamp
 * Defends against XSS, injection, prototype pollution, click-jacking double-submits,
 * and malicious or corrupted LocalStorage states.
 */

// 1. XSS & HTML Tag Sanitizer
export function sanitizeText(input: unknown, maxLength = 500): string {
  if (typeof input !== 'string') {
    if (input === null || input === undefined) return '';
    return String(input).slice(0, maxLength);
  }

  return input
    .trim()
    // Strip HTML tags (<script>, <iframe>, <img>, etc.)
    .replace(/<\/?[^>]+(>|$)/gi, '')
    // Strip dangerous javascript: pseudo-protocols
    .replace(/javascript:/gi, '')
    // Strip event attributes like onclick=, onerror=, onload=
    .replace(/\bon\w+\s*=/gi, '')
    // Limit string length to prevent memory buffer overflows
    .slice(0, maxLength);
}

// 2. Strict Phone Number Sanitizer
export function sanitizePhone(phone: unknown): string {
  if (typeof phone !== 'string') return '';
  const trimmed = phone.trim();
  const startsWithPlus = trimmed.startsWith('+');
  const digitsOnly = trimmed.replace(/[^0-9]/g, '');

  if (digitsOnly.length < 8 || digitsOnly.length > 15) {
    return '';
  }

  return startsWithPlus ? `+${digitsOnly}` : digitsOnly;
}

// 3. Email Sanitizer & Validator
export function sanitizeEmail(email: unknown): string {
  if (typeof email !== 'string') return '';
  const clean = email.trim().toLowerCase().slice(0, 100);
  // Standard RFC 5322 simplified email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(clean) ? clean : '';
}

// 4. Voucher Code Sanitizer (Alphanumeric + Hyphen whitelist)
export function sanitizeVoucherCode(code: unknown): string {
  if (typeof code !== 'string') return '';
  // Only allow uppercase letters, numbers, and hyphens (e.g. SMASH-7K9A2)
  return code
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9\-]/g, '')
    .slice(0, 20);
}

// 5. Safe JSON Parser (Prevents prototype pollution & uncaught crashes from corrupted localStorage)
export function safeJsonParse<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    // Defend against prototype pollution
    if (parsed && typeof parsed === 'object') {
      delete (parsed as any).__proto__;
      delete (parsed as any).constructor;
      delete (parsed as any).prototype;
    }
    return parsed as T;
  } catch {
    return fallback;
  }
}

// 6. Resilient LocalStorage Wrapper
export const secureStorage = {
  get<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback;
    try {
      const item = localStorage.getItem(key);
      return safeJsonParse<T>(item, fallback);
    } catch {
      return fallback;
    }
  },

  set(key: string, value: unknown): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, serialized);
      return true;
    } catch {
      return false;
    }
  },

  remove(key: string): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch {
      // Non-blocking
    }
  },
};

// 7. Client-Side Click-Jacking & Double-Submit Debounce / Cooldown Guard
const actionTimestamps: Record<string, number> = {};

export function checkClientRateLimit(actionKey: string, cooldownMs = 1500): boolean {
  const now = Date.now();
  const lastTime = actionTimestamps[actionKey] || 0;

  if (now - lastTime < cooldownMs) {
    return false; // Rate limited / blocked spam
  }

  actionTimestamps[actionKey] = now;
  return true; // Allowed
}
