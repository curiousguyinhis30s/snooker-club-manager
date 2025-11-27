import DOMPurify from 'dompurify';

/**
 * Sanitize user input to prevent XSS attacks
 * Use this for any user-generated content that will be displayed in the UI
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Basic sanitization - remove HTML tags and malicious scripts
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // Don't allow any HTML tags
    ALLOWED_ATTR: [], // Don't allow any attributes
    KEEP_CONTENT: true, // Keep text content
  }).trim();
}

/**
 * Sanitize HTML content while allowing safe formatting tags
 * Use this when you want to allow basic HTML formatting (bold, italic, etc.)
 */
export function sanitizeHTML(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target'],
    ALLOW_DATA_ATTR: false,
  }).trim();
}

/**
 * Sanitize number input
 * Ensures the input is a valid number and within optional bounds
 */
export function sanitizeNumber(
  input: string | number,
  options?: {
    min?: number;
    max?: number;
    allowDecimals?: boolean;
  }
): number {
  let num = typeof input === 'string' ? parseFloat(input) : input;

  // Check if valid number
  if (isNaN(num) || !isFinite(num)) {
    return 0;
  }

  // Round if decimals not allowed
  if (options?.allowDecimals === false) {
    num = Math.round(num);
  }

  // Apply bounds
  if (options?.min !== undefined && num < options.min) {
    num = options.min;
  }
  if (options?.max !== undefined && num > options.max) {
    num = options.max;
  }

  return num;
}

/**
 * Sanitize phone number input
 * Removes all non-digit characters
 */
export function sanitizePhone(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Keep only digits and + sign
  return input.replace(/[^\d+]/g, '').trim();
}

/**
 * Sanitize email input
 * Basic email format validation
 */
export function sanitizeEmail(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove whitespace and convert to lowercase
  const email = input.trim().toLowerCase();

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return '';
  }

  return email;
}

/**
 * Sanitize alphanumeric input (for IDs, usernames, etc.)
 * Allows only letters, numbers, hyphens, and underscores
 */
export function sanitizeAlphanumeric(input: string, options?: {
  allowSpaces?: boolean;
  allowHyphens?: boolean;
  allowUnderscores?: boolean;
}): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  let pattern = '[^a-zA-Z0-9';
  if (options?.allowSpaces) pattern += ' ';
  if (options?.allowHyphens) pattern += '-';
  if (options?.allowUnderscores) pattern += '_';
  pattern += ']';

  const regex = new RegExp(pattern, 'g');
  return input.replace(regex, '').trim();
}

/**
 * Validate and sanitize currency amount
 */
export function sanitizeCurrency(input: string | number): number {
  const num = sanitizeNumber(input, {
    min: 0,
    allowDecimals: true,
  });

  // Round to 2 decimal places for currency
  return Math.round(num * 100) / 100;
}

/**
 * Sanitize object with multiple fields
 * Useful for form data
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  schema: Partial<Record<keyof T, 'text' | 'html' | 'number' | 'phone' | 'email' | 'alphanumeric' | 'currency'>>
): T {
  const sanitized: any = {};

  for (const key in obj) {
    const value = obj[key];
    const type = schema[key];

    if (!type) {
      // No sanitization rule, keep as is
      sanitized[key] = value;
      continue;
    }

    switch (type) {
      case 'text':
        sanitized[key] = sanitizeInput(value);
        break;
      case 'html':
        sanitized[key] = sanitizeHTML(value);
        break;
      case 'number':
        sanitized[key] = sanitizeNumber(value);
        break;
      case 'phone':
        sanitized[key] = sanitizePhone(value);
        break;
      case 'email':
        sanitized[key] = sanitizeEmail(value);
        break;
      case 'alphanumeric':
        sanitized[key] = sanitizeAlphanumeric(value);
        break;
      case 'currency':
        sanitized[key] = sanitizeCurrency(value);
        break;
      default:
        sanitized[key] = value;
    }
  }

  return sanitized as T;
}
