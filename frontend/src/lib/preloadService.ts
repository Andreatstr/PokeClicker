import {pokemonSpriteCache} from './pokemonSpriteCache';
import {typeBackgroundCache} from './typeBackgroundCache';
import {gameAssetsCache} from './gameAssetsCache';

interface PreloadOptions {
  preloadCommonPokemon?: boolean;
  preloadCommonTypes?: boolean;
  preloadGameAssets?: boolean;
  preloadMapAssets?: boolean;
  pokemonRange?: {start: number; end: number};
  specificTypes?: string[];
}

class PreloadService {
  private isPreloading = false;
  private preloadProgress = 0;
  private preloadCallbacks: Array<(progress: number) => void> = [];

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
    this.preloadCallbacks.forEach(callback => callback(progress));
  }

  async preloadAll(options: PreloadOptions = {}): Promise<void> {
    if (this.isPreloading) {
      console.warn('Preloading already in progress');
      return;
    }

    this.isPreloading = true;
    this.updateProgress(0);

    try {
      const tasks: Array<() => Promise<void>> = [];
      let totalTasks = 0;

      // Preload common Pokemon (first 50)
      if (options.preloadCommonPokemon !== false) {
        tasks.push(async () => {
          await pokemonSpriteCache.preloadCommonPokemon();
          this.updateProgress(20);
        });
        totalTasks++;
      }

      // Preload common types
      if (options.preloadCommonTypes !== false) {
        tasks.push(async () => {
          await typeBackgroundCache.preloadCommonTypes();
          this.updateProgress(40);
        });
        totalTasks++;
      }

      // Preload game assets
      if (options.preloadGameAssets !== false) {
        tasks.push(async () => {
          await gameAssetsCache.preloadClickerAssets();
          this.updateProgress(60);
        });
        totalTasks++;
      }

      // Preload map assets
      if (options.preloadMapAssets !== false) {
        tasks.push(async () => {
          await gameAssetsCache.preloadMapAssets();
          this.updateProgress(80);
        });
        totalTasks++;
      }

      // Preload specific Pokemon range
      if (options.pokemonRange) {
        tasks.push(async () => {
          await pokemonSpriteCache.preloadPokemonRange(
            options.pokemonRange!.start,
            options.pokemonRange!.end
          );
        });
        totalTasks++;
      }

      // Preload specific types
      if (options.specificTypes && options.specificTypes.length > 0) {
        tasks.push(async () => {
          await typeBackgroundCache.preloadTypeBackgrounds(options.specificTypes!);
        });
        totalTasks++;
      }

      // Execute all tasks
      await Promise.all(tasks.map(task => task()));

      this.updateProgress(100);
      console.log('All assets preloaded successfully');
    } catch (error) {
      console.error('Failed to preload assets:', error);
      throw error;
    } finally {
      this.isPreloading = false;
    }
  }

  async preloadForPokedex(): Promise<void> {
    await this.preloadAll({
      preloadCommonPokemon: true,
      preloadCommonTypes: true,
      preloadGameAssets: false,
      preloadMapAssets: false,
    });
  }

  async preloadForClicker(): Promise<void> {
    await this.preloadAll({
      preloadCommonPokemon: false,
      preloadCommonTypes: false,
      preloadGameAssets: true,
      preloadMapAssets: false,
    });
  }

  async preloadForMap(): Promise<void> {
    await this.preloadAll({
      preloadCommonPokemon: false,
      preloadCommonTypes: false,
      preloadGameAssets: false,
      preloadMapAssets: true,
    });
  }

  async preloadPokemonEvolutionChain(pokemonIds: number[]): Promise<void> {
    await pokemonSpriteCache.preloadPokemonEvolutionChain(pokemonIds);
  }

  async preloadPokemonTypes(types: string[]): Promise<void> {
    await typeBackgroundCache.preloadTypeBackgrounds(types);
  }

  getProgress(): number {
    return this.preloadProgress;
  }

  isPreloadingInProgress(): boolean {
    return this.isPreloading;
  }

  // Get cache statistics from all services
  getCacheStats() {
    return {
      pokemonSprites: pokemonSpriteCache.getCacheStats(),
      typeBackgrounds: typeBackgroundCache.getCacheStats(),
      gameAssets: gameAssetsCache.getCacheStats(),
    };
  }

  // Clear all caches
  clearAllCaches(): void {
    pokemonSpriteCache.clearPokemonCache();
    typeBackgroundCache.clearTypeCache();
    gameAssetsCache.clearGameAssetsCache();
  }
}

// Export singleton instance
export const preloadService = new PreloadService();

// Export types
export type { PreloadOptions };
