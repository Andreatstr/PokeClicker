import {useState, useEffect, useRef, useCallback} from 'react';
import {logger} from '@/lib/logger';
import {GameConfig} from '@/config';
import {useGameMutations} from './useGameMutations';
import type {User} from '@features/auth';

interface UseCandySyncProps {
  user: User | null;
  isAuthenticated: boolean;
  updateUser: (user: User) => void;
}

/**
 * Manages local candy state with batched server syncing
 * Implements optimistic updates with automatic retry on failure
 */
export function useCandySync({
  user,
  isAuthenticated,
  updateUser,
}: UseCandySyncProps) {
  const {updateRareCandy} = useGameMutations();

  // Local candy state - THIS is the source of truth for display!
  const [localRareCandy, setLocalRareCandy] = useState(user?.rare_candy || 0);
  const [unsyncedAmount, setUnsyncedAmount] = useState(0);
  const unsyncedAmountRef = useRef(0); // Ref to track unsynced amount for cleanup
  const batchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSyncRef = useRef<number>(Date.now());

  // Error state
  const [displayError, setDisplayError] = useState<string | null>(null);

  // Initialize local candy from server when component mounts
  const hasMountedRef = useRef(false);
  useEffect(() => {
    if (user && !hasMountedRef.current) {
      setLocalRareCandy(user.rare_candy);
      setUnsyncedAmount(0);
      unsyncedAmountRef.current = 0; // Keep ref in sync
      hasMountedRef.current = true;
    }
  }, [user]);

  // Flush pending candy to server
  const flushPendingCandy = useCallback(async () => {
    if (unsyncedAmount === 0 || !isAuthenticated) return;

    const amountToSync = unsyncedAmount;
    setUnsyncedAmount(0); // Clear unsynced amount (we're syncing it now)
    unsyncedAmountRef.current = 0; // Keep ref in sync
    lastSyncRef.current = Date.now();

    if (batchTimerRef.current) {
      clearTimeout(batchTimerRef.current);
      batchTimerRef.current = null;
    }

    try {
      // Send to server and update Apollo cache (for other pages)
      await updateRareCandy(amountToSync, updateUser);
      // Success - server and cache are now in sync with our local state
    } catch (err) {
      logger.logError(err, 'SyncCandy');
      setDisplayError('Failed to save progress. Will retry...');
      // Put the amount back in unsynced so it will be tried again
      setUnsyncedAmount((prev) => {
        const newAmount = prev + amountToSync;
        unsyncedAmountRef.current = newAmount; // Keep ref in sync
        return newAmount;
      });
      setTimeout(
        () => setDisplayError(null),
        GameConfig.clicker.errorDisplayDuration
      );
    }
  }, [unsyncedAmount, isAuthenticated, updateRareCandy, updateUser]);

  // Batch update clicks based on configured thresholds
  useEffect(() => {
    if (unsyncedAmount === 0 || !isAuthenticated) return;

    const shouldFlush =
      unsyncedAmount >= GameConfig.clicker.batchSyncClickThreshold ||
      Date.now() - lastSyncRef.current >=
        GameConfig.clicker.batchSyncTimeThreshold;

    if (shouldFlush) {
      flushPendingCandy();
    } else if (!batchTimerRef.current) {
      // Set a timer to flush after configured time threshold
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

  // Store flush function in ref for unmount cleanup
  const flushPendingCandyRef = useRef(flushPendingCandy);
  useEffect(() => {
    flushPendingCandyRef.current = flushPendingCandy;
  }, [flushPendingCandy]);

  // Flush when component unmounts (navigating away from clicker)
  useEffect(() => {
    return () => {
      // Use ref to get current unsynced amount and flush function (avoiding stale closure)
      if (unsyncedAmountRef.current > 0) {
        flushPendingCandyRef.current();
      }
    };
    // Empty deps - we want this to run ONLY on unmount, refs handle current values
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Add candy locally (optimistic update)
  const addCandy = useCallback((amount: number) => {
    setLocalRareCandy((prev) => prev + amount);
    setUnsyncedAmount((prev) => {
      const newAmount = prev + amount;
      unsyncedAmountRef.current = newAmount; // Keep ref in sync
      return newAmount;
    });
  }, []);

  // Deduct candy locally (for upgrades)
  const deductCandy = useCallback((amount: number) => {
    setLocalRareCandy((prev) => prev - amount);
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
