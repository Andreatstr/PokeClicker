import {useState, useCallback} from 'react';
import {logger} from '@/lib/logger';
import {GameConfig} from '@/config';
import {calculateCandyPerClick} from '@/lib/calculateCandyPerClick';
import {getUpgradeCost} from '../utils/statDescriptions';
import type {User} from '@features/auth';

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

interface Candy {
  id: number;
  x: number;
  amount: number;
}

interface UseClickerActionsProps {
  stats: Stats;
  isAuthenticated: boolean;
  addCandy: (amount: number) => void;
  deductCandy: (amount: number) => void;
  flushPendingCandy: () => Promise<void>;
  localRareCandy: number;
  setDisplayError: (error: string | null) => void;
  setStats: React.Dispatch<React.SetStateAction<Stats>>;
  upgradeStat: (
    stat: string,
    updateUser: (user: User) => void
  ) => Promise<User | undefined>;
  updateUser: (user: User) => void;
}

/**
 * Handles clicker game actions (clicking, upgrading)
 * Contains business logic for game interactions
 */
export function useClickerActions({
  stats,
  isAuthenticated,
  addCandy,
  deductCandy,
  flushPendingCandy,
  localRareCandy,
  setDisplayError,
  setStats,
  upgradeStat,
  updateUser,
}: UseClickerActionsProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [candies, setCandies] = useState<Candy[]>([]);

  const handleClick = useCallback(() => {
    if (!isAuthenticated) {
      setDisplayError('Please log in to play the game');
      return;
    }

    const candiesEarned = calculateCandyPerClick(stats);

    addCandy(candiesEarned);
    setIsAnimating(true);

    const newCandy: Candy = {
      id: Date.now() + Math.random(),
      x: Math.random() * 60 + 20, // Random position between 20% and 80%
      amount: candiesEarned,
    };
    setCandies((prev) => [...prev, newCandy]);

    setTimeout(() => {
      setCandies((prev) => prev.filter((c) => c.id !== newCandy.id));
    }, GameConfig.clicker.candyFloatAnimationDuration);

    setTimeout(
      () => setIsAnimating(false),
      GameConfig.clicker.clickAnimationDuration
    );
  }, [isAuthenticated, stats, addCandy, setDisplayError]);

  const handleUpgrade = useCallback(
    async (stat: keyof Stats) => {
      if (!isAuthenticated) {
        setDisplayError('Please log in to upgrade stats');
        return;
      }

      const cost = getUpgradeCost(stat, stats[stat] || 1);

      if (localRareCandy < cost) {
        return; // Not enough candy
      }

      // Flush unsynced candy before upgrading to ensure server has latest amount
      await flushPendingCandy();

      const oldStat = stats[stat];
      deductCandy(cost);
      setStats((prev) => ({
        ...prev,
        [stat]: (prev[stat] || 1) + 1,
      }));

      try {
        const updatedUser = await upgradeStat(stat, updateUser);
        if (updatedUser) {
          setStats(updatedUser.stats);
        }
      } catch (err) {
        logger.logError(err, 'UpgradeStat');
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to upgrade stat. Please try again.';
        setDisplayError(errorMessage);
        addCandy(cost);
        setStats((prev) => ({...prev, [stat]: oldStat || 1}));
        setTimeout(
          () => setDisplayError(null),
          GameConfig.clicker.errorDisplayDuration
        );
      }
    },
    [
      isAuthenticated,
      stats,
      localRareCandy,
      flushPendingCandy,
      deductCandy,
      setStats,
      upgradeStat,
      updateUser,
      addCandy,
      setDisplayError,
    ]
  );

  return {
    isAnimating,
    candies,
    handleClick,
    handleUpgrade,
  };
}
