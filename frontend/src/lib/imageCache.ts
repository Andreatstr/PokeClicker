interface CachedImage {
  url: string;
  blob: Blob;
  timestamp: number;
  size: number;
}

interface CacheStats {
  totalSize: number;
  itemCount: number;
  hitRate: number;
  missCount: number;
  hitCount: number;
}

class ImageCacheService {
  private memoryCache = new Map<string, HTMLImageElement>();
  private localStorageCache = new Map<string, CachedImage>();
  private maxMemorySize = 50 * 1024 * 1024; // 50MB
  private maxLocalStorageSize = 100 * 1024 * 1024; // 100MB
  private currentMemorySize = 0;
  private currentLocalStorageSize = 0;
  private stats: CacheStats = {
    totalSize: 0,
    itemCount: 0,
    hitRate: 0,
    missCount: 0,
    hitCount: 0,
  };

  constructor() {
    this.loadFromLocalStorage();
  }

  private loadFromLocalStorage() {
    try {
      const cached = localStorage.getItem('imageCache');
      if (cached) {
        const data = JSON.parse(cached);
        this.localStorageCache = new Map(data);
        this.currentLocalStorageSize = Array.from(this.localStorageCache.values())
          .reduce((total, item) => total + item.size, 0);
      }
    } catch (error) {
      console.warn('Failed to load image cache from localStorage:', error);
      this.clearLocalStorage();
    }
  }

  private saveToLocalStorage() {
    try {
      const data = Array.from(this.localStorageCache.entries());
      localStorage.setItem('imageCache', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save image cache to localStorage:', error);
    }
  }


  private cleanupMemoryCache() {
    if (this.currentMemorySize <= this.maxMemorySize) return;

    // Remove oldest entries
    const entries = Array.from(this.memoryCache.entries());
    entries.sort((a, b) => {
      const aTime = (a[1] as any).timestamp || 0;
      const bTime = (b[1] as any).timestamp || 0;
      return aTime - bTime;
    });

    const toRemove = entries.slice(0, Math.floor(entries.length * 0.3));
    toRemove.forEach(([key]) => {
      this.memoryCache.delete(key);
    });

    this.currentMemorySize = 0;
    this.memoryCache.forEach((img) => {
      this.currentMemorySize += (img as any).size || 0;
    });
  }

  private cleanupLocalStorageCache() {
    if (this.currentLocalStorageSize <= this.maxLocalStorageSize) return;

    // Remove oldest entries
    const entries = Array.from(this.localStorageCache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

    const toRemove = entries.slice(0, Math.floor(entries.length * 0.3));
    toRemove.forEach(([key]) => {
      this.currentLocalStorageSize -= this.localStorageCache.get(key)?.size || 0;
      this.localStorageCache.delete(key);
    });

    this.saveToLocalStorage();
  }

  async getImage(url: string): Promise<HTMLImageElement> {
    // Check memory cache first
    if (this.memoryCache.has(url)) {
      this.stats.hitCount++;
      this.updateStats();
      return this.memoryCache.get(url)!;
    }

    // Check localStorage cache
    if (this.localStorageCache.has(url)) {
      const cached = this.localStorageCache.get(url)!;
      const img = new Image();
      img.src = URL.createObjectURL(cached.blob);
      (img as any).timestamp = Date.now();
      (img as any).size = cached.size;
      
      this.memoryCache.set(url, img);
      this.currentMemorySize += cached.size;
      this.cleanupMemoryCache();
      
      this.stats.hitCount++;
      this.updateStats();
      return img;
    }

    // Load from network
    this.stats.missCount++;
    this.updateStats();
    
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to load image: ${response.status}`);
      
      const blob = await response.blob();
      const img = new Image();
      img.src = URL.createObjectURL(blob);
      (img as any).timestamp = Date.now();
      (img as any).size = blob.size;

      // Cache in memory
      this.memoryCache.set(url, img);
      this.currentMemorySize += blob.size;
      this.cleanupMemoryCache();

      // Cache in localStorage
      const cachedImage: CachedImage = {
        url,
        blob,
        timestamp: Date.now(),
        size: blob.size,
      };
      
      this.localStorageCache.set(url, cachedImage);
      this.currentLocalStorageSize += blob.size;
      this.cleanupLocalStorageCache();
      this.saveToLocalStorage();

      return img;
    } catch (error) {
      console.error('Failed to load image:', url, error);
      throw error;
    }
  }

  async preloadImages(urls: string[]): Promise<HTMLImageElement[]> {
    const promises = urls.map(url => this.getImage(url));
    return Promise.all(promises);
  }

  clearCache() {
    this.memoryCache.clear();
    this.localStorageCache.clear();
    this.currentMemorySize = 0;
    this.currentLocalStorageSize = 0;
    localStorage.removeItem('imageCache');
    this.stats = {
      totalSize: 0,
      itemCount: 0,
      hitRate: 0,
      missCount: 0,
      hitCount: 0,
    };
  }

  private clearLocalStorage() {
    this.localStorageCache.clear();
    this.currentLocalStorageSize = 0;
    localStorage.removeItem('imageCache');
  }

  private updateStats() {
    this.stats.totalSize = this.currentMemorySize + this.currentLocalStorageSize;
    this.stats.itemCount = this.memoryCache.size + this.localStorageCache.size;
    const totalRequests = this.stats.hitCount + this.stats.missCount;
    this.stats.hitRate = totalRequests > 0 ? this.stats.hitCount / totalRequests : 0;
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }

  // Utility method to get image dimensions without loading
  async getImageDimensions(url: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = reject;
      img.src = url;
    });
  }
}

// Export singleton instance
export const imageCache = new ImageCacheService();

// Export types for use in components
export type { CacheStats };
