import Decimal from 'break_infinity.js';
import type {UserStats} from './graphql/types';
import {UPGRADES} from '@/config/upgradeConfig';

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

export function calculateCandyPerClick(
  stats: UserStats | undefined,
  ownedPokemonCount = 0
): string {
  if (!stats) return '1';

  const clickPowerValue = UPGRADES.clickPower.formula(
    (stats.clickPower || 1) - 1
  );
  let totalPower = new Decimal(clickPowerValue);

  if (stats.clickMultiplier && stats.clickMultiplier > 1) {
    const multiplier = UPGRADES.clickMultiplier.formula(
      stats.clickMultiplier - 1
    );
    totalPower = totalPower.times(multiplier);
  }

  if (stats.pokedexBonus && stats.pokedexBonus > 1 && ownedPokemonCount > 0) {
    const bonusMultiplier = UPGRADES.pokedexBonus.formula(
      stats.pokedexBonus - 1,
      {
        pokemonCount: ownedPokemonCount,
      }
    );
    totalPower = totalPower.times(bonusMultiplier);
  }

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
