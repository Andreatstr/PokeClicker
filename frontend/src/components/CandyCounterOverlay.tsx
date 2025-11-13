import {useAuth} from '@features/auth';
import {formatNumber} from '@/lib/formatNumber';

interface CandyCounterOverlayProps {
  isDarkMode?: boolean;
  position?: 'bottom-left' | 'bottom-right' | 'top-right';
  strategy?: 'fixed' | 'absolute';
}

export function CandyCounterOverlay({
  isDarkMode = false,
  position = 'bottom-right',
  strategy = 'fixed',
}: CandyCounterOverlayProps) {
  const {user} = useAuth();

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
          backgroundColor: isDarkMode ? '#1f2937' : '#f3f4f6',
          borderColor: 'black',
          color: isDarkMode ? 'white' : 'black',
        }}
      >
        <figure className="w-6 h-6">
          <img
            src={`${import.meta.env.BASE_URL}candy.webp`}
            alt="Candy"
            className="w-6 h-6"
          />
        </figure>
        <dd>{formatNumber(user.rare_candy)}</dd>
      </dl>
    </aside>
  );
}
