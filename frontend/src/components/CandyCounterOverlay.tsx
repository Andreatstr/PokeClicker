import {useEffect, useState} from 'react';
import {useAuth} from '@features/auth';
import {formatNumber} from '@/lib/formatNumber';
import {subscribeToCandyUpdates} from '@/lib/candyEvents';

export function CandyCounterOverlay({
  position = 'bottom-right',
  strategy = 'fixed',
}: {
  position?: 'bottom-left' | 'bottom-right' | 'top-right';
  strategy?: 'fixed' | 'absolute';
}) {
  const {user} = useAuth();

  const [displayCandy, setDisplayCandy] = useState<string>(() =>
    user?.rare_candy !== undefined ? String(user.rare_candy) : '0'
  );

  useEffect(() => {
    if (user?.rare_candy === undefined || user.rare_candy === null) return;
    setDisplayCandy(String(user.rare_candy));
  }, [user?.rare_candy]);

  useEffect(() => {
    const unsubscribe = subscribeToCandyUpdates((amount) => {
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
