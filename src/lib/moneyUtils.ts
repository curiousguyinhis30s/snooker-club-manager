/**
 * Money Utilities - Precision-safe money calculations
 *
 * All calculations done in cents (integer math) to avoid floating-point errors
 * Example: 0.1 + 0.2 = 0.30000000000000004 (WRONG)
 *          toCents(0.1) + toCents(0.2) = 30 cents = 0.30 (CORRECT)
 */

/** Convert currency to cents (integer) */
export const toCents = (amount: number): number => {
  return Math.round(amount * 100);
};

/** Convert cents back to currency */
export const fromCents = (cents: number): number => {
  return cents / 100;
};

/** Add two currency amounts precisely */
export const addMoney = (a: number, b: number): number => {
  return fromCents(toCents(a) + toCents(b));
};

/** Subtract two currency amounts precisely */
export const subtractMoney = (a: number, b: number): number => {
  return fromCents(toCents(a) - toCents(b));
};

/** Multiply currency by a number (e.g., price * quantity) */
export const multiplyMoney = (amount: number, multiplier: number): number => {
  return fromCents(Math.round(toCents(amount) * multiplier));
};

/** Calculate percentage of an amount */
export const percentageOf = (amount: number, percentage: number): number => {
  return fromCents(Math.round((toCents(amount) * percentage) / 100));
};

/** Sum array of currency amounts */
export const sumMoney = (amounts: number[]): number => {
  const totalCents = amounts.reduce((sum, amount) => sum + toCents(amount), 0);
  return fromCents(totalCents);
};

/** Round to 2 decimal places (currency precision) */
export const roundMoney = (amount: number): number => {
  return fromCents(toCents(amount));
};

/** Check if two amounts are equal (accounting for floating-point errors) */
export const moneyEquals = (a: number, b: number, tolerance: number = 0.01): boolean => {
  return Math.abs(a - b) < tolerance;
};
