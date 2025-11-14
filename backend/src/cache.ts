/**
 * Two-tier caching system for Pokemon data and user data
 *
 * - apiCache: Long-lived cache for Pokemon metadata (24 hours)
 *   Used for data from PokéAPI that rarely changes
 *
 * - userCache: Short-lived cache for user-specific data (5 minutes)
 *   Used for authenticated user data and leaderboards
 */
import NodeCache from 'node-cache';

const HOUR_IN_SECONDS = 3600;

/**
 * Pokemon metadata cache
 * TTL: 24 hours (Pokemon data is static)
 * Check period: 1 hour (cleanup frequency)
 */
const apiCache = new NodeCache({
  stdTTL: 24 * HOUR_IN_SECONDS,
  checkperiod: HOUR_IN_SECONDS,
});

/**
 * User data cache
 * TTL: 5 minutes (user data changes frequently with game actions)
 * Check period: 1 minute (more aggressive cleanup)
 */
const userCache = new NodeCache({
  stdTTL: 5 * 60,
  checkperiod: 60,
});

export function getCachedPokemon(key: string): unknown {
  return apiCache.get(key);
}

export function setCachedPokemon(key: string, value: unknown): void {
  apiCache.set(key, value);
}

export function getCachedUserData(key: string): unknown {
  return userCache.get(key);
}

export function setCachedUserData(key: string, value: unknown): void {
  userCache.set(key, value);
}

/**
 * Invalidates all cached entries for a specific user
 * Called when user data is modified (upgrades, Pokemon caught, etc.)
 */
export function invalidateUserCache(userId: string): void {
  const keys = userCache.keys();
  const userKeys = keys.filter((key) => key.startsWith(`user:${userId}`));
  userCache.del(userKeys);
}

/**
 * Returns cache statistics for monitoring
 * Useful for debugging cache hit/miss ratios
 */
export function getCacheStats() {
  return {
    api: apiCache.getStats(),
    user: userCache.getStats(),
  };
}
