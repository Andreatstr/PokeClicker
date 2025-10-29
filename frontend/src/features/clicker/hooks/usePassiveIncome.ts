import {useEffect} from 'react';

interface Stats {
  hp: number;
  defense: number;
  passiveIncome?: number;
  clickPower?: number;
}

interface UsePassiveIncomeProps {
  stats: Stats;
  isAuthenticated: boolean;
  onIncomeGenerated: (amount: number) => void;
}

/**
 * Handles automatic passive income generation
 * Generates candy every second based on user stats
 */
export function usePassiveIncome({
  stats,
  isAuthenticated,
  onIncomeGenerated,
}: UsePassiveIncomeProps) {
  useEffect(() => {
    if (!isAuthenticated || !stats) return;

    let passiveIncomeAmount = 0;

    // New simplified system: Use passiveIncome stat if available
    if (stats.passiveIncome && stats.passiveIncome > 0) {
      passiveIncomeAmount = Math.floor(Math.pow(1.5, stats.passiveIncome - 1));
    }
    // Legacy fallback: Use old HP + Defense formula
    else {
      passiveIncomeAmount =
        Math.floor((stats.hp - 1) * 0.5) +
        Math.floor((stats.defense - 1) * 0.3);
    }

    if (passiveIncomeAmount > 0) {
      const interval = setInterval(() => {
        onIncomeGenerated(passiveIncomeAmount);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [stats, isAuthenticated, onIncomeGenerated]);
}
