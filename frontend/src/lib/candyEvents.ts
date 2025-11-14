/**
 * Candy Update Event System
 * Custom event-based pub/sub for cross-component candy amount synchronization
 * Used to keep navbar and clicker candy displays in sync without prop drilling
 */

const CANDY_UPDATE_EVENT = 'rare-candy:update';

interface CandyUpdateDetail {
  amount: string;
}

/**
 * Emit a candy update event to notify all subscribers
 * Called when candy amount changes in the clicker or backend sync
 * @param amount - The new candy amount as a string (supports Decimal values)
 */
export function emitCandyUpdate(amount: string) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<CandyUpdateDetail>(CANDY_UPDATE_EVENT, {
      detail: {amount},
    })
  );
}

/**
 * Subscribe to candy update events
 * Components can use this to react to candy changes without direct state coupling
 * @param callback - Function called with new candy amount when update occurs
 * @returns Cleanup function to remove the event listener
 */
export function subscribeToCandyUpdates(
  callback: (amount: string) => void
): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handler: EventListener = (event) => {
    const customEvent = event as CustomEvent<CandyUpdateDetail>;
    if (customEvent.detail?.amount !== undefined) {
      callback(customEvent.detail.amount);
    }
  };

  window.addEventListener(CANDY_UPDATE_EVENT, handler);
  return () => {
    window.removeEventListener(CANDY_UPDATE_EVENT, handler);
  };
}
