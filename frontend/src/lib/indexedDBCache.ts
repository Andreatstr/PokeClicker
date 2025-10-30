import {logger} from '@/lib/logger';

/**
 * IndexedDB wrapper for caching image blobs
 * Provides persistent storage that survives page refreshes
 */

const DB_NAME = 'PokemonImageCache';
const DB_VERSION = 1;
const STORE_NAME = 'images';
const MAX_CACHE_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

interface CachedImage {
  url: string;
  blob: Blob;
  timestamp: number;
  size: number;
}

class IndexedDBCache {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  /**
   * Initialize the IndexedDB database
   */
  private async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        logger.logError(request.error, 'OpenIndexedDB');
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, {
            keyPath: 'url',
          });
          objectStore.createIndex('timestamp', 'timestamp', {unique: false});
        }
      };
    });

    return this.initPromise;
  }

  /**
   * Get an image blob from cache
   */
  async get(url: string): Promise<Blob | null> {
    await this.init();
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(url);

      request.onsuccess = () => {
        const result = request.result as CachedImage | undefined;

        if (!result) {
          resolve(null);
          return;
        }

        // Check if cache entry is too old
        const age = Date.now() - result.timestamp;
        if (age > MAX_CACHE_AGE) {
          // Delete expired entry
          this.delete(url);
          resolve(null);
          return;
        }

        resolve(result.blob);
      };

      request.onerror = () => {
        logger.logError(request.error, 'GetFromIndexedDB');
        reject(request.error);
      };
    });
  }

  /**
   * Store an image blob in cache
   */
  async set(url: string, blob: Blob): Promise<void> {
    await this.init();
    if (!this.db) return;

    const cachedImage: CachedImage = {
      url,
      blob,
      timestamp: Date.now(),
      size: blob.size,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(cachedImage);

      request.onsuccess = () => resolve();
      request.onerror = () => {
        logger.logError(request.error, 'SetInIndexedDB');
        reject(request.error);
      };
    });
  }

  /**
   * Delete an entry from cache
   */
  async delete(url: string): Promise<void> {
    await this.init();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(url);

      request.onsuccess = () => resolve();
      request.onerror = () => {
        logger.logError(request.error, 'DeleteFromIndexedDB');
        reject(request.error);
      };
    });
  }

  /**
   * Clear all cached images
   */
  async clear(): Promise<void> {
    await this.init();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => {
        logger.logError(request.error, 'ClearIndexedDB');
        reject(request.error);
      };
    });
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{count: number; totalSize: number}> {
    await this.init();
    if (!this.db) return {count: 0, totalSize: 0};

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const items = request.result as CachedImage[];
        const count = items.length;
        const totalSize = items.reduce((sum, item) => sum + item.size, 0);
        resolve({count, totalSize});
      };

      request.onerror = () => {
        logger.logError(request.error, 'GetStatsFromIndexedDB');
        reject(request.error);
      };
    });
  }

  /**
   * Clean up old cache entries
   */
  async cleanup(): Promise<void> {
    await this.init();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('timestamp');
      const request = index.openCursor();

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest)
          .result as IDBCursorWithValue;

        if (cursor) {
          const item = cursor.value as CachedImage;
          const age = Date.now() - item.timestamp;

          if (age > MAX_CACHE_AGE) {
            cursor.delete();
          }

          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = () => {
        logger.logError(request.error, 'CleanupIndexedDB');
        reject(request.error);
      };
    });
  }
}

// Export singleton instance
export const indexedDBCache = new IndexedDBCache();
