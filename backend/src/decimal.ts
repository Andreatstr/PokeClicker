import Decimal from 'break_infinity.js';

/**
 * Utility functions for working with Decimal numbers (break_infinity.js)
 * Used for handling large numbers that exceed JavaScript's safe integer limit
 *
 * Why use Decimal?
 * - JavaScript's Number type is limited to 2^53 (9 quadrillion)
 * - Idle/clicker games can easily exceed this with exponential growth
 * - Decimal provides arbitrary precision arithmetic
 * - MongoDB stores as string to preserve precision
 */

/**
 * Converts various input types to Decimal for safe arithmetic
 * Handles null/undefined by defaulting to 0
 *
 * @param value - Input value (Decimal, string, number, or undefined)
 * @returns Decimal instance (defaults to 0 for null/undefined)
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
 * Converts Decimal to string for MongoDB storage
 * MongoDB stores large numbers as strings to prevent precision loss
 *
 * @param value - Decimal, string, or number to convert
 * @returns String representation suitable for database storage
 */
export function decimalToString(value: Decimal | string | number): string {
  return toDecimal(value).toString();
}

/**
 * Converts Decimal to native JavaScript number
 * WARNING: May lose precision for numbers exceeding Number.MAX_SAFE_INTEGER
 * Only use for display or when you know the value is small
 *
 * @param value - Decimal, string, or number to convert
 * @returns Number (precision may be lost for large values)
 */
export function decimalToNumber(value: Decimal | string | number): number {
  return toDecimal(value).toNumber();
}

export {Decimal};
