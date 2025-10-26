/**
 * Format large numbers into human-readable strings
 * Examples:
 * - 850 → "850"
 * - 1,234 → "1.2K"
 * - 51,200 → "51.2K"
 * - 1,560,000 → "1.6M"
 * - 2.3e30 → "2.3e30"
 */
export function formatNumber(num: number): string {
  if (num < 1000) {
    return Math.floor(num).toString();
  }

  if (num < 1_000_000) {
    return `${(num / 1000).toFixed(1)}K`;
  }

  if (num < 1_000_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }

  if (num < 1e12) {
    return `${(num / 1e9).toFixed(1)}B`;
  }

  if (num < 1e15) {
    return `${(num / 1e12).toFixed(1)}T`;
  }

  // For extremely large numbers, use scientific notation
  return num.toExponential(1);
}
