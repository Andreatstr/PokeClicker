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

/**
 * Generates user-friendly descriptions of stat effects for upgrade tooltips
 *
 * Calculates current and next level values for display, with special handling for:
 * - clickPower: Shows actual candy per click (with dynamic precision)
 * - pokedexBonus: Displays as percentage bonus (e.g., 50% instead of 1.5x)
 * - clickMultiplier: Converts to percentage (e.g., 1% instead of 0.01x)
 *
 * @param stat - Stat identifier (clickPower, pokedexBonus, etc.)
 * @param stats - User's current stat levels
 * @param ownedPokemonCount - Number of Pokemon owned (affects pokedexBonus calculation)
 * @returns Stat description object or error string
 */
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

  // Special handling for clickPower - show actual candy per click value
  if (stat === 'clickPower') {
    const currentCandy = parseFloat(
      calculateBaseCandyPerClick(stats, ownedPokemonCount)
    );

    const nextLevelStats = {...stats, clickPower: currentLevel + 1};
    const nextCandy = parseFloat(
      calculateBaseCandyPerClick(nextLevelStats, ownedPokemonCount)
    );

    // Use 2 decimal places for small values, 1 decimal for larger values
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

  // Special handling for pokedexBonus - show as percentage bonus
  if (stat === 'pokedexBonus') {
    const current = config.formula(currentLevel, {
      pokemonCount: ownedPokemonCount,
    });
    const next = config.formula(currentLevel + 1, {
      pokemonCount: ownedPokemonCount,
    });

    // Convert to percentage bonus (e.g., 1.5x = 50% bonus)
    const currentBonus = (current - 1) * 100;
    const nextBonus = (next - 1) * 100;

    return {
      current: parseFloat(currentBonus.toFixed(1)),
      next: parseFloat(nextBonus.toFixed(1)),
      unit: '% total bonus',
    };
  }

  // Generic stat calculation for all other stats
  const current = config.formula(currentLevel, {
    pokemonCount: ownedPokemonCount,
  });
  const next = config.formula(currentLevel + 1, {
    pokemonCount: ownedPokemonCount,
  });

  let currentDisplay = current;
  let nextDisplay = next;

  // Convert clickMultiplier to percentage for better UX
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

/**
 * Calculates the cost to upgrade a stat to the next level
 *
 * Wraps the upgrade cost in Decimal for consistent large number handling.
 *
 * @param stat - Stat identifier
 * @param currentLevel - Current stat level
 * @returns Upgrade cost as string (supports arbitrarily large numbers)
 */
export function getUpgradeCost(stat: string, currentLevel: number): string {
  return new Decimal(getUpgradeCostFromConfig(stat, currentLevel)).toString();
}
