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
} as const;

// Type-safe access to config
export type GameConfigType = typeof GameConfig;
