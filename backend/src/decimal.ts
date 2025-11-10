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
 * Convert Decimal to string for storage (MongoDB)
 */
export function decimalToString(value: Decimal | string | number): string {
  return toDecimal(value).toString();
}

/**
 * Convert Decimal to number (for backward compatibility or small values)
 * WARNING: May lose precision for large numbers
 */
export function decimalToNumber(value: Decimal | string | number): number {
  return toDecimal(value).toNumber();
}

/**
 * Re-export Decimal class for convenience
 */
export {Decimal};
