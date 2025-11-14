/**
 * Asset Preloading Service
 * Coordinates preloading of images and resources to improve performance
 * Supports progress tracking and selective preloading by feature
 */

import {pokemonSpriteCache} from './pokemonSpriteCache';
import {typeBackgroundCache} from './typeBackgroundCache';
import {gameAssetsCache} from './gameAssetsCache';
import {logger} from '@/lib/logger';

interface PreloadOptions {
  preloadCommonPokemon?: boolean;
  preloadCommonTypes?: boolean;
  preloadGameAssets?: boolean;
  preloadMapAssets?: boolean;
  preloadRanksAssets?: boolean;
  pokemonRange?: {start: number; end: number};
  specificTypes?: string[];
}

class PreloadService {
  private isPreloading = false;
  private preloadProgress = 0;
  private preloadCallbacks: Array<(progress: number) => void> = [];

  /**
   * Subscribe to preload progress updates
   * @param callback - Function called with progress (0-100)
   * @returns Unsubscribe function
   */
  onProgress(callback: (progress: number) => void) {
    this.preloadCallbacks.push(callback);
    return () => {
      const index = this.preloadCallbacks.indexOf(callback);
      if (index > -1) {
        this.preloadCallbacks.splice(index, 1);
      }
    };
  }

  private updateProgress(progress: number) {
    this.preloadProgress = progress;
    this.preloadCallbacks.forEach((callback) => callback(progress));
  }

  /**
   * Preload assets based on provided options
   * Runs tasks in parallel for better performance
   * @param options - Configuration for which assets to preload
   */
  async preloadAll(options: PreloadOptions = {}): Promise<void> {
    if (this.isPreloading) {
      logger.warn('Preloading already in progress');
      return;
    }

    this.isPreloading = true;
    this.updateProgress(0);

    try {
      const tasks: Array<() => Promise<void>> = [];

      // Preload common Pokemon (first 50)
      if (options.preloadCommonPokemon !== false) {
        tasks.push(async () => {
          await pokemonSpriteCache.preloadCommonPokemon();
          this.updateProgress(20);
        });
      }

      // Preload common types
      if (options.preloadCommonTypes !== false) {
        tasks.push(async () => {
          await typeBackgroundCache.preloadCommonTypes();
          this.updateProgress(40);
        });
      }

      // Preload game assets
      if (options.preloadGameAssets !== false) {
        tasks.push(async () => {
          await gameAssetsCache.preloadClickerAssets();
          this.updateProgress(60);
        });
      }

      // Preload map assets
      if (options.preloadMapAssets !== false) {
        tasks.push(async () => {
          await gameAssetsCache.preloadMapAssets();
          this.updateProgress(80);
        });
      }

      // Preload ranks assets
      if (options.preloadRanksAssets) {
        tasks.push(async () => {
          await gameAssetsCache.preloadRanksAssets();
          this.updateProgress(90);
        });
      }

      // Preload specific Pokemon range
      if (options.pokemonRange) {
        tasks.push(async () => {
          await pokemonSpriteCache.preloadPokemonRange(
            options.pokemonRange!.start,
            options.pokemonRange!.end
          );
        });
      }

      // Preload specific types
      if (options.specificTypes && options.specificTypes.length > 0) {
        tasks.push(async () => {
          await typeBackgroundCache.preloadTypeBackgrounds(
            options.specificTypes!
          );
        });
      }

      // Execute all tasks
      await Promise.all(tasks.map((task) => task()));

      this.updateProgress(100);
      logger.info('All assets preloaded successfully');
    } catch (error) {
      logger.logError(error, 'PreloadAssets');
      throw error;
    } finally {
      this.isPreloading = false;
    }
  }

  /**
   * Preload assets needed for Pokedex feature
   * Loads first page of Pokemon and common type backgrounds
   */
  async preloadForPokedex(): Promise<void> {
    // Preload first page (20 Pokemon) + type backgrounds
    // Batched loading prevents rate limits while improving sustainability
    await this.preloadAll({
      preloadCommonPokemon: true,
      preloadCommonTypes: true,
      preloadGameAssets: false,
      preloadMapAssets: false,
      preloadRanksAssets: false,
    });
  }

  /**
   * Preload assets needed for Clicker game feature
   */
  async preloadForClicker(): Promise<void> {
    await this.preloadAll({
      preloadCommonPokemon: false,
      preloadCommonTypes: false,
      preloadGameAssets: true,
      preloadMapAssets: false,
      preloadRanksAssets: false,
    });
  }

  /**
   * Preload assets needed for Map feature
   */
  async preloadForMap(): Promise<void> {
    await this.preloadAll({
      preloadCommonPokemon: false,
      preloadCommonTypes: false,
      preloadGameAssets: false,
      preloadMapAssets: true,
      preloadRanksAssets: false,
    });
  }

  /**
   * Preload assets needed for Ranks/Leaderboard feature
   */
  async preloadForRanks(): Promise<void> {
    await this.preloadAll({
      preloadCommonPokemon: false,
      preloadCommonTypes: false,
      preloadGameAssets: false,
      preloadMapAssets: false,
      preloadRanksAssets: true,
    });
  }

  /**
   * Preload Pokemon sprites for an evolution chain
   * Used when viewing Pokemon details to prefetch evolutions
   */
  async preloadPokemonEvolutionChain(pokemonIds: number[]): Promise<void> {
    await pokemonSpriteCache.preloadPokemonEvolutionChain(pokemonIds);
  }

  /**
   * Preload type background images for specific Pokemon types
   */
  async preloadPokemonTypes(types: string[]): Promise<void> {
    await typeBackgroundCache.preloadTypeBackgrounds(types);
  }

  /**
   * Get current preload progress percentage (0-100)
   */
  getProgress(): number {
    return this.preloadProgress;
  }

  /**
   * Check if preloading is currently in progress
   */
  isPreloadingInProgress(): boolean {
    return this.isPreloading;
  }

  /**
   * Get cache statistics from all cache services
   * Useful for debugging and monitoring cache performance
   */
  getCacheStats() {
    return {
      pokemonSprites: pokemonSpriteCache.getCacheStats(),
      typeBackgrounds: typeBackgroundCache.getCacheStats(),
      gameAssets: gameAssetsCache.getCacheStats(),
    };
  }

  /**
   * Clear all cached assets
   * Used when cache needs to be invalidated (e.g., after updates)
   */
  clearAllCaches(): void {
    pokemonSpriteCache.clearPokemonCache();
    typeBackgroundCache.clearTypeCache();
    gameAssetsCache.clearGameAssetsCache();
  }
}

// Export singleton instance
export const preloadService = new PreloadService();

// Export types
export type {PreloadOptions};
