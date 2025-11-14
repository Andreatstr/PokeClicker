import {
  createContext,
  useContext,
  useRef,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import {useAuth} from '@features/auth';
import {useGameMutations} from '@features/clicker/hooks/useGameMutations';
import {emitCandyUpdate} from '@/lib/candyEvents';
import {toDecimal} from '@/lib/decimal';
import {logger} from '@/lib/logger';

/**
 * Context for sharing candy operations across components
 * Allows Battle and Purchase components to coordinate with Clicker's candy state
 *
 * Architecture:
 * - Initializes with a default implementation that uses mutations directly
 * - PokeClicker can register its optimized batched version when it mounts
 * - This ensures battle rewards work even if PokeClicker hasn't mounted yet
 */
interface CandyOperationsContextType {
  addCandy: (amount: string) => void;
  flushPendingCandy: () => Promise<void>;
  getLocalRareCandy: () => string;
  registerOperations: (ops: {
    addCandy: (amount: string) => void;
    flushPendingCandy: () => Promise<void>;
    getLocalRareCandy: () => string;
  }) => void;
}

const CandyOperationsContext = createContext<
  CandyOperationsContextType | undefined
>(undefined);

export function CandyOperationsProvider({children}: {children: ReactNode}) {
  const {user, updateUser} = useAuth();
  const {updateRareCandy} = useGameMutations();

  // Use refs for everything to avoid re-renders
  const addCandyRef = useRef<((amount: string) => void) | null>(null);
  const flushPendingCandyRef = useRef<(() => Promise<void>) | null>(null);
  const getLocalRareCandyRef = useRef<(() => string) | null>(null);

  // Store latest values in refs so functions always read current values
  const userRef = useRef(user);
  const updateRareCandyRef = useRef(updateRareCandy);
  const updateUserRef = useRef(updateUser);

  // Keep refs up to date
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    updateRareCandyRef.current = updateRareCandy;
  }, [updateRareCandy]);

  useEffect(() => {
    updateUserRef.current = updateUser;
  }, [updateUser]);

  // Default implementation: Direct mutation (works immediately, no batching)
  // This ensures battle rewards work even if PokeClicker hasn't mounted
  // Uses optimistic updates: emits event immediately, then syncs to server
  // Uses refs to always read latest values, even if user loads after mount
  const defaultAddCandy = useCallback((amount: string) => {
    // Read from refs to get latest values
    const currentUser = userRef.current;
    const currentUpdateRareCandy = updateRareCandyRef.current;
    const currentUpdateUser = updateUserRef.current;

    // Only require user to exist (works for both regular and guest users)
    if (!currentUser) {
      logger.logError(
        new Error('Cannot add candy: user not available'),
        'CandyOperations'
      );
      return;
    }

    // Optimistic update: emit event after render to avoid updating other components during render
    const currentCandy = toDecimal(currentUser.rare_candy ?? '0');
    const newCandy = currentCandy.plus(amount);
    queueMicrotask(() => {
      emitCandyUpdate(newCandy.toString());
    });

    // Sync to server and emit confirmed value when complete
    // This ensures the counter gets the server-confirmed value, preventing context sync from overwriting
    currentUpdateRareCandy(amount, (updatedUser) => {
      // Call the original updateUser callback
      currentUpdateUser(updatedUser);
      // Emit event with server-confirmed value to ensure counter stays in sync
      // Defer to avoid updating other components during render
      if (updatedUser?.rare_candy !== undefined) {
        queueMicrotask(() => {
          emitCandyUpdate(String(updatedUser.rare_candy));
        });
      }
    }).catch((error) => {
      logger.logError(error, 'DefaultAddCandy');
      // On error, revert to actual server value from current user
      if (currentUser.rare_candy !== undefined) {
        queueMicrotask(() => {
          emitCandyUpdate(String(currentUser.rare_candy));
        });
      }
    });
  }, []); // Empty deps - uses refs for all values

  const defaultFlushPendingCandy = useCallback(async () => {
    // Default implementation: no-op (no batching needed for direct mutations)
    // PokeClicker's batched version will replace this
  }, []);

  const defaultGetLocalRareCandy = useCallback(() => {
    // Read from ref to get latest value
    const currentUser = userRef.current;
    return currentUser?.rare_candy ? String(currentUser.rare_candy) : '0';
  }, []); // Empty deps - uses ref for user

  // Initialize refs with default implementation (only once)
  useEffect(() => {
    if (!addCandyRef.current) {
      addCandyRef.current = defaultAddCandy;
    }
    if (!flushPendingCandyRef.current) {
      flushPendingCandyRef.current = defaultFlushPendingCandy;
    }
    if (!getLocalRareCandyRef.current) {
      getLocalRareCandyRef.current = defaultGetLocalRareCandy;
    }
  }, [defaultAddCandy, defaultFlushPendingCandy, defaultGetLocalRareCandy]);

  // Stable registerOperations function that doesn't change
  // PokeClicker can call this to replace the default with its optimized batched version
  const registerOperations = useCallback(
    (ops: {
      addCandy: (amount: string) => void;
      flushPendingCandy: () => Promise<void>;
      getLocalRareCandy: () => string;
    }) => {
      // Update refs without causing re-renders
      // This allows PokeClicker to "upgrade" to batched operations
      addCandyRef.current = ops.addCandy;
      flushPendingCandyRef.current = ops.flushPendingCandy;
      getLocalRareCandyRef.current = ops.getLocalRareCandy;
    },
    []
  );

  // Stable wrapper functions that use the refs
  // These always work - either with default implementation or PokeClicker's optimized version
  const addCandy = useCallback(
    (amount: string) => {
      // Ensure default implementation is set if not already initialized
      if (!addCandyRef.current) {
        addCandyRef.current = defaultAddCandy;
      }
      addCandyRef.current(amount);
    },
    [defaultAddCandy]
  );

  const flushPendingCandy = useCallback(async () => {
    if (flushPendingCandyRef.current) {
      await flushPendingCandyRef.current();
    }
  }, []);

  const getLocalRareCandy = useCallback(() => {
    if (getLocalRareCandyRef.current) {
      return getLocalRareCandyRef.current();
    }
    // Fallback: read from ref to get latest user value
    const currentUser = userRef.current;
    return currentUser?.rare_candy ? String(currentUser.rare_candy) : '0';
  }, []);

  return (
    <CandyOperationsContext.Provider
      value={{
        addCandy,
        flushPendingCandy,
        getLocalRareCandy,
        registerOperations,
      }}
    >
      {children}
    </CandyOperationsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCandyOperations() {
  const context = useContext(CandyOperationsContext);
  if (!context) {
    throw new Error(
      'useCandyOperations must be used within CandyOperationsProvider'
    );
  }
  return context;
}
