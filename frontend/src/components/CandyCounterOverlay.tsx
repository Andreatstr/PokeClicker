import {useEffect, useState, useRef} from 'react';
import {useAuth} from '@features/auth';
import {formatNumber} from '@/lib/formatNumber';
import {subscribeToCandyUpdates} from '@/lib/candyEvents';
import {toDecimal} from '@/lib/decimal';

/**
 * Floating overlay that displays the user's current Rare Candy balance.
 *
 * Features:
 * - Real-time candy updates via event subscription
 * - Configurable position (bottom-left, bottom-right, top-right)
 * - Number formatting for large values
 * - Pointer-events disabled to prevent click blocking
 *
 * State management:
 * - Syncs with user.rare_candy from auth context (only if significantly different)
 * - Subscribes to candyEvents for immediate updates without re-renders
 * - Initializes from user data on mount
 * - Event-based updates take priority over context syncs to prevent overwriting optimistic updates
 */
export function CandyCounterOverlay({
  position = 'bottom-right',
  strategy = 'fixed',
}: {
  position?: 'bottom-left' | 'bottom-right' | 'top-right';
  strategy?: 'fixed' | 'absolute';
}) {
  const {user} = useAuth();

  // Store display value as string to prevent precision loss with large numbers
  const [displayCandy, setDisplayCandy] = useState<string>(() =>
    user?.rare_candy !== undefined ? String(user.rare_candy) : '0'
  );

  // Track last event-based update to prevent context sync from overwriting recent optimistic updates
  const lastEventValueRef = useRef<string | null>(null);

  // Sync with user context changes, but only if significantly different from current display
  // This prevents context sync from overwriting optimistic event-based updates
  useEffect(() => {
    if (user?.rare_candy === undefined || user.rare_candy === null) return;

    const contextValue = String(user.rare_candy);

    // If context value matches last event value, it's from our mutation - event already handled it
    if (lastEventValueRef.current === contextValue) {
      return;
    }

    // Use functional update to get current display value without adding it to deps
    setDisplayCandy((currentDisplay) => {
      // Only sync if the context value is significantly different from current display
      // This means it's a real change from another source, not just a delayed mutation response
      const contextDecimal = toDecimal(contextValue);
      const displayDecimal = toDecimal(currentDisplay);
      const difference = contextDecimal.minus(displayDecimal).abs();

      // Only update if there's a meaningful difference (more than 0.1 to account for rounding)
      // or if it's the initial mount (displayCandy is still '0' or initial value)
      if (difference.gt(0.1) || currentDisplay === '0') {
        return contextValue;
      }
      return currentDisplay; // No change needed
    });
  }, [user?.rare_candy]);

  // Subscribe to real-time candy update events from clicker/battle systems
  // Event-based updates take priority and are always applied immediately
  useEffect(() => {
    const unsubscribe = subscribeToCandyUpdates((amount) => {
      lastEventValueRef.current = amount; // Track this as the last event value
      setDisplayCandy(amount);
    });
    return unsubscribe;
  }, []);

  if (!user) return null;

  const positionClass =
    position === 'top-right'
      ? 'top-2 right-2'
      : position === 'bottom-right'
        ? 'bottom-4 right-4'
        : 'bottom-4 left-4';

  return (
    <aside
      className={`${strategy} ${positionClass} z-50 pointer-events-none`}
      aria-label="Candy counter display"
    >
      <dl
        data-onboarding="candy-counter"
        className="flex items-center gap-2 h-12 px-3 border-2 shadow-[3px_3px_0px_rgba(0,0,0,1)] pixel-font font-bold text-sm"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'black',
          color: 'var(--foreground)',
        }}
      >
        <dt className="w-6 h-6">
          <img
            src={`${import.meta.env.BASE_URL}candy.webp`}
            alt="Rare candy icon"
            className="w-6 h-6"
          />
        </dt>
        <dd>{formatNumber(displayCandy)}</dd>
      </dl>
    </aside>
  );
}
