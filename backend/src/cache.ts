import NodeCache from 'node-cache';

const HOUR_IN_SECONDS = 3600;

const apiCache = new NodeCache({
  stdTTL: 24 * HOUR_IN_SECONDS,
  checkperiod: HOUR_IN_SECONDS,
});

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

export function invalidateUserCache(userId: string): void {
  const keys = userCache.keys();
  const userKeys = keys.filter((key) => key.startsWith(`user:${userId}`));
  userCache.del(userKeys);
}

export function getCacheStats() {
  return {
    api: apiCache.getStats(),
    user: userCache.getStats(),
  };
}
