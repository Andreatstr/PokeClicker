import {imageCache} from './imageCache';

interface GameAssetUrls {
  charizardSprite: string;
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
  private preloadedAssets = new Set<string>();

  private getGameAssetUrls(): GameAssetUrls {
    if (Object.keys(this.gameAssets).length === 0) {
      this.gameAssets = {
        charizardSprite:
          'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png',
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

  async getCharizardSprite(): Promise<HTMLImageElement> {
    const urls = this.getGameAssetUrls();
    return imageCache.getImage(urls.charizardSprite);
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

  async preloadAllGameAssets(): Promise<void> {
    const urls = this.getGameAssetUrls();
    const assetUrls = Object.values(urls);

    await imageCache.preloadImages(assetUrls);

    Object.keys(urls).forEach((asset) => this.preloadedAssets.add(asset));
  }

  async preloadClickerAssets(): Promise<void> {
    const urls = this.getGameAssetUrls();
    const clickerAssets = [
      urls.charizardSprite,
      urls.candyImage,
      urls.rareCandyIcon,
      urls.pokemonBackground,
    ];

    await imageCache.preloadImages(clickerAssets);

    [
      'charizardSprite',
      'candyImage',
      'rareCandyIcon',
      'pokemonBackground',
    ].forEach((asset) => {
      this.preloadedAssets.add(asset);
    });
  }

  async preloadMapAssets(): Promise<void> {
    const urls = this.getGameAssetUrls();
    const mapAssets = [urls.ashSprite, urls.mapBackground, urls.collisionMap];

    await imageCache.preloadImages(mapAssets);

    ['ashSprite', 'mapBackground', 'collisionMap'].forEach((asset) => {
      this.preloadedAssets.add(asset);
    });
  }

  // Get cached asset URL without loading the image
  getGameAssetUrl(assetName: keyof GameAssetUrls): string {
    return this.getGameAssetUrls()[assetName];
  }

  // Check if an asset is preloaded
  isAssetPreloaded(assetName: string): boolean {
    return this.preloadedAssets.has(assetName);
  }

  // Get all preloaded assets
  getPreloadedAssets(): string[] {
    return Array.from(this.preloadedAssets);
  }

  // Clear game assets cache
  clearGameAssetsCache(): void {
    this.gameAssets = {};
    this.preloadedAssets.clear();
  }

  // Get cache statistics
  getCacheStats() {
    return imageCache.getStats();
  }
}

// Export singleton instance
export const gameAssetsCache = new GameAssetsCache();

// Export types
export type {GameAssetUrls};
