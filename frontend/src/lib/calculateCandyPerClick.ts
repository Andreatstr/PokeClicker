import Decimal from 'break_infinity.js';
import type {UserStats} from './graphql/types';

export function calculateCandyPerClick(stats: UserStats | undefined): string {
  // Guard against undefined stats
  if (!stats) {
    return '1'; // Minimum fallback value
  }

  // New simplified system: Use clickPower if available
  if (stats.clickPower && stats.clickPower > 0) {
    // Exponential scaling: 1.75^(clickPower-1)
    return new Decimal(1.75)
      .pow(stats.clickPower - 1)
      .floor()
      .toString();
  }

  // Legacy fallback: Use old attack + spAttack formula for backwards compatibility
  const baseCandy = new Decimal(1.75).pow((stats.attack || 1) - 1).floor();
  const spAttackBonus = new Decimal(1.5)
    .pow((stats.spAttack || 1) - 1)
    .times(0.5)
    .floor();
  return baseCandy.plus(spAttackBonus).toString();
}
