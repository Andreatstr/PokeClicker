import {useEffect} from 'react';
import type {UserStats} from '@/lib/graphql/types';
import {calculateCandyPerClick} from '@/lib/calculateCandyPerClick';
import {UPGRADES} from '@/config/upgradeConfig';

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

    const candyPerClick = calculateCandyPerClick(stats, ownedPokemonCount);
    const clicksPerSecond = UPGRADES.autoclicker.formula(stats.autoclicker - 1);

    const updateIntervalMs = 500;
    const candyPerUpdate = (
      clicksPerSecond *
      (updateIntervalMs / 1000) *
      parseFloat(candyPerClick)
    ).toFixed(2);

    const interval = setInterval(() => {
      onAutoClick(candyPerUpdate);
    }, updateIntervalMs);

    return () => clearInterval(interval);
  }, [stats, isAuthenticated, onAutoClick, ownedPokemonCount]);
}
