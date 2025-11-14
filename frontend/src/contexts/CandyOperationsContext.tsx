import {createContext, useContext, useState, type ReactNode} from 'react';

/**
 * Context for sharing candy operations across components
 * Allows Battle and Purchase components to coordinate with Clicker's candy state
 */
interface CandyOperationsContextType {
  addCandy: ((amount: string) => void) | null;
  flushPendingCandy: (() => Promise<void>) | null;
  localRareCandy: string;
  registerOperations: (ops: {
    addCandy: (amount: string) => void;
    flushPendingCandy: () => Promise<void>;
    localRareCandy: string;
  }) => void;
}

const CandyOperationsContext = createContext<
  CandyOperationsContextType | undefined
>(undefined);

export function CandyOperationsProvider({children}: {children: ReactNode}) {
  const [addCandy, setAddCandy] = useState<((amount: string) => void) | null>(
    null
  );
  const [flushPendingCandy, setFlushPendingCandy] = useState<
    (() => Promise<void>) | null
  >(null);
  const [localRareCandy, setLocalRareCandy] = useState<string>('0');

  const registerOperations = (ops: {
    addCandy: (amount: string) => void;
    flushPendingCandy: () => Promise<void>;
    localRareCandy: string;
  }) => {
    // Wrap functions to preserve identity
    setAddCandy(() => ops.addCandy);
    setFlushPendingCandy(() => ops.flushPendingCandy);
    setLocalRareCandy(ops.localRareCandy);
  };

  return (
    <CandyOperationsContext.Provider
      value={{addCandy, flushPendingCandy, localRareCandy, registerOperations}}
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
