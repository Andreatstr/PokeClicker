const CANDY_UPDATE_EVENT = 'rare-candy:update';

interface CandyUpdateDetail {
  amount: string;
}

export function emitCandyUpdate(amount: string) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<CandyUpdateDetail>(CANDY_UPDATE_EVENT, {
      detail: {amount},
    })
  );
}

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
