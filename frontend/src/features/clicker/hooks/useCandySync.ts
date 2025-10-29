import {useState, useEffect, useRef, useCallback} from 'react';
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
      hasMountedRef.current = true;
    }
  }, [user]);

  // Flush pending candy to server
  const flushPendingCandy = useCallback(async () => {
    if (unsyncedAmount === 0 || !isAuthenticated) return;

    const amountToSync = unsyncedAmount;
    setUnsyncedAmount(0); // Clear unsynced amount (we're syncing it now)
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
      console.error('Failed to sync candy:', err);
      setDisplayError('Failed to save progress. Will retry...');
      // Put the amount back in unsynced so it will be tried again
      setUnsyncedAmount((prev) => prev + amountToSync);
      setTimeout(() => setDisplayError(null), 3000);
    }
  }, [unsyncedAmount, isAuthenticated, updateRareCandy, updateUser]);

  // Batch update clicks every 10 seconds or after 50 clicks
  useEffect(() => {
    if (unsyncedAmount === 0 || !isAuthenticated) return;

    const shouldFlush =
      unsyncedAmount >= 50 || Date.now() - lastSyncRef.current >= 10000;

    if (shouldFlush) {
      flushPendingCandy();
    } else if (!batchTimerRef.current) {
      // Set a timer to flush after 10 seconds
      batchTimerRef.current = setTimeout(() => {
        flushPendingCandy();
      }, 10000);
    }

    return () => {
      if (batchTimerRef.current) {
        clearTimeout(batchTimerRef.current);
        batchTimerRef.current = null;
      }
    };
  }, [unsyncedAmount, isAuthenticated, flushPendingCandy]);

  // Flush when component unmounts (navigating away from clicker)
  useEffect(() => {
    return () => {
      if (unsyncedAmount > 0) {
        flushPendingCandy();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Add candy locally (optimistic update)
  const addCandy = useCallback((amount: number) => {
    setLocalRareCandy((prev) => prev + amount);
    setUnsyncedAmount((prev) => prev + amount);
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
