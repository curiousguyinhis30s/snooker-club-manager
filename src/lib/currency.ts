// Currency formatting utility - fixes inconsistent currency display across app

const CURRENCY_SYMBOLS: Record<string, string> = {
  SAR: 'ر.س',
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
};

export function formatCurrency(amount: number, currency: string = 'SAR'): string {
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  return `${symbol} ${amount.toFixed(2)}`;
}

export function formatCurrencyCompact(amount: number, currency: string = 'SAR'): string {
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  return `${amount.toFixed(2)} ${symbol}`;
}

export function formatRate(rate: number, currency: string = 'SAR'): string {
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  return `${rate} ${symbol}/hr`;
}

export function getCurrencySymbol(currency: string): string {
  return CURRENCY_SYMBOLS[currency] || currency;
}
