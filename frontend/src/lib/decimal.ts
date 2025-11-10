import Decimal from 'break_infinity.js';

/**
 * Utility functions for working with Decimal numbers (break_infinity.js)
 * Used for handling large numbers that exceed JavaScript's safe integer limit
 */

/**
 * Convert various input types to Decimal
 */
export function toDecimal(
  value: Decimal | string | number | undefined
): Decimal {
  if (value === undefined || value === null) {
    return new Decimal(0);
  }
  if (value instanceof Decimal) {
    return value;
  }
  return new Decimal(value);
}

/**
 * Convert Decimal to string for storage (MongoDB, JSON)
 */
export function decimalToString(value: Decimal | string | number): string {
  return toDecimal(value).toString();
}

/**
 * Format candy amount for display
 * Uses K, M, B, T, etc. suffixes for large numbers
 */
const SUFFIXES = [
  '',
  'K',
  'M',
  'B',
  'T',
  'Qa',
  'Qi',
  'Sx',
  'Sp',
  'Oc',
  'No',
  'Dc',
  'UDc',
  'DDc',
  'TDc',
  'QaDc',
  'QiDc',
  'SxDc',
  'SpDc',
  'OcDc',
  'NoDc',
  'Vg',
  'UVg',
  'DVg',
  'TVg',
  'QaVg',
  'QiVg',
  'SxVg',
  'SpVg',
  'OcVg',
  'NoVg',
  'Tg',
];

export function formatNumber(value: Decimal | string | number): string {
  const decimal = toDecimal(value);

  // Handle negative numbers
  if (decimal.lt(0)) {
    return '-' + formatNumber(decimal.abs());
  }

  // Numbers less than 1000 show as-is
  if (decimal.lt(1000)) {
    return decimal.floor().toString();
  }

  // Get the order of magnitude
  // Note: log10() returns a number, not a Decimal
  const exponent = Math.floor(decimal.log10());
  const suffixIndex = Math.floor(exponent / 3);

  // Use suffix notation if we have a suffix for it
  if (suffixIndex < SUFFIXES.length && suffixIndex > 0) {
    const divisor = Decimal.pow(10, suffixIndex * 3);
    const mantissa = decimal.dividedBy(divisor);

    // Show 2 decimal places for numbers >= 100 in that suffix range, 1 decimal place otherwise
    const baseValue = mantissa.toNumber();
    const decimals = baseValue >= 100 ? 0 : baseValue >= 10 ? 1 : 2;

    return `${mantissa.toFixed(decimals)}${SUFFIXES[suffixIndex]}`;
  }

  // Fall back to scientific notation for extremely large numbers
  return decimal.toExponential(2);
}

/**
 * Re-export Decimal class for convenience
 */
export {Decimal};
