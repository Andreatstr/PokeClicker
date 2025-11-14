/**
 * IndexedDB Image Cache
 *
 * Provides persistent browser storage for image blobs using IndexedDB.
 * Unlike in-memory caches, this survives page refreshes and browser restarts.
 *
 * Storage Strategy:
 * - Stores raw Blob objects (binary data) rather than base64 (more efficient)
 * - Uses URL as primary key for O(1) lookups
 * - Tracks timestamp for automatic expiration after 7 days
 * - Monitors blob size for cache statistics and cleanup decisions
 *
 * Performance Benefits:
 * - Eliminates network requests for cached images across sessions
 * - Faster than localStorage (no 5-10MB limits, no string serialization)
 * - Asynchronous API doesn't block main thread
 */

import {logger} from '@/lib/logger';

const DB_NAME = 'PokemonImageCache';
const DB_VERSION = 1;
const STORE_NAME = 'images';
const MAX_CACHE_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days - balances freshness vs storage

interface CachedImage {
  url: string;
  blob: Blob;
  timestamp: number;
  size: number;
}

class IndexedDBCache {
  private db: IDBDatabase | null = null;
  // Singleton pattern: ensures only one initialization happens even with concurrent calls
  private initPromise: Promise<void> | null = null;

  /**
   * Initialize the IndexedDB database
   *
   * Lazy initialization: DB is only opened when first needed, not on import.
   * This avoids blocking app startup and handles environments without IndexedDB.
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

        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, {
            keyPath: 'url', // URL serves as unique identifier for each image
          });
          // Index on timestamp enables efficient cleanup queries
          objectStore.createIndex('timestamp', 'timestamp', {unique: false});
        }
      };
    });

    return this.initPromise;
  }

  /**
   * Get an image blob from cache
   *
   * Implements automatic cache invalidation: expired entries are deleted
   * on read to prevent serving stale images. This is simpler than background
   * cleanup jobs and ensures users always get fresh content.
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

        // Age-based invalidation ensures stale content is automatically purged
        const age = Date.now() - result.timestamp;
        if (age > MAX_CACHE_AGE) {
          this.delete(url); // Opportunistic cleanup on cache miss
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
   *
   * Batch cleanup operation using cursor iteration. Called on app startup
   * to proactively free storage space. Uses the timestamp index for efficient
   * scanning without loading all entries into memory.
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
            cursor.delete(); // In-place deletion during iteration
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

/**
 * Singleton instance - ensures single database connection across the app
 * Prevents connection overhead and potential race conditions
 */
export const indexedDBCache = new IndexedDBCache();
