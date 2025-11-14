/**
 * Pokemon Sprite Cache
 *
 * Domain-specific caching layer for Pokemon sprites from PokeAPI's GitHub CDN.
 * Wraps the generic imageCache with Pokemon-specific logic and URL management.
 *
 * Sprite Variants:
 * - officialArtwork: High-quality artwork (used in Pokedex)
 * - frontDefault: In-game front sprite (used in battles)
 * - backDefault: In-game back sprite (player's Pokemon)
 * - frontShiny: Shiny front sprite (rare variants)
 * - backShiny: Shiny back sprite
 *
 * Performance Optimizations:
 * - URL construction cache avoids string concatenation overhead
 * - Preload strategies for common use cases (first page, evolution chains)
 * - Leverages underlying two-tier imageCache for actual storage
 *
 * Rate Limit Considerations:
 * - GitHub CDN: 60 requests/hour for unauthenticated users
 * - Preloading is batched via imageCache to respect limits
 * - Cache persistence reduces repeated API hits
 */

import {imageCache} from './imageCache';
import {logger} from '@/lib/logger';

interface PokemonSpriteUrls {
  officialArtwork: string;
  frontDefault: string;
  backDefault: string;
  frontShiny: string;
  backShiny: string;
}

class PokemonSpriteCache {
  private baseUrl =
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';
  private officialArtworkUrl =
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';

  /**
   * URL construction cache - prevents repeated string operations
   * Maps Pokemon ID to all sprite variant URLs for O(1) lookup
   */
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

  async getPokemonSprite(
    pokemonId: number,
    variant: keyof PokemonSpriteUrls = 'frontDefault'
  ): Promise<HTMLImageElement> {
    const urls = this.getSpriteUrls(pokemonId);
    const url = urls[variant];

    try {
      return await imageCache.getImage(url);
    } catch (error) {
      logger.logError(error, `LoadPokemonSprite:${pokemonId}:${variant}`);
      throw error;
    }
  }

  async preloadPokemonSprites(
    pokemonIds: number[],
    variant: keyof PokemonSpriteUrls = 'frontDefault'
  ): Promise<HTMLImageElement[]> {
    const urls = pokemonIds.map((id) => this.getSpriteUrls(id)[variant]);
    return imageCache.preloadImages(urls);
  }

  /**
   * Preload evolution chain sprites
   *
   * Optimizes the evolution modal experience by preloading all Pokemon
   * in an evolution chain. When user clicks an evolution, the sprite
   * loads instantly from cache.
   */
  async preloadPokemonEvolutionChain(pokemonIds: number[]): Promise<void> {
    const allUrls: string[] = [];

    pokemonIds.forEach((id) => {
      const urls = this.getSpriteUrls(id);
      allUrls.push(urls.frontDefault);
    });

    await imageCache.preloadImages(allUrls);
  }

  /**
   * Preload first page of Pokemon
   *
   * Called on app startup to cache the initial Pokedex view.
   * 20 Pokemon = 1 page worth of data for instant first-page load.
   * Reduced from 151 to respect GitHub rate limits.
   */
  async preloadCommonPokemon(): Promise<void> {
    const commonIds = Array.from({length: 20}, (_, i) => i + 1);
    await this.preloadPokemonSprites(commonIds, 'frontDefault');
  }

  /**
   * Preload Pokemon range (pagination support)
   *
   * Used for progressive loading as user scrolls through Pokedex.
   * Preloads next page before user reaches it for smooth experience.
   */
  async preloadPokemonRange(startId: number, endId: number): Promise<void> {
    const ids = Array.from(
      {length: endId - startId + 1},
      (_, i) => startId + i
    );
    await this.preloadPokemonSprites(ids, 'frontDefault');
  }

  /**
   * Get sprite URL without loading image
   *
   * Useful for components that need URLs for img src attributes
   * without triggering cache logic (e.g., lazy loading with Intersection Observer)
   */
  getPokemonSpriteUrl(
    pokemonId: number,
    variant: keyof PokemonSpriteUrls = 'frontDefault'
  ): string {
    return this.getSpriteUrls(pokemonId)[variant];
  }

  /**
   * Clear URL construction cache
   * Note: Doesn't clear actual image cache (use imageCache.clearCache for that)
   */
  clearPokemonCache(): void {
    this.spriteUrlCache.clear();
  }

  getCacheStats() {
    return imageCache.getStats();
  }
}

/**
 * Singleton instance - centralized Pokemon sprite management
 */
export const pokemonSpriteCache = new PokemonSpriteCache();

// Export types
export type {PokemonSpriteUrls};
