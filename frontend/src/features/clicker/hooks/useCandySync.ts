import {useState, useEffect, useRef, useCallback} from 'react';
import {logger} from '@/lib/logger';
import {GameConfig} from '@/config';
import {useGameMutations} from './useGameMutations';
import type {User} from '@features/auth';
import {toDecimal} from '@/lib/decimal';

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

  const [localRareCandy, setLocalRareCandy] = useState(
    user?.rare_candy ? String(user.rare_candy) : '0'
  );
  const [unsyncedAmount, setUnsyncedAmount] = useState('0');
  const unsyncedAmountRef = useRef('0');
  const batchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSyncRef = useRef<number>(Date.now());
  const [displayError, setDisplayError] = useState<string | null>(null);

  const hasMountedRef = useRef(false);
  useEffect(() => {
    if (user && !hasMountedRef.current) {
      setLocalRareCandy(String(user.rare_candy));
      setUnsyncedAmount('0');
      unsyncedAmountRef.current = '0';
      hasMountedRef.current = true;
    }
  }, [user]);

  const flushPendingCandy = useCallback(async () => {
    if (toDecimal(unsyncedAmount).eq(0) || !isAuthenticated) return;

    const amountToSync = unsyncedAmount;
    setUnsyncedAmount('0');
    unsyncedAmountRef.current = '0';
    lastSyncRef.current = Date.now();

    if (batchTimerRef.current) {
      clearTimeout(batchTimerRef.current);
      batchTimerRef.current = null;
    }

    try {
      await updateRareCandy(amountToSync, updateUser);
    } catch (err) {
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

  useEffect(() => {
    if (toDecimal(unsyncedAmount).eq(0) || !isAuthenticated) return;

    const shouldFlush =
      toDecimal(unsyncedAmount).gte(
        GameConfig.clicker.batchSyncClickThreshold
      ) ||
      Date.now() - lastSyncRef.current >=
        GameConfig.clicker.batchSyncTimeThreshold;

    if (shouldFlush) {
      flushPendingCandy();
    } else if (!batchTimerRef.current) {
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

  // Flush when component unmounts (navigating away from clicker)
  // Empty deps - we want this to run ONLY on unmount, refs handle current values
  useEffect(() => {
    return () => {
      if (toDecimal(unsyncedAmountRef.current).gt(0)) {
        flushPendingCandyRef.current();
      }
    };
  }, []);

  const addCandy = useCallback((amount: string) => {
    setLocalRareCandy((prev) => toDecimal(prev).plus(amount).toString());
    setUnsyncedAmount((prev) => {
      const newAmount = toDecimal(prev).plus(amount).toString();
      unsyncedAmountRef.current = newAmount;
      return newAmount;
    });
  }, []);

  const deductCandy = useCallback((amount: string) => {
    setLocalRareCandy((prev) => toDecimal(prev).minus(amount).toString());
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
