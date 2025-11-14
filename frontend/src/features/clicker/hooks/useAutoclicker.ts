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

/**
 * Hook that manages automatic clicking functionality
 * Simulates regular clicks at specified intervals based on autoclicker upgrade level
 *
 * Implementation details:
 * - Updates every 100ms for smooth accumulation
 * - Calculates fractional clicks per interval (e.g., 0.5 clicks every 100ms)
 * - Accumulates partial clicks until whole clicks can be processed
 * - Each auto-click independently rolls for lucky hits (RNG per click)
 * - Disabled during onboarding to prevent progress during tutorial
 *
 * @param stats - User's current stat levels (determines clicks/second)
 * @param isAuthenticated - Must be true for autoclicker to function
 * @param onAutoClick - Callback to add earned candy to user's balance
 * @param ownedPokemonCount - Number of owned Pokemon (affects Pokedex bonus)
 * @param isOnboarding - If true, autoclicker is disabled
 */
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

    // Calculate clicks per second from autoclicker upgrade level
    const clicksPerSecond = UPGRADES.autoclicker.formula(stats.autoclicker - 1);
    const updateIntervalMs = 100; // Update 10 times per second for smooth progression
    const clicksPerInterval = clicksPerSecond * (updateIntervalMs / 1000);

    // Accumulator handles fractional clicks (e.g., 0.5 clicks/interval)
    let accumulatedClicks = 0;

    const interval = setInterval(() => {
      // Add fractional clicks to accumulator
      accumulatedClicks += clicksPerInterval;
      const clicksToProcess = Math.floor(accumulatedClicks);
      accumulatedClicks -= clicksToProcess;

      if (clicksToProcess === 0) return;

      let totalCandy = new Decimal(0);

      // Process each click individually to ensure independent lucky hit rolls
      // This prevents all auto-clicks from having the same lucky outcome
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
