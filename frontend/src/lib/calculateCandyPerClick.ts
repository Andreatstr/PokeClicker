import Decimal from 'break_infinity.js';
import type {UserStats} from './graphql/types';
import {UPGRADES} from '@/config/upgradeConfig';

/**
 * Calculates base candy per click (without lucky hit randomness)
 * Used for UI display to show consistent click power value
 *
 * Calculation order:
 * 1. Base click power from upgrade level
 * 2. Apply click multiplier (percentage boost)
 * 3. Apply Pokedex bonus (scales with owned Pokemon)
 *
 * @param stats - User's current stat levels
 * @param ownedPokemonCount - Number of Pokemon owned (for Pokedex bonus)
 * @returns String representation of candy earned per click (2 decimal places)
 */
export function calculateBaseCandyPerClick(
  stats: UserStats | undefined,
  ownedPokemonCount = 0
): string {
  if (!stats) return '1';

  // Base click power
  const clickPowerValue = UPGRADES.clickPower.formula(
    (stats.clickPower || 1) - 1
  );
  let totalPower = new Decimal(clickPowerValue);

  // Click multiplier
  if (stats.clickMultiplier && stats.clickMultiplier > 1) {
    const multiplier = UPGRADES.clickMultiplier.formula(
      stats.clickMultiplier - 1
    );
    totalPower = totalPower.times(multiplier);
  }

  // Pokedex bonus
  if (stats.pokedexBonus && stats.pokedexBonus > 1 && ownedPokemonCount > 0) {
    const bonusMultiplier = UPGRADES.pokedexBonus.formula(
      stats.pokedexBonus - 1,
      {
        pokemonCount: ownedPokemonCount,
      }
    );
    totalPower = totalPower.times(bonusMultiplier);
  }

  return totalPower.toFixed(2);
}

/**
 * Calculates actual candy earned per click (including lucky hit RNG)
 * Called on each click to determine rewards with randomized lucky hits
 *
 * Calculation order:
 * 1. Base click power from upgrade level
 * 2. Apply click multiplier (percentage boost)
 * 3. Apply Pokedex bonus (scales with owned Pokemon)
 * 4. Roll for lucky hit and apply lucky multiplier if successful
 *
 * Lucky hit mechanics:
 * - Chance is calculated from luckyHitChance upgrade level
 * - Each click independently rolls for lucky hit (RNG per click)
 * - If lucky, multiply total power by luckyHitMultiplier
 *
 * @param stats - User's current stat levels
 * @param ownedPokemonCount - Number of Pokemon owned (for Pokedex bonus)
 * @returns String representation of candy earned (2 decimal places)
 *
 * @example
 * // With clickPower=5, clickMultiplier=3, luckyHitChance=10:
 * // Base: 1.5 candy
 * // After multiplier: 1.5 * 1.3 = 1.95 candy
 * // 10% chance for lucky hit with 2x multiplier: 1.95 or 3.9 candy
 */
export function calculateCandyPerClick(
  stats: UserStats | undefined,
  ownedPokemonCount = 0
): string {
  if (!stats) return '1';

  // Calculate base click power
  const clickPowerValue = UPGRADES.clickPower.formula(
    (stats.clickPower || 1) - 1
  );
  let totalPower = new Decimal(clickPowerValue);

  // Apply click multiplier boost
  if (stats.clickMultiplier && stats.clickMultiplier > 1) {
    const multiplier = UPGRADES.clickMultiplier.formula(
      stats.clickMultiplier - 1
    );
    totalPower = totalPower.times(multiplier);
  }

  // Apply Pokedex bonus (scales with owned Pokemon count)
  if (stats.pokedexBonus && stats.pokedexBonus > 1 && ownedPokemonCount > 0) {
    const bonusMultiplier = UPGRADES.pokedexBonus.formula(
      stats.pokedexBonus - 1,
      {
        pokemonCount: ownedPokemonCount,
      }
    );
    totalPower = totalPower.times(bonusMultiplier);
  }

  // Roll for lucky hit and apply multiplier if successful
  if (stats.luckyHitChance && stats.luckyHitChance > 1) {
    const luckyChancePercent =
      UPGRADES.luckyHitChance.formula(stats.luckyHitChance) / 100;
    const isLucky = Math.random() < luckyChancePercent;

    if (isLucky && stats.luckyHitMultiplier) {
      const luckyMult = UPGRADES.luckyHitMultiplier.formula(
        stats.luckyHitMultiplier
      );
      totalPower = totalPower.times(luckyMult);
    }
  }
  return totalPower.toFixed(2);
}
