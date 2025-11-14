/**
 * Number Formatting Utilities
 * Formats large numbers with K/M/B/T suffixes for better readability
 * Delegates to decimal.ts for implementation
 */

import {formatNumber as formatDecimalNumber} from './decimal';
import type {Decimal} from './decimal';

/**
 * Format large numbers into human-readable strings with suffixes
 *
 * Examples:
 * - 850 → "850"
 * - 1,234 → "1.2K"
 * - 51,200 → "51.2K"
 * - 1,560,000 → "1.6M"
 * - 2.3e30 → "2.3No" (nonillion)
 *
 * @param num - The number to format (supports number, string, or Decimal)
 * @param options - Formatting options
 * @param options.showDecimals - If true, show decimals for small values
 * @returns Formatted string representation
 */
export function formatNumber(
  num: number | string | Decimal,
  options?: {showDecimals?: boolean}
): string {
  // Use the Decimal-based formatter which handles all number types
  return formatDecimalNumber(num, options);
}
