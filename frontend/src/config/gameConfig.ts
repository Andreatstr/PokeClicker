/**
 * Game Configuration Constants
 * Centralized location for all game balance and mechanics constants
 */
import {estimateBST} from './pokemonBST';

export const TILE_SIZE = 512;

export const GameConfig = {
  /**
   * Clicker mechanics
   */
  clicker: {
    /** Number of clicks before forcing a sync to server */
    batchSyncClickThreshold: 500,
    /** Time in milliseconds before forcing a sync to server */
    batchSyncTimeThreshold: 30000, // 30 seconds
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
  const baselineBST = 180; // Weakest Pokemon
  const doublingInterval = 5; // Price doubles every 5 BST points

  // Use estimated BST (actual prices come from API, this is just for fallback UI)
  const bst = estimateBST(pokemonId);

  // Doubling formula: Price doubles every 5 BST points
  // Range: 150 (BST 180) to 4.9E34 (BST 720)
  const bstDifference = bst - baselineBST;
  const doublings = bstDifference / doublingInterval;

  // Price = baseCost * 2^doublings
  return Math.floor(baseCost * Math.pow(2, doublings));
}
