import Decimal from 'break_infinity.js';
import type {UserStats} from '@/lib/graphql/types';
import {calculateBaseCandyPerClick} from '@/lib/calculateCandyPerClick';
import {
  UPGRADES,
  getUpgradeCost as getUpgradeCostFromConfig,
} from '@/config/upgradeConfig';

interface StatDescription {
  current: number;
  next: number;
  unit: string;
}

export function getStatDescription(
  stat: string,
  stats: UserStats,
  ownedPokemonCount = 0
): StatDescription | string {
  const config = UPGRADES[stat];

  if (!config) {
    return 'Unknown stat';
  }

  const currentLevel = (stats as unknown as Record<string, number>)[stat] || 1;

  if (stat === 'clickPower') {
    const currentCandy = parseFloat(
      calculateBaseCandyPerClick(stats, ownedPokemonCount)
    );

    const nextLevelStats = {...stats, clickPower: currentLevel + 1};
    const nextCandy = parseFloat(
      calculateBaseCandyPerClick(nextLevelStats, ownedPokemonCount)
    );

    const currentRounded =
      currentCandy < 10
        ? parseFloat(currentCandy.toFixed(2))
        : parseFloat(currentCandy.toFixed(1));
    const nextRounded =
      nextCandy < 10
        ? parseFloat(nextCandy.toFixed(2))
        : parseFloat(nextCandy.toFixed(1));
    return {
      current: currentRounded,
      next: nextRounded,
      unit: config.unit,
    };
  }

  // Special handling for pokedexBonus - show per-pokemon bonus, not total multiplier
  if (stat === 'pokedexBonus' && config.perPokemonBonus) {
    const currentPerPokemon = config.perPokemonBonus(currentLevel);
    const nextPerPokemon = config.perPokemonBonus(currentLevel + 1);

    return {
      current: parseFloat(currentPerPokemon.toFixed(2)),
      next: parseFloat(nextPerPokemon.toFixed(2)),
      unit: config.unit,
    };
  }

  const current = config.formula(currentLevel, {
    pokemonCount: ownedPokemonCount,
  });
  const next = config.formula(currentLevel + 1, {
    pokemonCount: ownedPokemonCount,
  });

  let currentDisplay = current;
  let nextDisplay = next;

  if (stat === 'clickMultiplier') {
    currentDisplay = current * 100;
    nextDisplay = next * 100;
  }

  return {
    current: parseFloat(currentDisplay.toFixed(2)),
    next: parseFloat(nextDisplay.toFixed(2)),
    unit: config.unit,
  };
}

export function getUpgradeCost(stat: string, currentLevel: number): string {
  return new Decimal(getUpgradeCostFromConfig(stat, currentLevel)).toString();
}
