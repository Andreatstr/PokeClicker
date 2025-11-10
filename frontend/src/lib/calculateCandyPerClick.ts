import Decimal from 'break_infinity.js';
import type {UserStats} from './graphql/types';

export function calculateCandyPerClick(
  stats: UserStats | undefined,
  ownedPokemonCount = 0
): string {
  if (!stats) return '1';

  // Base click power: 1.2^(clickPower-1)
  // Level 1 = 1, Level 10 = 5.16, Level 20 = 26.6
  let totalPower = new Decimal(1.2).pow((stats.clickPower || 1) - 1);

  // Apply click multiplier: (1 + (level-1) * 0.02)
  // Level 1 = 1.0x, Level 2 = 1.02x, Level 10 = 1.18x
  if (stats.clickMultiplier && stats.clickMultiplier > 1) {
    const multiplier = 1 + (stats.clickMultiplier - 1) * 0.02;
    totalPower = totalPower.times(multiplier);
  }

  // Apply pokedex bonus: 1.005^(level * ownedPokemonCount)
  // Each pokemon = +0.5% per level
  if (stats.pokedexBonus && stats.pokedexBonus > 1 && ownedPokemonCount > 0) {
    const bonusMultiplier = Math.pow(
      1.005,
      (stats.pokedexBonus - 1) * ownedPokemonCount
    );
    totalPower = totalPower.times(bonusMultiplier);
  }

  // Roll for crit: Logarithmic soft cap
  // Formula: 8 * ln(1 + 0.5 * level)
  // Level 1 = 3.3%, Level 10 = 12.9%, Level 20 = 19.7%, Level 50 = 29.3%
  if (stats.critChance && stats.critChance > 1) {
    const critChancePercent = (8 * Math.log(1 + 0.5 * stats.critChance)) / 100;
    const isCrit = Math.random() < critChancePercent;

    // Crit multiplier: 1.2^(level-1)
    // Level 1 = 1.2x, Level 2 = 1.44x, Level 10 = 5.16x
    if (isCrit && stats.critMultiplier) {
      const critMult = Math.pow(1.2, stats.critMultiplier - 1);
      totalPower = totalPower.times(critMult);
    }
  }

  // Return with 2 decimal places - will be accumulated and only floored for display
  return totalPower.toFixed(2);
}
