/**
 * Clicker game upgrade configuration
 *
 * Defines all upgrade types, their formulas, costs, and scaling behavior
 * Each upgrade uses exponential cost growth to balance long-term progression
 */

export interface UpgradeConfig {
  key: string;
  displayName: string;
  formula: (level: number, context?: {pokemonCount?: number}) => number;
  costMultiplier: number;
  unit: string;
  perPokemonBonus?: (level: number) => number;
}

/**
 * Upgrade definitions with carefully balanced progression formulas
 *
 * Key design decisions:
 * - clickPower & autoclicker: Exponential growth (1.0954^level) for consistent scaling
 * - luckyHitChance: Logarithmic growth to prevent overpowered RNG
 * - luckyHitMultiplier: Moderate exponential (1.2^level) since it's gated by chance
 * - clickMultiplier: Linear growth (15% per level) as a multiplicative bonus
 * - pokedexBonus: Scales with Pokemon collection, rewards exploration
 */
export const UPGRADES: Record<string, UpgradeConfig> = {
  clickPower: {
    key: 'clickPower',
    displayName: 'Click Power',
    formula: (level) => Math.pow(1.0954, level / (1 + 0.001 * level)),
    costMultiplier: 1.3416,
    unit: 'candy/click',
  },
  autoclicker: {
    key: 'autoclicker',
    displayName: 'Autoclicker',
    formula: (level) => Math.pow(1.0954, level / (1 + 0.01 * level)),
    costMultiplier: 1.3038,
    unit: 'clicks/sec',
  },
  luckyHitChance: {
    key: 'luckyHitChance',
    displayName: 'Lucky Chance',
    formula: (level) => 2 * Math.log(1 + 0.5 * level),
    costMultiplier: 1.5,
    unit: '% lucky chance',
  },
  luckyHitMultiplier: {
    key: 'luckyHitMultiplier',
    displayName: 'Lucky Power',
    formula: (level) => Math.pow(1.2, level / (1 + 0.01 * level)),
    costMultiplier: 1.6,
    unit: 'x on lucky',
  },
  clickMultiplier: {
    key: 'clickMultiplier',
    displayName: 'Click Boost',
    formula: (level) => 1 + level * 0.15,
    costMultiplier: 1.7,
    unit: '% click power',
  },
  pokedexBonus: {
    key: 'pokedexBonus',
    displayName: 'Pokedex Bonus',
    formula: (level, {pokemonCount = 0} = {}) =>
      Math.pow(1.005, level * Math.sqrt(pokemonCount)),
    costMultiplier: 2.5,
    unit: '% per Pokemon',
    perPokemonBonus: (level) => 0.5 * level,
  },
};

export const BASE_UPGRADE_COST = 25;

/**
 * Calculate upgrade cost for a given stat at a given level
 * Uses exponential scaling: baseCost * multiplier^(level-1)
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

/**
 * Check if a stat key is a valid clicker upgrade
 */
export function isClickerUpgrade(stat: string): boolean {
  return stat in UPGRADES;
}

/**
 * Get all valid clicker upgrade keys
 */
export function getClickerUpgradeKeys(): string[] {
  return Object.keys(UPGRADES);
}
