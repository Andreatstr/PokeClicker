/**
 * Decimal Number Utilities
 * Uses break_infinity.js library for handling extremely large numbers
 * beyond JavaScript's Number.MAX_SAFE_INTEGER (2^53 - 1)
 *
 * This is essential for incremental/clicker games where numbers can grow
 * to astronomical values (e.g., 10^100 or higher)
 */

import Decimal from 'break_infinity.js';

/**
 * Convert various input types to Decimal
 * Provides unified interface for handling mixed number types
 * @param value - Value to convert (Decimal, string, number, or undefined)
 * @returns Decimal instance (defaults to 0 for undefined/null)
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
 * Decimal objects cannot be directly serialized, so we store as strings
 * @param value - The Decimal value to convert
 * @returns String representation that preserves full precision
 */
export function decimalToString(value: Decimal | string | number): string {
  return toDecimal(value).toString();
}

/**
 * Format a number with magnitude suffixes for display
 *
 * Algorithm:
 * 1. Numbers < 1000: Show as-is (or with 2 decimals if < 100 and showDecimals=true)
 * 2. Numbers >= 1000: Use suffix notation (1.2K, 5.3M, etc.)
 * 3. Use dynamic decimal precision: 0 decimals for 100+, 1 for 10-99, 2 for <10
 * 4. Fall back to scientific notation if exceeding suffix array
 *
 * @param value - The value to format
 * @param options - Formatting options
 * @param options.showDecimals - Show decimals for small values (< 100)
 * @returns Formatted string (e.g., "1.2K", "5.3M", "1.2e45")
 */
export function formatNumber(
  value: Decimal | string | number,
  options?: {showDecimals?: boolean}
): string {
  const decimal = toDecimal(value);

  // Handle negative numbers recursively
  if (decimal.lt(0)) {
    return '-' + formatNumber(decimal.abs(), options);
  }

  // Numbers less than 1000 - show without suffix
  if (decimal.lt(1000)) {
    // Show with 2 decimals for small values if requested
    if (options?.showDecimals && decimal.lt(100)) {
      return decimal.toFixed(2);
    }
    return decimal.floor().toString();
  }

  // Get the order of magnitude (log10 returns a regular number)
  const exponent = Math.floor(decimal.log10());
  // Each suffix represents 3 orders of magnitude (1000x)
  const suffixIndex = Math.floor(exponent / 3);

  // Use K, M, B, T notation for smaller numbers (up to trillion)
  // After T, switch to E-notation (scientific notation)
  const shortSuffixes = ['', 'K', 'M', 'B', 'T'];

  if (suffixIndex < shortSuffixes.length && suffixIndex > 0) {
    const divisor = Decimal.pow(10, suffixIndex * 3);
    const mantissa = decimal.dividedBy(divisor);

    // Dynamic decimal precision based on magnitude
    const baseValue = mantissa.toNumber();
    const decimals = baseValue >= 100 ? 0 : baseValue >= 10 ? 1 : 2;

    return `${mantissa.toFixed(decimals)}${shortSuffixes[suffixIndex]}`;
  }

  // Use E-notation for everything beyond trillion
  // Examples: 1.50e+15, 2.57e+23, 1.90e+32
  return decimal.toExponential(2);
}

/**
 * Re-export Decimal class for convenience
 */
export {Decimal};
