import { imageCache } from './imageCache';

interface PokemonSpriteUrls {
  officialArtwork: string;
  frontDefault: string;
  backDefault: string;
  frontShiny: string;
  backShiny: string;
}

class PokemonSpriteCache {
  private baseUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';
  private officialArtworkUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';
  
  // Cache for sprite URLs to avoid repeated URL construction
  private spriteUrlCache = new Map<number, PokemonSpriteUrls>();

  private getSpriteUrls(pokemonId: number): PokemonSpriteUrls {
    if (this.spriteUrlCache.has(pokemonId)) {
      return this.spriteUrlCache.get(pokemonId)!;
    }

    const urls: PokemonSpriteUrls = {
      officialArtwork: `${this.officialArtworkUrl}/${pokemonId}.png`,
      frontDefault: `${this.baseUrl}/${pokemonId}.png`,
      backDefault: `${this.baseUrl}/back/${pokemonId}.png`,
      frontShiny: `${this.baseUrl}/shiny/${pokemonId}.png`,
      backShiny: `${this.baseUrl}/back/shiny/${pokemonId}.png`,
    };

    this.spriteUrlCache.set(pokemonId, urls);
    return urls;
  }

  async getPokemonSprite(pokemonId: number, variant: keyof PokemonSpriteUrls = 'officialArtwork'): Promise<HTMLImageElement> {
    const urls = this.getSpriteUrls(pokemonId);
    const url = urls[variant];
    
    try {
      return await imageCache.getImage(url);
    } catch (error) {
      console.error(`Failed to load Pokemon sprite for ID ${pokemonId}, variant ${variant}:`, error);
      throw error;
    }
  }

  async preloadPokemonSprites(pokemonIds: number[], variant: keyof PokemonSpriteUrls = 'officialArtwork'): Promise<HTMLImageElement[]> {
    const urls = pokemonIds.map(id => this.getSpriteUrls(id)[variant]);
    return imageCache.preloadImages(urls);
  }

  async preloadPokemonEvolutionChain(pokemonIds: number[]): Promise<void> {
    const allUrls: string[] = [];
    
    pokemonIds.forEach(id => {
      const urls = this.getSpriteUrls(id);
      allUrls.push(
        urls.officialArtwork,
        urls.frontDefault,
        urls.frontShiny
      );
    });

    await imageCache.preloadImages(allUrls);
  }

  // Preload common Pokemon sprites (first 50 Pokemon)
  async preloadCommonPokemon(): Promise<void> {
    const commonIds = Array.from({ length: 50 }, (_, i) => i + 1);
    await this.preloadPokemonSprites(commonIds, 'officialArtwork');
  }

  // Preload Pokemon sprites for a specific range
  async preloadPokemonRange(startId: number, endId: number): Promise<void> {
    const ids = Array.from({ length: endId - startId + 1 }, (_, i) => startId + i);
    await this.preloadPokemonSprites(ids, 'officialArtwork');
  }

  // Get cached sprite URL without loading the image
  getPokemonSpriteUrl(pokemonId: number, variant: keyof PokemonSpriteUrls = 'officialArtwork'): string {
    return this.getSpriteUrls(pokemonId)[variant];
  }

  // Clear Pokemon-specific cache
  clearPokemonCache(): void {
    this.spriteUrlCache.clear();
  }

  // Get cache statistics
  getCacheStats() {
    return imageCache.getStats();
  }
}

// Export singleton instance
export const pokemonSpriteCache = new PokemonSpriteCache();

// Export types
export type { PokemonSpriteUrls };
