import {imageCache} from './imageCache';

interface TypeBackgroundUrls {
  [type: string]: string;
}

class TypeBackgroundCache {
  private baseUrl = `${import.meta.env.BASE_URL}pokemon-type-bg`;
  private typeBackgrounds: TypeBackgroundUrls = {};
  private preloadedTypes = new Set<string>();

  private getTypeBackgroundUrl(type: string): string {
    if (this.typeBackgrounds[type]) {
      return this.typeBackgrounds[type];
    }

    const url = `${this.baseUrl}/${type}.webp`;
    this.typeBackgrounds[type] = url;
    return url;
  }

  async getTypeBackground(type: string): Promise<HTMLImageElement> {
    const url = this.getTypeBackgroundUrl(type);

    try {
      return await imageCache.getImage(url);
    } catch (error) {
      console.error(`Failed to load type background for ${type}:`, error);
      // Fallback to unknown type background
      const fallbackUrl = `${this.baseUrl}/unknown.webp`;
      return imageCache.getImage(fallbackUrl);
    }
  }

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

  async preloadTypeBackgrounds(types: string[]): Promise<void> {
    const urls = types.map((type) => this.getTypeBackgroundUrl(type));
    await imageCache.preloadImages(urls);

    types.forEach((type) => this.preloadedTypes.add(type));
  }

  // Preload common Pokemon types
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

  // Get cached background URL without loading the image
  getCachedTypeBackgroundUrl(type: string): string {
    return this.getTypeBackgroundUrl(type);
  }

  // Check if a type background is preloaded
  isTypePreloaded(type: string): boolean {
    return this.preloadedTypes.has(type);
  }

  // Get all preloaded types
  getPreloadedTypes(): string[] {
    return Array.from(this.preloadedTypes);
  }

  // Clear type-specific cache
  clearTypeCache(): void {
    this.typeBackgrounds = {};
    this.preloadedTypes.clear();
  }

  // Get cache statistics
  getCacheStats() {
    return imageCache.getStats();
  }
}

// Export singleton instance
export const typeBackgroundCache = new TypeBackgroundCache();

// Export types
export type {TypeBackgroundUrls};
