import Decimal from 'break_infinity.js';
import type {UserStats} from '@/lib/graphql/types';

interface StatDescription {
  current: number;
  next: number;
  unit: string;
}

// Helper to calculate effective click power with all multipliers (excluding crit since it's RNG)
function calculateEffectiveClickPower(
  stats: UserStats,
  ownedPokemonCount = 0
): number {
  // Base: 1.2^(level-1)
  let power = Math.pow(1.2, (stats.clickPower || 1) - 1);

  // Click multiplier: (1 + (level-1) * 0.02)
  if (stats.clickMultiplier && stats.clickMultiplier > 1) {
    power *= 1 + (stats.clickMultiplier - 1) * 0.02;
  }

  // Pokedex bonus: 1.005^(level * pokemonCount)
  if (stats.pokedexBonus && stats.pokedexBonus > 1 && ownedPokemonCount > 0) {
    power *= Math.pow(1.005, (stats.pokedexBonus - 1) * ownedPokemonCount);
  }

  return power;
}

export function getStatDescription(
  stat: string,
  stats: UserStats,
  ownedPokemonCount = 0
): StatDescription | string {
  switch (stat) {
    case 'clickPower': {
      const currentLevel = stats.clickPower || 1;

      // Calculate with ALL multipliers
      const currentCandy = calculateEffectiveClickPower(
        stats,
        ownedPokemonCount
      );

      // Calculate what it would be with next level
      const nextLevelStats = {...stats, clickPower: currentLevel + 1};
      const nextCandy = calculateEffectiveClickPower(
        nextLevelStats,
        ownedPokemonCount
      );

      // Show 2 decimal places for small values, 1 decimal for larger
      const currentRounded =
        currentCandy < 10
          ? parseFloat(currentCandy.toFixed(2))
          : parseFloat(currentCandy.toFixed(1));
      const nextRounded =
        nextCandy < 10
          ? parseFloat(nextCandy.toFixed(2))
          : parseFloat(nextCandy.toFixed(1));
      return {
        current: currentRounded,
        next: nextRounded,
        unit: 'candy/click',
      };
    }
    case 'autoclicker': {
      const currentLevel = stats.autoclicker || 1;
      // Interval: 10000ms / 1.3^(level-1)
      const currentIntervalMs = Math.max(
        1000,
        Math.floor(10000 / Math.pow(1.3, currentLevel - 1))
      );
      const nextIntervalMs = Math.max(
        1000,
        Math.floor(10000 / Math.pow(1.3, currentLevel))
      );
      // Convert to clicks per second: 1000ms / interval
      const currentFreq = parseFloat((1000 / currentIntervalMs).toFixed(2));
      const nextFreq = parseFloat((1000 / nextIntervalMs).toFixed(2));
      return {
        current: currentFreq,
        next: nextFreq,
        unit: 'clicks/sec',
      };
    }
    case 'critChance': {
      const currentLevel = stats.critChance || 1;
      // Logarithmic soft cap: 8 * ln(1 + 0.5 * level)
      const currentChance = parseFloat(
        (8 * Math.log(1 + 0.5 * (currentLevel - 1))).toFixed(1)
      );
      const nextChance = parseFloat(
        (8 * Math.log(1 + 0.5 * currentLevel)).toFixed(1)
      );
      return {
        current: currentChance,
        next: nextChance,
        unit: '% crit chance',
      };
    }
    case 'critMultiplier': {
      const currentLevel = stats.critMultiplier || 1;
      // Exponential: 1.2^(level-1)
      const currentMult = parseFloat(
        Math.pow(1.2, currentLevel - 1).toFixed(2)
      );
      const nextMult = parseFloat(Math.pow(1.2, currentLevel).toFixed(2));
      return {
        current: currentMult,
        next: nextMult,
        unit: 'x on crit',
      };
    }
    case 'battleRewards': {
      const currentLevel = stats.battleRewards || 1;
      // Multiplicative: 1.05^(level-1)
      const currentMult = parseFloat(
        Math.pow(1.05, currentLevel - 1).toFixed(2)
      );
      const nextMult = parseFloat(Math.pow(1.05, currentLevel).toFixed(2));
      return {
        current: currentMult,
        next: nextMult,
        unit: 'x battle candy',
      };
    }
    case 'clickMultiplier': {
      const currentLevel = stats.clickMultiplier || 1;
      // Additive percentage: (1 + (level-1) * 0.02)
      const currentMult = parseFloat(
        ((1 + (currentLevel - 1) * 0.02) * 100).toFixed(0)
      );
      const nextMult = parseFloat(((1 + currentLevel * 0.02) * 100).toFixed(0));
      return {
        current: currentMult,
        next: nextMult,
        unit: '% click power',
      };
    }
    case 'pokedexBonus': {
      const currentLevel = stats.pokedexBonus || 1;
      // 1.005^(level * pokemonCount)
      const currentBonus = (currentLevel - 1) * 0.5;
      const nextBonus = currentLevel * 0.5;
      return {
        current: parseFloat(currentBonus.toFixed(1)),
        next: parseFloat(nextBonus.toFixed(1)),
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

  // Balanced upgrade costs (reduced from original to prevent exponential wall):
  if (stat === 'clickPower') {
    multiplier = 1.8;
  } else if (stat === 'autoclicker') {
    multiplier = 1.7;
  } else if (stat === 'critChance') {
    multiplier = 1.9;
  } else if (stat === 'critMultiplier') {
    multiplier = 2.0;
  } else if (stat === 'battleRewards') {
    multiplier = 1.6;
  } else if (stat === 'clickMultiplier') {
    multiplier = 2.0;
  } else if (stat === 'pokedexBonus') {
    multiplier = 1.5;
  }
  // Legacy support
  else if (stat === 'attack' || stat === 'spAttack') {
    multiplier = 1.8;
  } else if (stat === 'speed') {
    multiplier = 1.5;
  }

  // Use Decimal for large number support
  // Base cost increased from 10 to 50 to slow early game
  return new Decimal(50)
    .times(new Decimal(multiplier).pow(currentLevel - 1))
    .floor()
    .toString();
}
