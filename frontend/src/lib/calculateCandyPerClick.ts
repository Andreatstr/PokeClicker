/**
 * Calculate candy earned per click based on user stats
 * Shared utility used by both clicker and battle reward systems
 */
export function calculateCandyPerClick(stats: {
  hp: number;
  attack: number;
  defense: number;
  spAttack: number;
  spDefense: number;
  speed: number;
  clickPower?: number; // New simplified stat
  passiveIncome?: number;
} | undefined): number {
  // Guard against undefined stats
  if (!stats) {
    return 1; // Minimum fallback value
  }

  // New simplified system: Use clickPower if available
  if (stats.clickPower && stats.clickPower > 0) {
    // Exponential scaling: 1.75^(clickPower-1)
    return Math.floor(Math.pow(1.75, stats.clickPower - 1));
  }

  // Legacy fallback: Use old attack + spAttack formula for backwards compatibility
  const baseCandy = Math.floor(Math.pow(1.75, (stats.attack || 1) - 1));
  const spAttackBonus = Math.floor(0.5 * Math.pow(1.5, (stats.spAttack || 1) - 1));
  return baseCandy + spAttackBonus;
}
