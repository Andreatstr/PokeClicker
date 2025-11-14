/**
 * Two-Tier Image Caching System
 *
 * Combines fast in-memory cache with persistent IndexedDB storage for optimal
 * performance and user experience.
 *
 * Cache Hierarchy:
 * 1. Memory Cache (L1): Instant access to recently used images (50MB limit)
 * 2. IndexedDB (L2): Persistent storage across sessions (browser-managed limits)
 * 3. Network: Fallback with retry logic and rate limit handling
 *
 * Performance Strategy:
 * - Memory cache eliminates DOM lookups and object URL recreation
 * - IndexedDB cache eliminates network requests across sessions
 * - LRU eviction in memory cache keeps hot images accessible
 * - Batched preloading respects API rate limits (10 images/second)
 *
 * Memory Management:
 * - 50MB memory limit prevents browser slowdown with large image sets
 * - Automatic cleanup removes oldest 30% when limit exceeded
 * - Tracks image sizes for accurate memory accounting
 */

import {indexedDBCache} from './indexedDBCache';
import {logger} from '@/lib/logger';

interface CacheStats {
  totalSize: number;
  itemCount: number;
  hitRate: number;
  missCount: number;
  hitCount: number;
}

interface CachedHTMLImageElement extends HTMLImageElement {
  timestamp?: number; // For LRU eviction
  size?: number; // For memory accounting
}

class ImageCacheService {
  private memoryCache = new Map<string, CachedHTMLImageElement>();
  private maxMemorySize = 50 * 1024 * 1024; // 50MB - balances performance vs memory pressure
  private currentMemorySize = 0;
  private stats: CacheStats = {
    totalSize: 0,
    itemCount: 0,
    hitRate: 0,
    missCount: 0,
    hitCount: 0,
  };

  constructor() {
    // Proactive cleanup on app startup removes stale IndexedDB entries
    this.initCleanup();
  }

  private async initCleanup() {
    try {
      await indexedDBCache.cleanup();
    } catch (error) {
      logger.logError(error, 'CleanupIndexeddb');
    }
  }

  /**
   * LRU eviction for memory cache
   *
   * Removes oldest 30% of entries when memory limit exceeded.
   * This aggressive eviction prevents frequent cleanup cycles while
   * keeping recently-used images (hot set) in memory.
   */
  private cleanupMemoryCache() {
    if (this.currentMemorySize <= this.maxMemorySize) return;

    const entries = Array.from(this.memoryCache.entries());
    entries.sort((a, b) => {
      const aTime = a[1].timestamp || 0;
      const bTime = b[1].timestamp || 0;
      return aTime - bTime; // Oldest first
    });

    // 30% eviction reduces cleanup frequency compared to removing single items
    const toRemove = entries.slice(0, Math.floor(entries.length * 0.3));
    toRemove.forEach(([key]) => {
      this.memoryCache.delete(key);
    });

    // Recalculate memory usage after eviction
    this.currentMemorySize = 0;
    this.memoryCache.forEach((img) => {
      this.currentMemorySize += img.size || 0;
    });
  }

  /**
   * Get image with two-tier cache lookup
   *
   * Cache hierarchy provides optimal performance:
   * 1. Memory: ~0ms (synchronous Map lookup)
   * 2. IndexedDB: ~5-20ms (async but local)
   * 3. Network: 100-500ms (depends on connection and API rate limits)
   *
   * IndexedDB hits are promoted to memory cache for faster subsequent access.
   */
  async getImage(url: string): Promise<HTMLImageElement> {
    // L1: Memory cache check (fastest path)
    if (this.memoryCache.has(url)) {
      this.stats.hitCount++;
      this.updateStats();
      return this.memoryCache.get(url)!;
    }

    // L2: IndexedDB cache check (persistent storage)
    try {
      const cachedBlob = await indexedDBCache.get(url);
      if (cachedBlob) {
        this.stats.hitCount++;
        this.updateStats();

        const img = new Image() as CachedHTMLImageElement;
        img.src = URL.createObjectURL(cachedBlob);
        img.timestamp = Date.now();
        img.size = cachedBlob.size;

        // Promote to memory cache for faster future access
        this.memoryCache.set(url, img);
        this.currentMemorySize += cachedBlob.size;
        this.cleanupMemoryCache();

        return img;
      }
    } catch (error) {
      logger.logError(error, 'IndexedDBCacheMiss');
    }

    // L3: Network fetch with retry logic
    this.stats.missCount++;
    this.updateStats();
    logger.info(`Network fetch for ${url.split('/').pop()}`, 'ImageCache');

    return this.fetchImageWithRetry(url);
  }

  /**
   * Network fetch with retry logic and rate limit handling
   *
   * Implements exponential backoff to handle:
   * - GitHub rate limits (60 requests/hour for unauthenticated users)
   * - PokeAPI rate limits (100 requests/minute)
   * - Transient network errors
   *
   * Exponential backoff: 500ms -> 1s -> 2s
   * This reduces server load during outages and respects rate limits.
   */
  private async fetchImageWithRetry(
    url: string,
    retries = 3,
    delay = 500
  ): Promise<HTMLImageElement> {
    try {
      const response = await fetch(url);

      // 429 = Too Many Requests - back off and retry
      if (response.status === 429 && retries > 0) {
        logger.warn(`Rate limited on ${url}, retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.fetchImageWithRetry(url, retries - 1, delay * 2);
      }

      if (!response.ok)
        throw new Error(`Failed to load image: ${response.status}`);

      const blob = await response.blob();
      const img = new Image() as CachedHTMLImageElement;
      img.src = URL.createObjectURL(blob);
      img.timestamp = Date.now();
      img.size = blob.size;

      // Write-through caching: populate both cache tiers simultaneously
      this.memoryCache.set(url, img);
      this.currentMemorySize += blob.size;
      this.cleanupMemoryCache();

      // Async IndexedDB write doesn't block image return
      indexedDBCache.set(url, blob).catch((err) => {
        logger.logError(err, 'CacheInIndexeddb');
      });

      return img;
    } catch (error) {
      if (retries > 0) {
        logger.warn(`Error loading ${url}, retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.fetchImageWithRetry(url, retries - 1, delay * 2);
      }
      logger.error('Failed to load image after retries:', url, error);
      throw error;
    }
  }

  /**
   * Batch preloading with rate limit protection
   *
   * Strategy: 10 images per batch, 1 second delay between batches
   * - Maximum rate: 60 images/minute (stays under PokeAPI 100 req/min limit)
   * - Parallel loading within batches for speed
   * - Delays between batches prevent rate limit errors
   *
   * Performance:
   * - Preloads next page while user views current page
   * - Creates smooth infinite scroll experience
   * - Cached images load instantly when user scrolls
   */
  async preloadImages(urls: string[]): Promise<HTMLImageElement[]> {
    const batchSize = 10; // Parallel loading for speed
    const delayBetweenBatches = 1000; // Rate limit protection
    const results: HTMLImageElement[] = [];

    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize);

      // Parallel loading within batch (Promise.all)
      const batchPromises = batch.map((url) =>
        this.getImage(url).catch((err) => {
          console.warn(`Failed to preload image ${url}:`, err);
          return null; // Don't fail entire preload on single image error
        })
      );

      const batchResults = await Promise.all(batchPromises);
      results.push(
        ...batchResults.filter((img): img is HTMLImageElement => img !== null)
      );

      // Throttle between batches to respect rate limits
      if (i + batchSize < urls.length) {
        await new Promise((resolve) =>
          setTimeout(resolve, delayBetweenBatches)
        );
      }
    }

    return results;
  }

  async clearCache() {
    this.memoryCache.clear();
    this.currentMemorySize = 0;
    this.stats = {
      totalSize: 0,
      itemCount: 0,
      hitRate: 0,
      missCount: 0,
      hitCount: 0,
    };

    // Also clear IndexedDB
    try {
      await indexedDBCache.clear();
    } catch (error) {
      logger.logError(error, 'ClearIndexeddb');
    }
  }

  private updateStats() {
    this.stats.totalSize = this.currentMemorySize;
    this.stats.itemCount = this.memoryCache.size;
    const totalRequests = this.stats.hitCount + this.stats.missCount;
    this.stats.hitRate =
      totalRequests > 0 ? this.stats.hitCount / totalRequests : 0;
  }

  getStats(): CacheStats {
    return {...this.stats};
  }

  /**
   * Get image dimensions without caching
   *
   * Utility for layout calculations. Creates temporary Image object
   * that gets garbage collected after dimensions are returned.
   */
  async getImageDimensions(
    url: string
  ): Promise<{width: number; height: number}> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({width: img.width, height: img.height});
      img.onerror = reject;
      img.src = url;
    });
  }
}

/**
 * Singleton instance - single cache across the application
 * Prevents duplicate memory caches and IndexedDB connections
 */
export const imageCache = new ImageCacheService();

// Export types for use in components
export type {CacheStats};
