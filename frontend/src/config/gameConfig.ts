/**
 * Game Configuration Constants
 * Centralized location for all game balance and mechanics constants
 */
export const TILE_SIZE = 512;

export const GameConfig = {
  /**
   * Clicker mechanics
   */
  clicker: {
    /** Time in milliseconds before forcing a sync to server */
    batchSyncTimeThreshold: 10000, // 10 seconds
    /** Duration of candy float animation in milliseconds */
    candyFloatAnimationDuration: 1000, // 1 second
    /** Duration of click animation in milliseconds */
    clickAnimationDuration: 150,
    /** Error display duration in milliseconds */
    errorDisplayDuration: 3000,
  },

  /**
   * Pokemon purchase
   */
  purchase: {
    /** Success animation duration in milliseconds */
    successAnimationDuration: 800,
    /** Error display duration in milliseconds */
    errorDisplayDuration: 1200,
  },

  /**
   * Pokemon pricing
   * Formula: 100 × 1.5^(tier), where tier = floor(pokemonId / 10)
   * Must match backend logic in resolvers.ts:getPokemonCost()
   */
  pricing: {
    /** Base cost for tier 0 Pokemon (ID 1-10) */
    baseCost: 100,
    /** Cost multiplier per tier */
    tierMultiplier: 1.5,
    /** Number of Pokemon per tier */
    pokemonPerTier: 10,
  },
} as const;

// Type-safe access to config
export type GameConfigType = typeof GameConfig;

/**
 * Calculate Pokemon purchase cost based on its ID
 *
 * Formula: 100 × 1.5^(tier), where tier = floor(pokemonId / 10)
 * IMPORTANT: Must match backend logic in resolvers.ts:getPokemonCost()
 *
 * @param pokemonId - Pokemon ID (1-1025)
 * @returns Purchase cost in rare candy
 */
export function getPokemonCost(pokemonId: number): number {
  const tier = Math.floor(pokemonId / GameConfig.pricing.pokemonPerTier);
  return Math.floor(
    GameConfig.pricing.baseCost *
      Math.pow(GameConfig.pricing.tierMultiplier, tier)
  );
}
