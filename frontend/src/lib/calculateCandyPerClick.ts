import Decimal from 'break_infinity.js';
import type {UserStats} from './graphql/types';

export function calculateCandyPerClick(
  stats: UserStats | undefined,
  ownedPokemonCount = 0
): string {
  if (!stats) return '1';

  // Base click power: 1.15^(clickPower-1)
  // Level 1 = 1, Level 10 = 3.5, Level 20 = 12.3
  let totalPower = new Decimal(1.15).pow((stats.clickPower || 1) - 1);

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

  // Roll for crit: 1 - 0.98^(level * 0.5)
  // Level 1 = 2%, Level 5 = 4.9%, Level 10 = 9.6%, Level 20 = 18.2%
  if (stats.critChance && stats.critChance > 1) {
    const critChancePercent = 1 - Math.pow(0.98, (stats.critChance - 1) * 0.5);
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
