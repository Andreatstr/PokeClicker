import {indexedDBCache} from './indexedDBCache';

interface CacheStats {
  totalSize: number;
  itemCount: number;
  hitRate: number;
  missCount: number;
  hitCount: number;
}

interface CachedHTMLImageElement extends HTMLImageElement {
  timestamp?: number;
  size?: number;
}

class ImageCacheService {
  private memoryCache = new Map<string, CachedHTMLImageElement>();
  private maxMemorySize = 50 * 1024 * 1024; // 50MB
  private currentMemorySize = 0;
  private stats: CacheStats = {
    totalSize: 0,
    itemCount: 0,
    hitRate: 0,
    missCount: 0,
    hitCount: 0,
  };

  constructor() {
    // Initialize IndexedDB cleanup on startup
    this.initCleanup();
  }

  private async initCleanup() {
    try {
      await indexedDBCache.cleanup();
    } catch (error) {
      console.warn('Failed to cleanup IndexedDB:', error);
    }
  }


  private cleanupMemoryCache() {
    if (this.currentMemorySize <= this.maxMemorySize) return;

    // Remove oldest entries
    const entries = Array.from(this.memoryCache.entries());
    entries.sort((a, b) => {
      const aTime = a[1].timestamp || 0;
      const bTime = b[1].timestamp || 0;
      return aTime - bTime;
    });

    const toRemove = entries.slice(0, Math.floor(entries.length * 0.3));
    toRemove.forEach(([key]) => {
      this.memoryCache.delete(key);
    });

    this.currentMemorySize = 0;
    this.memoryCache.forEach((img) => {
      this.currentMemorySize += img.size || 0;
    });
  }


  async getImage(url: string): Promise<HTMLImageElement> {
    // Check memory cache first
    if (this.memoryCache.has(url)) {
      this.stats.hitCount++;
      this.updateStats();
      return this.memoryCache.get(url)!;
    }

    // Check IndexedDB cache
    try {
      const cachedBlob = await indexedDBCache.get(url);
      if (cachedBlob) {
        this.stats.hitCount++;
        this.updateStats();

        const img = new Image() as CachedHTMLImageElement;
        img.src = URL.createObjectURL(cachedBlob);
        img.timestamp = Date.now();
        img.size = cachedBlob.size;

        // Cache in memory for faster subsequent access
        this.memoryCache.set(url, img);
        this.currentMemorySize += cachedBlob.size;
        this.cleanupMemoryCache();

        return img;
      }
    } catch (error) {
      console.warn('IndexedDB cache miss:', error);
    }

    // Load from network with retry logic for rate limiting
    this.stats.missCount++;
    this.updateStats();

    return this.fetchImageWithRetry(url);
  }

  private async fetchImageWithRetry(
    url: string,
    retries = 3,
    delay = 500
  ): Promise<HTMLImageElement> {
    try {
      const response = await fetch(url);
      
      // Handle rate limiting (429) with exponential backoff
      if (response.status === 429 && retries > 0) {
        console.warn(`Rate limited on ${url}, retrying in ${delay}ms...`);
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

      // Cache in memory
      this.memoryCache.set(url, img);
      this.currentMemorySize += blob.size;
      this.cleanupMemoryCache();

      // Cache in IndexedDB for persistence
      indexedDBCache.set(url, blob).catch((err) => {
        console.warn('Failed to cache in IndexedDB:', err);
      });

      return img;
    } catch (error) {
      if (retries > 0) {
        console.warn(`Error loading ${url}, retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.fetchImageWithRetry(url, retries - 1, delay * 2);
      }
      console.error('Failed to load image after retries:', url, error);
      throw error;
    }
  }

  async preloadImages(urls: string[]): Promise<HTMLImageElement[]> {
    // Rate limit: Process sequentially with 500ms delay to avoid GitHub rate limits
    const delayBetweenRequests = 500;
    const results: HTMLImageElement[] = [];

    for (let i = 0; i < urls.length; i++) {
      try {
        const img = await this.getImage(urls[i]);
        results.push(img);
      } catch (error) {
        console.warn(`Failed to preload image ${urls[i]}:`, error);
        // Continue with other images even if one fails
      }

      // Delay between requests (except for the last request)
      if (i < urls.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayBetweenRequests));
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
      console.warn('Failed to clear IndexedDB:', error);
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

  // Utility method to get image dimensions without loading
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

// Export singleton instance
export const imageCache = new ImageCacheService();

// Export types for use in components
export type {CacheStats};
