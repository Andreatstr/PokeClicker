import {useEffect} from 'react';
import Decimal from 'break_infinity.js';
import type {UserStats} from '@/lib/graphql/types';

interface UseAutoclickerProps {
  stats: UserStats;
  isAuthenticated: boolean;
  onAutoClick: (amount: string) => void;
}

/**
 * Handles automatic clicker generation
 * Generates candy at intervals based on autoclicker level
 */
export function useAutoclicker({
  stats,
  isAuthenticated,
  onAutoClick,
}: UseAutoclickerProps) {
  useEffect(() => {
    if (!isAuthenticated || !stats) return;

    let autoclickAmount = '0';
    let autoclickIntervalMs = 10000; // Default 10 seconds

    // New autoclicker system: Use autoclicker stat if available
    if (stats.autoclicker && stats.autoclicker > 0) {
      // Auto-click amount: grows with autoclicker level
      autoclickAmount = new Decimal(1.5)
        .pow(stats.autoclicker - 1)
        .floor()
        .toString();

      // Auto-click frequency: clicks more often at higher levels
      // Max 1 second interval at high levels
      autoclickIntervalMs = Math.max(
        1000,
        Math.floor(10000 / Math.pow(1.2, stats.autoclicker - 1))
      );
    }
    // Legacy fallback: Use old HP + Defense formula
    else {
      const legacyAmount =
        Math.floor((stats.hp - 1) * 0.5) +
        Math.floor((stats.defense - 1) * 0.3);
      autoclickAmount = String(legacyAmount);
      autoclickIntervalMs = 1000; // 1 second for legacy
    }

    if (new Decimal(autoclickAmount).gt(0)) {
      const interval = setInterval(() => {
        onAutoClick(autoclickAmount);
      }, autoclickIntervalMs);

      return () => clearInterval(interval);
    }
  }, [stats, isAuthenticated, onAutoClick]);
}
