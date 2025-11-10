import {formatNumber as formatDecimalNumber} from './decimal';
import type {Decimal} from './decimal';

/**
 * Format large numbers into human-readable strings
 * Now supports both regular numbers and Decimal/string for very large numbers
 * Examples:
 * - 850 → "850"
 * - 1,234 → "1.2K"
 * - 51,200 → "51.2K"
 * - 1,560,000 → "1.6M"
 * - 2.3e30 → "2.3No" (nonillion)
 */
export function formatNumber(num: number | string | Decimal): string {
  // Use the Decimal-based formatter which handles all number types
  return formatDecimalNumber(num);
}
