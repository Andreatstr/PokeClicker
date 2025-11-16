/**
 * Game Assets Cache
 *
 * Manages caching for game-specific assets used in the clicker and map features.
 * Separates game assets from Pokemon sprites for better organization and preloading control.
 *
 * Asset Categories:
 * 1. Clicker Game: Wishiwashi-Solo sprite, candy image, rare candy icon, background
 * 2. Map Feature: Ash sprite, map background, collision map
 * 3. Rankings: Rare candy icon, candy image
 *
 * Preloading Strategy:
 * - Feature-specific preload methods (preloadClickerAssets, preloadMapAssets)
 * - Loads only assets needed for current feature to minimize initial bundle
 * - Called when user navigates to specific features (lazy loading)
 *
 * Asset Sources:
 * - Local files (public/ directory): Fast, bundled with app
 * - PokeAPI GitHub CDN: Wishiwashi-Solo sprite, rare candy icon
 * - Mixed strategy balances bundle size vs external dependencies
 *
 * Performance:
 * - Small WebP images for fast loading (~200KB total for clicker assets)
 * - Collision map loaded only when entering map feature
 * - Leverages imageCache two-tier system for persistence
 */

import {imageCache} from './imageCache';

interface GameAssetUrls {
  wishiwashiSprite: string;
  candyImage: string;
  rareCandyIcon: string;
  pokemonBackground: string;
  ashSprite: string;
  mapBackground: string;
  collisionMap: string;
}

class GameAssetsCache {
  private baseUrl = import.meta.env.BASE_URL;
  private gameAssets: Partial<GameAssetUrls> = {};
  // Tracks which assets have been preloaded to avoid redundant loads
  private preloadedAssets = new Set<string>();

  private getGameAssetUrls(): GameAssetUrls {
    if (Object.keys(this.gameAssets).length === 0) {
      this.gameAssets = {
        wishiwashiSprite:
          'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/746.png',
        candyImage: `${this.baseUrl}candy.webp`,
        rareCandyIcon:
          'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/rare-candy.png',
        pokemonBackground: `${this.baseUrl}pokemon-bg.webp`,
        ashSprite: `${this.baseUrl}AshKetchumSprite.webp`,
        mapBackground: `${this.baseUrl}map.webp`,
        collisionMap: `${this.baseUrl}map-collision.webp`,
      };
    }
    return this.gameAssets as GameAssetUrls;
  }

  async getWishiWashiSprite(): Promise<HTMLImageElement> {
    const urls = this.getGameAssetUrls();
    return imageCache.getImage(urls.wishiwashiSprite);
  }

  async getCandyImage(): Promise<HTMLImageElement> {
    const urls = this.getGameAssetUrls();
    return imageCache.getImage(urls.candyImage);
  }

  async getRareCandyIcon(): Promise<HTMLImageElement> {
    const urls = this.getGameAssetUrls();
    return imageCache.getImage(urls.rareCandyIcon);
  }

  async getPokemonBackground(): Promise<HTMLImageElement> {
    const urls = this.getGameAssetUrls();
    return imageCache.getImage(urls.pokemonBackground);
  }

  async getAshSprite(): Promise<HTMLImageElement> {
    const urls = this.getGameAssetUrls();
    return imageCache.getImage(urls.ashSprite);
  }

  async getMapBackground(): Promise<HTMLImageElement> {
    const urls = this.getGameAssetUrls();
    return imageCache.getImage(urls.mapBackground);
  }

  async getCollisionMap(): Promise<HTMLImageElement> {
    const urls = this.getGameAssetUrls();
    return imageCache.getImage(urls.collisionMap);
  }

  /**
   * Preload all game assets
   *
   * Total size: ~500KB (all 7 assets)
   * Use case: Offline PWA or ensuring all features work without network
   */
  async preloadAllGameAssets(): Promise<void> {
    const urls = this.getGameAssetUrls();
    const assetUrls = Object.values(urls);

    await imageCache.preloadImages(assetUrls);

    Object.keys(urls).forEach((asset) => this.preloadedAssets.add(asset));
  }

  /**
   * Preload clicker game assets
   *
   * Size: ~200KB (4 assets)
   * Called when user enters clicker feature for instant visual feedback.
   * Wishiwashi sprite is critical for the clicking interaction.
   */
  async preloadClickerAssets(): Promise<void> {
    const urls = this.getGameAssetUrls();
    const clickerAssets = [
      urls.wishiwashiSprite,
      urls.candyImage,
      urls.rareCandyIcon,
      urls.pokemonBackground,
    ];

    await imageCache.preloadImages(clickerAssets);

    [
      'wishiwashiSprite',
      'candyImage',
      'rareCandyIcon',
      'pokemonBackground',
    ].forEach((asset) => {
      this.preloadedAssets.add(asset);
    });
  }

  /**
   * Preload map feature assets
   *
   * Size: ~300KB (3 assets, map background is largest)
   * Called when user navigates to map feature.
   * Collision map is critical for movement physics.
   */
  async preloadMapAssets(): Promise<void> {
    const urls = this.getGameAssetUrls();
    const mapAssets = [urls.ashSprite, urls.mapBackground, urls.collisionMap];

    await imageCache.preloadImages(mapAssets);

    ['ashSprite', 'mapBackground', 'collisionMap'].forEach((asset) => {
      this.preloadedAssets.add(asset);
    });
  }

  /**
   * Preload rankings page assets
   *
   * Size: ~50KB (2 small icons)
   * Called when user views leaderboard/rankings.
   * Minimal size allows aggressive preloading.
   */
  async preloadRanksAssets(): Promise<void> {
    const urls = this.getGameAssetUrls();
    const ranksAssets = [urls.rareCandyIcon, urls.candyImage];

    await imageCache.preloadImages(ranksAssets);

    ['rareCandyIcon', 'candyImage'].forEach((asset) => {
      this.preloadedAssets.add(asset);
    });
  }

  /**
   * Get asset URL without loading
   *
   * For components that manage their own loading or use img src directly
   */
  getGameAssetUrl(assetName: keyof GameAssetUrls): string {
    return this.getGameAssetUrls()[assetName];
  }

  /**
   * Check if asset has been preloaded
   *
   * Useful for conditional rendering or loading state management
   */
  isAssetPreloaded(assetName: string): boolean {
    return this.preloadedAssets.has(assetName);
  }

  getPreloadedAssets(): string[] {
    return Array.from(this.preloadedAssets);
  }

  /**
   * Clear URL cache and preload tracking
   * Note: Doesn't clear actual images (use imageCache.clearCache for that)
   */
  clearGameAssetsCache(): void {
    this.gameAssets = {};
    this.preloadedAssets.clear();
  }

  getCacheStats() {
    return imageCache.getStats();
  }
}

/**
 * Singleton instance - centralized game asset management
 */
export const gameAssetsCache = new GameAssetsCache();

// Export types
export type {GameAssetUrls};
