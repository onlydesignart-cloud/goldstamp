// Security Sanitization & Validation Utilities for Customer App

export function sanitizeText(input: string, maxLength = 100): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[<>"{}`\\]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim()
    .slice(0, maxLength);
}

export function validateProfileForm(data: {
  fullName: string;
  email: string;
  whatsapp?: string;
}): {
  isValid: boolean;
  error?: string;
  clean: { name: string; email: string; whatsapp: string };
} {
  const cleanName = sanitizeText(data.fullName, 60);
  const cleanEmail = sanitizeText(data.email, 120).toLowerCase();
  const rawWa = (data.whatsapp || '').replace(/[^0-9+]/g, '').slice(0, 15);

  if (!cleanName || cleanName.length < 2) {
    return {
      isValid: false,
      error: 'Full Name is required (minimum 2 characters).',
      clean: { name: cleanName, email: cleanEmail, whatsapp: rawWa },
    };
  }

  if (!/^[a-zA-Z\s.'-]+$/.test(cleanName)) {
    return {
      isValid: false,
      error: 'Full Name can only contain letters, spaces, and basic punctuation.',
      clean: { name: cleanName, email: cleanEmail, whatsapp: rawWa },
    };
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!cleanEmail || !emailRegex.test(cleanEmail)) {
    return {
      isValid: false,
      error: 'Please enter a valid Email Address (e.g. name@example.com).',
      clean: { name: cleanName, email: cleanEmail, whatsapp: rawWa },
    };
  }

  if (rawWa && !/^\+?[0-9]{10,15}$/.test(rawWa)) {
    return {
      isValid: false,
      error: 'WhatsApp Number must be a valid 10 to 15 digit mobile number.',
      clean: { name: cleanName, email: cleanEmail, whatsapp: rawWa },
    };
  }

  return {
    isValid: true,
    clean: {
      name: cleanName,
      email: cleanEmail,
      whatsapp: rawWa,
    },
  };
}
