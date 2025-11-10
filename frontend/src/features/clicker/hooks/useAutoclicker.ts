import {useEffect} from 'react';
import type {UserStats} from '@/lib/graphql/types';
import {calculateCandyPerClick} from '@/lib/calculateCandyPerClick';

interface UseAutoclickerProps {
  stats: UserStats;
  isAuthenticated: boolean;
  onAutoClick: (amount: string) => void;
  ownedPokemonCount: number;
}

export function useAutoclicker({
  stats,
  isAuthenticated,
  onAutoClick,
  ownedPokemonCount,
}: UseAutoclickerProps) {
  useEffect(() => {
    if (!isAuthenticated || !stats) return;
    if (!stats.autoclicker || stats.autoclicker === 0) return;

    // Use same calculation as manual clicks
    const autoclickAmount = calculateCandyPerClick(stats, ownedPokemonCount);

    // Interval: 10000ms / 1.3^(level-1), minimum 1000ms
    // Level 1: 10000ms (0.1/s), Level 5: 3501ms (0.29/s), Level 10: 1561ms (0.64/s)
    const autoclickIntervalMs = Math.max(
      1000,
      Math.floor(10000 / Math.pow(1.3, stats.autoclicker - 1))
    );

    const interval = setInterval(() => {
      onAutoClick(autoclickAmount);
    }, autoclickIntervalMs);

    return () => clearInterval(interval);
  }, [stats, isAuthenticated, onAutoClick, ownedPokemonCount]);
}
