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

export const UPGRADES: Record<string, UpgradeConfig> = {
  clickPower: {
    key: 'clickPower',
    displayName: 'Click Power',
    formula: (level) => Math.pow(1.0954, level),
    costMultiplier: 1.3416,
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
    formula: (level) => 2 * Math.log(1 + 0.5 * level), // Much lower: starts at 1.4%, caps around 8%
    costMultiplier: 1.5, // More expensive
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
    formula: (level, {pokemonCount = 0} = {}) =>
      Math.pow(1.005, level * Math.sqrt(pokemonCount)),
    costMultiplier: 2.5,
    unit: '% total bonus',
    perPokemonBonus: (level) => 0.5 * level,
    color: {
      dark: '#0891b2',
      light: '#06b6d4',
    },
  },
};

export const BASE_UPGRADE_COST = 25;

export function getUpgradeCost(statKey: string, currentLevel: number): number {
  const config = UPGRADES[statKey];
  if (!config) {
    throw new Error(`Unknown upgrade stat: ${statKey}`);
  }

  return Math.floor(
    BASE_UPGRADE_COST * Math.pow(config.costMultiplier, currentLevel - 1)
  );
}
