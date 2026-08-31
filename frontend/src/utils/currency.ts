/**
 * Currency configuration and formatting utilities for SmartSpace AI.
 * Standard: Indian Rupee (INR / ₹), en-IN locale.
 */

export const CURRENCY_CONFIG = {
  currency: 'INR' as const,
  currencyCode: 'INR',
  currencySymbol: '₹',
  locale: 'en-IN',
  label: 'Indian Rupee (₹)',
} as const;

export const inrCurrencyFormatter = new Intl.NumberFormat(CURRENCY_CONFIG.locale, {
  style: 'currency',
  currency: CURRENCY_CONFIG.currency,
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

export const inrNumberFormatter = new Intl.NumberFormat(CURRENCY_CONFIG.locale, {
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

/**
 * Formats a numeric amount into Indian Rupee currency string with symbol.
 *
 * Examples:
 * formatCurrency(50000)   -> "₹50,000"
 * formatCurrency(100000)  -> "₹1,00,000"
 * formatCurrency(500000)  -> "₹5,00,000"
 * formatCurrency(2500000) -> "₹25,00,000"
 */
export function formatCurrency(amount: number, _currency?: string): string {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return `${CURRENCY_CONFIG.currencySymbol}0`;
  }
  return inrCurrencyFormatter.format(amount);
}

/**
 * Formats a number using the Indian numbering system without the currency symbol.
 *
 * Examples:
 * formatIndianNumber(50000)   -> "50,000"
 * formatIndianNumber(100000)  -> "1,00,000"
 * formatIndianNumber(500000)  -> "5,00,000"
 * formatIndianNumber(2500000) -> "25,00,000"
 */
export function formatIndianNumber(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '0';
  }
  return inrNumberFormatter.format(amount);
}
