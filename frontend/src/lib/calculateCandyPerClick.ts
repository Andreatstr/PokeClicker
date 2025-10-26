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
}): number {
  // Exponential scaling: 1.75^(attack-1) for base damage
  const baseCandy = Math.floor(Math.pow(1.75, stats.attack - 1));
  // SpAttack bonus: 0.5 × 1.5^(spAttack-1)
  const spAttackBonus = Math.floor(0.5 * Math.pow(1.5, stats.spAttack - 1));
  return baseCandy + spAttackBonus;
}
