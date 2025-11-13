import {useEffect} from 'react';
import Decimal from 'break_infinity.js';
import type {UserStats} from '@/lib/graphql/types';
import {calculateCandyPerClick} from '@/lib/calculateCandyPerClick';
import {UPGRADES} from '@/config/upgradeConfig';

interface UseAutoclickerProps {
  stats: UserStats;
  isAuthenticated: boolean;
  onAutoClick: (amount: string) => void;
  ownedPokemonCount: number;
  isOnboarding?: boolean;
}

export function useAutoclicker({
  stats,
  isAuthenticated,
  onAutoClick,
  ownedPokemonCount,
  isOnboarding = false,
}: UseAutoclickerProps) {
  useEffect(() => {
    if (!isAuthenticated || !stats || isOnboarding) return;
    if (!stats.autoclicker || stats.autoclicker === 0) return;

    const clicksPerSecond = UPGRADES.autoclicker.formula(stats.autoclicker - 1);
    const updateIntervalMs = 100;
    const clicksPerInterval = clicksPerSecond * (updateIntervalMs / 1000);

    let accumulatedClicks = 0;

    const interval = setInterval(() => {
      accumulatedClicks += clicksPerInterval;
      const clicksToProcess = Math.floor(accumulatedClicks);
      accumulatedClicks -= clicksToProcess;

      if (clicksToProcess === 0) return;

      let totalCandy = new Decimal(0);

      // Calculate each individual click with its own lucky hit roll
      for (let i = 0; i < clicksToProcess; i++) {
        const candyForThisClick = calculateCandyPerClick(
          stats,
          ownedPokemonCount
        );
        totalCandy = totalCandy.plus(candyForThisClick);
      }

      onAutoClick(totalCandy.toFixed(2));
    }, updateIntervalMs);

    return () => clearInterval(interval);
  }, [stats, isAuthenticated, onAutoClick, ownedPokemonCount, isOnboarding]);
}
