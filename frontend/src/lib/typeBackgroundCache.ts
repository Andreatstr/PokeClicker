/**
 * Pokemon Type Background Cache
 *
 * Manages caching for Pokemon type background images used throughout the app.
 * These backgrounds provide visual theming based on Pokemon types (fire, water, etc.)
 *
 * Storage Location:
 * - Images stored in public/pokemon-type-bg/ directory
 * - Deployed with app bundle (no external CDN)
 * - WebP format for optimal size/quality balance
 *
 * Preloading Strategy:
 * - Common types preloaded on app startup (fire, water, grass, etc.)
 * - All types can be preloaded for offline-ready experience
 * - Tracks preloaded types to avoid duplicate work
 *
 * Performance:
 * - Local files load faster than CDN (no DNS/TCP overhead)
 * - Small WebP images (~50KB each) for fast loading
 * - Cached in memory + IndexedDB via imageCache
 */

import {imageCache} from './imageCache';
import {logger} from '@/lib/logger';

interface TypeBackgroundUrls {
  [type: string]: string;
}

class TypeBackgroundCache {
  private baseUrl = `${import.meta.env.BASE_URL}pokemon-type-bg`;
  private typeBackgrounds: TypeBackgroundUrls = {};
  // Tracks which types have been preloaded to prevent redundant operations
  private preloadedTypes = new Set<string>();

  private getTypeBackgroundUrl(type: string): string {
    if (this.typeBackgrounds[type]) {
      return this.typeBackgrounds[type];
    }

    const url = `${this.baseUrl}/${type}.webp`;
    this.typeBackgrounds[type] = url;
    return url;
  }

  /**
   * Get type background with fallback
   *
   * Returns 'unknown' type background if specific type fails to load.
   * This ensures UI never breaks due to missing/corrupted type images.
   */
  async getTypeBackground(type: string): Promise<HTMLImageElement> {
    const url = this.getTypeBackgroundUrl(type);

    try {
      return await imageCache.getImage(url);
    } catch (error) {
      logger.logError(error, `LoadTypeBackground:${type}`);
      // Graceful degradation to unknown type
      const fallbackUrl = `${this.baseUrl}/unknown.webp`;
      return imageCache.getImage(fallbackUrl);
    }
  }

  /**
   * Preload all 19 type backgrounds
   *
   * Total size: ~950KB (19 types × ~50KB each)
   * Use case: Offline-ready PWA or eliminating all type-related network requests
   */
  async preloadAllTypeBackgrounds(): Promise<void> {
    const allTypes = [
      'normal',
      'fire',
      'water',
      'electric',
      'grass',
      'ice',
      'fighting',
      'poison',
      'ground',
      'flying',
      'psychic',
      'bug',
      'rock',
      'ghost',
      'dragon',
      'dark',
      'steel',
      'fairy',
      'unknown',
    ];

    const urls = allTypes.map((type) => this.getTypeBackgroundUrl(type));
    await imageCache.preloadImages(urls);

    allTypes.forEach((type) => this.preloadedTypes.add(type));
  }

  /**
   * Preload specific type backgrounds
   *
   * Used when filtering Pokedex by type - preload only the types
   * currently visible to minimize initial load time.
   */
  async preloadTypeBackgrounds(types: string[]): Promise<void> {
    const urls = types.map((type) => this.getTypeBackgroundUrl(type));
    await imageCache.preloadImages(urls);

    types.forEach((type) => this.preloadedTypes.add(type));
  }

  /**
   * Preload most common Pokemon types
   *
   * Covers ~60% of all Pokemon with just 8 types (~400KB total).
   * Called on app startup for optimal first-page experience.
   */
  async preloadCommonTypes(): Promise<void> {
    const commonTypes = [
      'normal',
      'fire',
      'water',
      'electric',
      'grass',
      'psychic',
      'fighting',
      'poison',
    ];
    await this.preloadTypeBackgrounds(commonTypes);
  }

  /**
   * Get type background URL without loading
   *
   * For components that manage their own loading (e.g., CSS background-image)
   */
  getCachedTypeBackgroundUrl(type: string): string {
    return this.getTypeBackgroundUrl(type);
  }

  /**
   * Check if type has been preloaded
   *
   * Useful for deciding whether to show loading state or not
   */
  isTypePreloaded(type: string): boolean {
    return this.preloadedTypes.has(type);
  }

  getPreloadedTypes(): string[] {
    return Array.from(this.preloadedTypes);
  }

  /**
   * Clear URL cache and preload tracking
   * Note: Doesn't clear actual images (use imageCache.clearCache for that)
   */
  clearTypeCache(): void {
    this.typeBackgrounds = {};
    this.preloadedTypes.clear();
  }

  getCacheStats() {
    return imageCache.getStats();
  }
}

/**
 * Singleton instance - centralized type background management
 */
export const typeBackgroundCache = new TypeBackgroundCache();

// Export types
export type {TypeBackgroundUrls};
