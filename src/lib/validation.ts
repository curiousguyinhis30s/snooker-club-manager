/**
 * Data Validation Utilities
 * Prevent invalid data from entering the system
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/** Validate positive number (quantity, price, etc.) */
export const validatePositiveNumber = (value: number, fieldName: string = 'Value'): ValidationResult => {
  if (isNaN(value)) {
    return { valid: false, error: `${fieldName} must be a number` };
  }
  if (value <= 0) {
    return { valid: false, error: `${fieldName} must be greater than zero` };
  }
  return { valid: true };
};

/** Validate non-negative number (discounts can be 0) */
export const validateNonNegativeNumber = (value: number, fieldName: string = 'Value'): ValidationResult => {
  if (isNaN(value)) {
    return { valid: false, error: `${fieldName} must be a number` };
  }
  if (value < 0) {
    return { valid: false, error: `${fieldName} cannot be negative` };
  }
  return { valid: true };
};

/** Validate non-empty string */
export const validateNonEmptyString = (value: string, fieldName: string = 'Field'): ValidationResult => {
  if (!value || value.trim().length === 0) {
    return { valid: false, error: `${fieldName} cannot be empty` };
  }
  return { valid: true };
};

/** Validate phone number (basic format check) */
export const validatePhoneNumber = (phone: string): ValidationResult => {
  if (!phone || phone.trim().length === 0) {
    return { valid: true }; // Phone is optional
  }

  const trimmed = phone.trim();

  // Check if it's at least 10 digits and contains only numbers, spaces, +, -, ()
  const phoneRegex = /^[+\-\d\s()]{10,}$/;
  if (!phoneRegex.test(trimmed)) {
    return { valid: false, error: 'Phone number must be at least 10 digits and contain only numbers, spaces, +, -, ()' };
  }

  return { valid: true };
};

/** Validate email (basic format check) */
export const validateEmail = (email: string): ValidationResult => {
  if (!email || email.trim().length === 0) {
    return { valid: true }; // Email is optional
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { valid: false, error: 'Invalid email format' };
  }

  return { valid: true };
};

/** Validate percentage (0-100) */
export const validatePercentage = (value: number): ValidationResult => {
  if (isNaN(value)) {
    return { valid: false, error: 'Percentage must be a number' };
  }
  if (value < 0 || value > 100) {
    return { valid: false, error: 'Percentage must be between 0 and 100' };
  }
  return { valid: true };
};

/** Validate discount amount (cannot exceed subtotal) */
export const validateDiscountAmount = (discount: number, subtotal: number): ValidationResult => {
  const nonNegCheck = validateNonNegativeNumber(discount, 'Discount');
  if (!nonNegCheck.valid) return nonNegCheck;

  if (discount > subtotal) {
    return { valid: false, error: `Discount cannot exceed subtotal (${subtotal.toFixed(2)})` };
  }

  return { valid: true };
};

/** Sanitize string (trim whitespace, remove dangerous characters) */
export const sanitizeString = (value: string): string => {
  return value.trim().replace(/[<>]/g, ''); // Remove < and > to prevent XSS
};

/** Normalize phone number (remove spaces, dashes, parentheses) */
export const normalizePhoneNumber = (phone: string): string => {
  return phone.replace(/[\s\-()]/g, '');
};

/** Validate customer data */
export const validateCustomer = (name: string, phone?: string, email?: string): ValidationResult => {
  const nameCheck = validateNonEmptyString(name, 'Customer name');
  if (!nameCheck.valid) return nameCheck;

  if (phone) {
    const phoneCheck = validatePhoneNumber(phone);
    if (!phoneCheck.valid) return phoneCheck;
  }

  if (email) {
    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) return emailCheck;
  }

  return { valid: true };
};
