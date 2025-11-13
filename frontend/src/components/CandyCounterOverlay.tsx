import {useAuth} from '@features/auth';
import {formatNumber} from '@/lib/formatNumber';

interface CandyCounterOverlayProps {
  isDarkMode?: boolean;
}

export function CandyCounterOverlay({
  isDarkMode = false,
}: CandyCounterOverlayProps) {
  const {user} = useAuth();

  if (!user) return null;

  return (
    <aside
      className="fixed bottom-4 right-4 z-50 pointer-events-none"
      aria-label="Candy counter display"
    >
      <dl
        data-onboarding="candy-counter"
        className="flex items-center gap-2 px-3 py-2 border-2 shadow-[3px_3px_0px_rgba(0,0,0,1)] pixel-font font-bold text-sm"
        style={{
          backgroundColor: isDarkMode ? '#1f2937' : '#f3f4f6',
          borderColor: 'black',
          color: isDarkMode ? 'white' : 'black',
        }}
      >
        <dt className="w-5 h-5">
          <img
            src={`${import.meta.env.BASE_URL}candy.webp`}
            alt=""
            className="w-5 h-5"
            aria-hidden="true"
          />
        </dt>
        <dd>{formatNumber(user.rare_candy)}</dd>
      </dl>
    </aside>
  );
}
