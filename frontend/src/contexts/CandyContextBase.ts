/**
 * Candy Context Type Definition and Creation
 * Separated from the provider component for React Fast Refresh compatibility
 */
import {createContext} from 'react';

export interface CandyContextType {
  /** Current candy amount (includes unsynced candy) - what user sees */
  localRareCandy: string;
  /** Add candy to local state and unsynced buffer (optimistic) */
  addCandy: (amount: string) => void;
  /** Deduct candy from local state (for purchases/upgrades) */
  deductCandy: (amount: string) => void;
  /** Flush pending candy to backend - call before purchases/upgrades */
  flushPendingCandy: () => Promise<void>;
  /** Display error message (from sync failures) */
  displayError: string | null;
  /** Clear display error */
  setDisplayError: (error: string | null) => void;
}

export const CandyContext = createContext<CandyContextType | null>(null);
