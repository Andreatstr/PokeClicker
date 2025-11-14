/**
 * Configuration interface for a single upgrade type in the clicker game
 * @property key - Unique identifier for the upgrade stat
 * @property displayName - Human-readable name shown in UI
 * @property formula - Function that calculates upgrade value at given level
 *                     Context can include pokemonCount for Pokedex Bonus calculation
 * @property costMultiplier - Exponential multiplier for upgrade cost scaling
 * @property unit - Display unit for the stat (e.g., "candy/click", "% lucky chance")
 * @property perPokemonBonus - Optional function for per-Pokemon bonus calculations
 * @property color - Theme colors for dark and light modes
 */
export interface UpgradeConfig {
  key: string;
  displayName: string;
  formula: (level: number, context?: {pokemonCount?: number}) => number;
  costMultiplier: number;
  unit: string;
  perPokemonBonus?: (level: number) => number;
  color: {
    dark: string;
    light: string;
  };
}

/**
 * Configuration for all available upgrades in the clicker game
 * Each upgrade uses exponential scaling formulas for balanced progression
 *
 * Game mechanics:
 * - clickPower: Base candy earned per click (exponential growth ~9.5% per level)
 * - autoclicker: Automatic clicks per second (exponential growth ~9.5% per level)
 * - luckyHitChance: Probability of lucky hits (logarithmic growth, caps ~8%)
 * - luckyHitMultiplier: Multiplier applied on lucky hits (20% growth per level)
 * - clickMultiplier: Flat percentage boost to all clicks (15% per level)
 * - pokedexBonus: Scales with owned Pokemon count (0.5% per level per sqrt(pokemon))
 */
export const UPGRADES: Record<string, UpgradeConfig> = {
  clickPower: {
    key: 'clickPower',
    displayName: 'Click Power',
    formula: (level) => Math.pow(1.0954, level), // ~9.5% growth per level
    costMultiplier: 1.3416, // Moderate cost scaling
    unit: 'candy/click',
    color: {
      dark: '#ea580c',
      light: '#f97316',
    },
  },
  autoclicker: {
    key: 'autoclicker',
    displayName: 'Autoclicker',
    formula: (level) => Math.pow(1.0954, level),
    costMultiplier: 1.3038,
    unit: 'clicks/sec',
    color: {
      dark: '#16a34a',
      light: '#22c55e',
    },
  },
  luckyHitChance: {
    key: 'luckyHitChance',
    displayName: 'Lucky Chance',
    // Logarithmic growth prevents lucky hits from becoming too powerful
    // Starts at ~1.4%, gradually caps around 8% at high levels
    formula: (level) => 2 * Math.log(1 + 0.5 * level),
    costMultiplier: 1.5, // More expensive due to multiplicative nature with luckyHitMultiplier
    unit: '% lucky chance',
    color: {
      dark: '#dc2626',
      light: '#ef4444',
    },
  },
  luckyHitMultiplier: {
    key: 'luckyHitMultiplier',
    displayName: 'Lucky Power',
    formula: (level) => Math.pow(1.2, level),
    costMultiplier: 1.6,
    unit: 'x on lucky',
    color: {
      dark: '#b91c1c',
      light: '#dc2626',
    },
  },
  clickMultiplier: {
    key: 'clickMultiplier',
    displayName: 'Click Boost',
    formula: (level) => 1 + level * 0.15,
    costMultiplier: 1.7,
    unit: '% click power',
    color: {
      dark: '#ca8a04',
      light: '#eab308',
    },
  },
  pokedexBonus: {
    key: 'pokedexBonus',
    displayName: 'Pokedex Bonus',
    // Rewards collecting Pokemon: scales with square root to balance early/late game
    // Formula: 1.005^(level * sqrt(pokemonCount))
    // E.g., level 10 with 100 Pokemon: 1.005^(10*10) = ~1.65x multiplier
    formula: (level, {pokemonCount = 0} = {}) =>
      Math.pow(1.005, level * Math.sqrt(pokemonCount)),
    costMultiplier: 2.5, // Expensive but powerful late-game upgrade
    unit: '% total bonus',
    perPokemonBonus: (level) => 0.5 * level, // 0.5% per level per Pokemon
    color: {
      dark: '#0891b2',
      light: '#06b6d4',
    },
  },
};

/** Base cost for the first upgrade level (level 1 -> 2) */
export const BASE_UPGRADE_COST = 25;

/**
 * Calculates the cost to upgrade a stat from its current level to the next
 * Uses exponential scaling: BASE_COST * (costMultiplier ^ (currentLevel - 1))
 *
 * @param statKey - The upgrade stat key (must exist in UPGRADES)
 * @param currentLevel - The current level of the stat (1 = base level)
 * @returns The cost in rare candy to upgrade to the next level
 * @throws Error if statKey is not found in UPGRADES configuration
 *
 * @example
 * // Cost to upgrade clickPower from level 5 to level 6:
 * // 25 * (1.3416 ^ 4) = ~81 candy
 * getUpgradeCost('clickPower', 5)
 */
export function getUpgradeCost(statKey: string, currentLevel: number): number {
  const config = UPGRADES[statKey];
  if (!config) {
    throw new Error(`Unknown upgrade stat: ${statKey}`);
  }

  return Math.floor(
    BASE_UPGRADE_COST * Math.pow(config.costMultiplier, currentLevel - 1)
  );
}
