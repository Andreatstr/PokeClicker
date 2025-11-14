/**
 * Server configuration for adaptive filter faceting
 *
 * Implements a performance optimization strategy for filter counts:
 * - Small datasets (<10k Pokemon): Use dynamic aggregation for accurate real-time counts
 * - Large datasets (>10k Pokemon): Use precomputed static counts for speed
 *
 * This prevents slow queries on large datasets while maintaining accuracy for smaller ones
 */
import 'dotenv/config';

/**
 * Threshold for switching between dynamic and static filter counts
 * Below this value: aggregation queries run per request
 * Above this value: precomputed counts are used
 */
export const DYNAMIC_FACET_THRESHOLD = parseInt(
  process.env.DYNAMIC_FACET_THRESHOLD || '10000'
);

/**
 * Maximum time allowed for facet aggregation queries
 * If exceeded, falls back to static counts to prevent slow responses
 */
export const FACET_TIMEOUT_MS = parseInt(process.env.FACET_TIMEOUT_MS || '100');

/**
 * Whether to enable fallback to static counts on timeout or error
 * Can be disabled in development for debugging aggregation issues
 */
export const USE_STATIC_FALLBACK = process.env.USE_STATIC_FALLBACK !== 'false';
