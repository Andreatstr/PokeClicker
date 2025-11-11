import Decimal from 'break_infinity.js';
import type {UserStats} from './graphql/types';
import {UPGRADES} from '@/config/upgradeConfig';

/**
 * Calculate base candy per click WITHOUT crit (deterministic)
 * Used for UI display to show consistent values
 */
export function calculateBaseCandyPerClick(
  stats: UserStats | undefined,
  ownedPokemonCount = 0
): string {
  if (!stats) return '1';

  // Base click power from config
  const clickPowerValue = UPGRADES.clickPower.formula(
    (stats.clickPower || 1) - 1
  );
  let totalPower = new Decimal(clickPowerValue);

  // Click multiplier from config
  if (stats.clickMultiplier && stats.clickMultiplier > 1) {
    const multiplier = UPGRADES.clickMultiplier.formula(
      stats.clickMultiplier - 1
    );
    totalPower = totalPower.times(multiplier);
  }

  // Pokedex bonus from config
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
 * Calculate actual candy per click WITH crit roll (RNG)
 * Used for actual game clicks
 */
export function calculateCandyPerClick(
  stats: UserStats | undefined,
  ownedPokemonCount = 0
): string {
  if (!stats) return '1';

  // Base click power from config
  const clickPowerValue = UPGRADES.clickPower.formula(
    (stats.clickPower || 1) - 1
  );
  let totalPower = new Decimal(clickPowerValue);

  // Click multiplier from config
  if (stats.clickMultiplier && stats.clickMultiplier > 1) {
    const multiplier = UPGRADES.clickMultiplier.formula(
      stats.clickMultiplier - 1
    );
    totalPower = totalPower.times(multiplier);
  }

  // Pokedex bonus from config
  if (stats.pokedexBonus && stats.pokedexBonus > 1 && ownedPokemonCount > 0) {
    const bonusMultiplier = UPGRADES.pokedexBonus.formula(
      stats.pokedexBonus - 1,
      {
        pokemonCount: ownedPokemonCount,
      }
    );
    totalPower = totalPower.times(bonusMultiplier);
  }

  // Lucky hit from config
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

  // Return with 2 decimal places - will be accumulated and only floored for display
  return totalPower.toFixed(2);
}
