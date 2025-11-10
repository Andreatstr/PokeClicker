import Decimal from 'break_infinity.js';
import type {UserStats} from '@/lib/graphql/types';

interface StatDescription {
  current: number;
  next: number;
  unit: string;
}

export function getStatDescription(
  stat: string,
  stats: UserStats
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
    case 'autoclicker': {
      const currentLevel = stats.autoclicker || 1;
      // Auto-click frequency: clicks more often at higher levels
      const currentFreq = Math.max(
        1,
        Math.floor(10 / Math.pow(1.2, currentLevel - 1))
      );
      const nextFreq = Math.max(
        1,
        Math.floor(10 / Math.pow(1.2, currentLevel))
      );
      return {
        current: currentFreq,
        next: nextFreq,
        unit: 'sec/auto-click',
      };
    }
    case 'critChance': {
      const currentLevel = stats.critChance || 1;
      // Crit chance: starts at 5%, increases by 2% per level
      const currentChance = 5 + (currentLevel - 1) * 2;
      const nextChance = 5 + currentLevel * 2;
      return {
        current: currentChance,
        next: nextChance,
        unit: '% crit chance',
      };
    }
    case 'critMultiplier': {
      const currentLevel = stats.critMultiplier || 1;
      // Crit multiplier: starts at 2x, increases by 0.5x per level
      const currentMult = 2 + (currentLevel - 1) * 0.5;
      const nextMult = 2 + currentLevel * 0.5;
      return {
        current: currentMult,
        next: nextMult,
        unit: 'x on crit',
      };
    }
    case 'battleRewards': {
      const currentLevel = stats.battleRewards || 1;
      // Battle rewards: starts at 100%, increases by 25% per level
      const currentBonus = 100 + (currentLevel - 1) * 25;
      const nextBonus = 100 + currentLevel * 25;
      return {
        current: currentBonus,
        next: nextBonus,
        unit: '% battle candy',
      };
    }
    case 'clickMultiplier': {
      const currentLevel = stats.clickMultiplier || 1;
      // Click multiplier: starts at 100%, increases by 15% per level
      const currentMult = 100 + (currentLevel - 1) * 15;
      const nextMult = 100 + currentLevel * 15;
      return {
        current: currentMult,
        next: nextMult,
        unit: '% click power',
      };
    }
    case 'pokedexBonus': {
      const currentLevel = stats.pokedexBonus || 1;
      // Pokedex bonus: bonus per unique Pokemon owned
      const currentBonus = (currentLevel - 1) * 0.5;
      const nextBonus = currentLevel * 0.5;
      return {
        current: currentBonus,
        next: nextBonus,
        unit: '% per Pokemon',
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
 * Different stats have different multipliers (must match backend costs)
 * Returns Decimal to handle very large numbers correctly
 */
export function getUpgradeCost(stat: string, currentLevel: number): string {
  let multiplier = 2.5; // default

  // PokeClicker upgrade costs (balanced for progression):
  if (stat === 'clickPower') {
    multiplier = 2.8; // Core active upgrade, moderate-high cost
  } else if (stat === 'autoclicker') {
    multiplier = 2.6; // Idle income, moderate cost
  } else if (stat === 'critChance') {
    multiplier = 2.5; // RNG boost, moderate cost
  } else if (stat === 'critMultiplier') {
    multiplier = 2.9; // High impact, higher cost
  } else if (stat === 'battleRewards') {
    multiplier = 2.4; // Bonus income source, moderate cost
  } else if (stat === 'clickMultiplier') {
    multiplier = 3.0; // Percentage boost, high cost (scales with other upgrades)
  } else if (stat === 'pokedexBonus') {
    multiplier = 2.3; // Collection reward, lower cost (encourages exploration)
  }
  // Legacy support
  else if (stat === 'attack' || stat === 'spAttack') {
    multiplier = 2.8;
  } else if (stat === 'speed') {
    multiplier = 2.2;
  }

  // Use Decimal for large number support
  return new Decimal(10)
    .times(new Decimal(multiplier).pow(currentLevel - 1))
    .floor()
    .toString();
}
