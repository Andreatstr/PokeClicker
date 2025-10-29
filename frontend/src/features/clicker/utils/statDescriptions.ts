interface StatDescription {
  current: number;
  next: number;
  unit: string;
}

interface Stats {
  hp: number;
  attack: number;
  defense: number;
  spAttack: number;
  spDefense: number;
  speed: number;
  clickPower?: number;
  passiveIncome?: number;
}

/**
 * Get stat description showing current → next level benefit
 */
export function getStatDescription(
  stat: string,
  stats: Stats
): StatDescription | string {
  switch (stat) {
    case 'clickPower': {
      const currentLevel = stats.clickPower || 1;
      const currentCandy = Math.pow(1.75, currentLevel - 1);
      const nextCandy = Math.pow(1.75, currentLevel);
      const currentRounded = Math.floor(currentCandy);
      const nextRounded = Math.floor(nextCandy);
      return {
        current: currentRounded,
        next: nextRounded,
        unit: 'candy/click',
      };
    }
    case 'passiveIncome': {
      const currentLevel = stats.passiveIncome || 1;
      const currentCandy = Math.pow(1.5, currentLevel - 1);
      const nextCandy = Math.pow(1.5, currentLevel);
      const currentRounded = Math.floor(currentCandy);
      const nextRounded = Math.floor(nextCandy);
      return {
        current: currentRounded,
        next: nextRounded,
        unit: 'candy/sec',
      };
    }
    // Legacy descriptions (kept for backwards compatibility)
    case 'hp': {
      const hpPassive = (stats.hp - 1) * 0.5;
      return `+${hpPassive.toFixed(1)}/s passive`;
    }
    case 'attack':
      return `+${stats.attack} per click`;
    case 'defense': {
      const defPassive = (stats.defense - 1) * 0.3;
      return `+${defPassive.toFixed(1)}/s passive`;
    }
    case 'spAttack':
      return `+${Math.floor(stats.spAttack * 0.5)} per click`;
    case 'spDefense':
      return `Coming soon`;
    case 'speed':
      return `Coming soon`;
    default:
      return '';
  }
}

/**
 * Calculate upgrade cost for a given stat
 * Different stats have different multipliers
 */
export function getUpgradeCost(stat: string, currentLevel: number): number {
  let multiplier = 2.5; // default

  // New simplified system
  if (stat === 'clickPower') {
    multiplier = 2.8; // More expensive (high reward)
  } else if (stat === 'passiveIncome') {
    multiplier = 2.5; // Moderate cost
  }
  // Legacy support
  else if (stat === 'attack' || stat === 'spAttack') {
    multiplier = 2.8;
  } else if (stat === 'speed') {
    multiplier = 2.2;
  }

  return Math.floor(10 * Math.pow(multiplier, currentLevel - 1));
}
