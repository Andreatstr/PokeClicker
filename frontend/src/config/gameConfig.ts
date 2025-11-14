/**
 * Game Configuration Constants
 * Centralized location for all game balance and mechanics constants
 */
import {POKEMON_BST, estimateBST} from './pokemonBST';

export const TILE_SIZE = 512;

export const GameConfig = {
  /**
   * Clicker mechanics
   */
  clicker: {
    /** Number of clicks before forcing a sync to server */
    batchSyncClickThreshold: 50,
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
   * Pokemon pricing - based on Base Stat Total (BST)
   * NOTE: Frontend uses estimated costs for UI display only
   * Backend is authoritative and will enforce actual costs
   */
  pricing: {
    /** Base cost for weak Pokemon */
    baseCost: 150,
  },
} as const;

// Type-safe access to config
export type GameConfigType = typeof GameConfig;

/**
 * Calculate Pokemon purchase cost (frontend estimation)
 *
 * Formula matches backend (resolvers.ts:getPokemonCost):
 * - Balanced exponential scaling for all non-legendaries
 * - ULTRA EXTREME exponential for legendaries (Mewtwo costs QUINTILLIONS!)
 *
 * NOTE: Backend is authoritative. Frontend shows estimates for UI only.
 * Actual purchase will be validated and enforced by backend.
 *
 * @param pokemonId - Pokemon ID (1-1025)
 * @returns Estimated cost in rare candy
 */
export function getPokemonCost(pokemonId: number): number {
  const baseCost = 150;
  // Use actual BST data first, fall back to estimate only if not found
  const bst = POKEMON_BST[pokemonId] ?? estimateBST(pokemonId);

  // IMPROVED exponential curve - Mewtwo costs 38 QUINTILLIONS (Qi)!
  if (bst < 600) {
    // All non-legendary Pokemon: balanced exponential from BST 200
    const exponent = (bst - 200) / 33;
    return Math.floor(baseCost * Math.exp(exponent));
  } else {
    // Legendary tier: ULTRA EXTREME exponential growth - QUINTILLIONS!!!
    const baseExponent = (600 - 200) / 33;
    const costAt600 = baseCost * Math.exp(baseExponent);
    const legendaryExponent = (bst - 600) / 3.8;
    const legendaryMultiplier = Math.exp(legendaryExponent);
    return Math.floor(costAt600 * legendaryMultiplier);
  }
}
