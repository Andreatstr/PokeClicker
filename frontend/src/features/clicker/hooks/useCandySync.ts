import {useState, useEffect, useRef, useCallback} from 'react';
import {logger} from '@/lib/logger';
import {GameConfig} from '@/config';
import {useGameMutations} from './useGameMutations';
import type {User} from '@features/auth';
import {toDecimal} from '@/lib/decimal';
import {emitCandyUpdate} from '@/lib/candyEvents';

interface UseCandySyncProps {
  user: User | null;
  isAuthenticated: boolean;
  updateUser: (user: User) => void;
}

/**
 * Manages local candy state with batched server syncing
 * Implements optimistic updates with automatic retry on failure
 *
 * Sync strategy:
 * - Maintains local candy count that updates immediately (optimistic)
 * - Accumulates changes in unsyncedAmount buffer
 * - Flushes to server when:
 *   1. Unsynced amount exceeds threshold (default: 100 candy)
 *   2. Time since last sync exceeds threshold (default: 5 seconds)
 *   3. Component unmounts (navigating away from clicker page)
 *
 * Error handling:
 * - If sync fails, adds amount back to unsynced buffer
 * - Automatically retries on next flush trigger
 * - Shows temporary error message to user
 *
 * Why batching?
 * - Reduces server load (fewer API calls)
 * - Improves performance (no waiting for server on each click)
 * - Prevents race conditions with rapid clicking
 *
 * @param user - Current authenticated user
 * @param isAuthenticated - Must be true to sync candy to server
 * @param updateUser - Callback to update user context after successful sync
 */
export function useCandySync({
  user,
  isAuthenticated,
  updateUser,
}: UseCandySyncProps) {
  const {updateRareCandy} = useGameMutations();

  const [localRareCandy, setLocalRareCandy] = useState(
    user?.rare_candy ? String(user.rare_candy) : '0'
  );
  const [unsyncedAmount, setUnsyncedAmount] = useState('0');
  const unsyncedAmountRef = useRef('0');
  const batchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSyncRef = useRef<number>(Date.now());
  const [displayError, setDisplayError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const nextValue = String(user.rare_candy ?? '0');
    setLocalRareCandy(nextValue);
    setUnsyncedAmount('0');
    unsyncedAmountRef.current = '0';
    emitCandyUpdate(nextValue);
  }, [user]);

  /**
   * Flushes accumulated candy changes to the server
   * Called automatically by triggers or manually before upgrades
   */
  const flushPendingCandy = useCallback(async () => {
    if (toDecimal(unsyncedAmount).eq(0) || !isAuthenticated) return;

    // Snapshot the amount to sync and clear buffer immediately
    const amountToSync = unsyncedAmount;
    setUnsyncedAmount('0');
    unsyncedAmountRef.current = '0';
    lastSyncRef.current = Date.now();

    // Clear any pending batch timer
    if (batchTimerRef.current) {
      clearTimeout(batchTimerRef.current);
      batchTimerRef.current = null;
    }

    try {
      await updateRareCandy(amountToSync, updateUser);
    } catch (err) {
      // On failure, add the amount back to unsynced buffer for retry
      logger.logError(err, 'SyncCandy');
      setDisplayError('Failed to save progress. Will retry...');
      setUnsyncedAmount((prev) => {
        const newAmount = toDecimal(prev).plus(amountToSync).toString();
        unsyncedAmountRef.current = newAmount;
        return newAmount;
      });
      setTimeout(
        () => setDisplayError(null),
        GameConfig.clicker.errorDisplayDuration
      );
    }
  }, [unsyncedAmount, isAuthenticated, updateRareCandy, updateUser]);

  // Auto-flush effect: Monitors unsynced amount and triggers flush based on thresholds
  useEffect(() => {
    if (toDecimal(unsyncedAmount).eq(0) || !isAuthenticated) return;

    // Check if we should flush immediately based on thresholds
    const shouldFlush =
      toDecimal(unsyncedAmount).gte(
        GameConfig.clicker.batchSyncClickThreshold // Amount threshold (e.g., 100 candy)
      ) ||
      Date.now() - lastSyncRef.current >=
        GameConfig.clicker.batchSyncTimeThreshold; // Time threshold (e.g., 5 seconds)

    if (shouldFlush) {
      flushPendingCandy();
    } else if (!batchTimerRef.current) {
      // Schedule a flush for later if thresholds not yet met
      batchTimerRef.current = setTimeout(() => {
        flushPendingCandy();
      }, GameConfig.clicker.batchSyncTimeThreshold);
    }

    return () => {
      if (batchTimerRef.current) {
        clearTimeout(batchTimerRef.current);
        batchTimerRef.current = null;
      }
    };
  }, [unsyncedAmount, isAuthenticated, flushPendingCandy]);

  const flushPendingCandyRef = useRef(flushPendingCandy);
  useEffect(() => {
    flushPendingCandyRef.current = flushPendingCandy;
  }, [flushPendingCandy]);

  // Flush on unmount: Ensures candy is saved when navigating away from clicker
  // Empty deps - we want this to run ONLY on unmount, refs handle current values
  useEffect(() => {
    return () => {
      if (toDecimal(unsyncedAmountRef.current).gt(0)) {
        flushPendingCandyRef.current();
      }
    };
  }, []);

  /**
   * Adds candy to local state and unsynced buffer
   * Updates are optimistic - shown immediately to user
   */
  const addCandy = useCallback((amount: string) => {
    setLocalRareCandy((prev) => {
      const next = toDecimal(prev).plus(amount).toString();
      emitCandyUpdate(next); // Notify other components of candy change
      return next;
    });
    setUnsyncedAmount((prev) => {
      const newAmount = toDecimal(prev).plus(amount).toString();
      unsyncedAmountRef.current = newAmount;
      return newAmount;
    });
  }, []);

  /**
   * Deducts candy from local state immediately (for upgrades)
   * Does NOT add to unsynced buffer since upgrades sync separately
   */
  const deductCandy = useCallback((amount: string) => {
    setLocalRareCandy((prev) => {
      const next = toDecimal(prev).minus(amount).toString();
      emitCandyUpdate(next);
      return next;
    });
  }, []);

  return {
    localRareCandy,
    unsyncedAmount,
    displayError,
    setDisplayError,
    addCandy,
    deductCandy,
    flushPendingCandy,
  };
}
