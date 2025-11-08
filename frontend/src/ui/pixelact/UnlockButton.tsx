import {formatNumber} from '@/lib/formatNumber';

interface UnlockButtonProps {
  onClick: (e: React.MouseEvent) => void;
  cost: number;
  error: string | null;
  pokemonName: string;
  size?: 'small' | 'large';
  isDarkMode?: boolean;
}

export function UnlockButton({
  onClick,
  cost,
  error,
  pokemonName,
  size = 'small',
  isDarkMode = false,
}: UnlockButtonProps) {
  const sizeClasses =
    size === 'large' ? 'px-6 py-4 text-base' : 'px-4 py-3 text-sm';

  const priceTextSize = size === 'large' ? 'text-xs' : 'text-[10px]';
  const candySize = size === 'large' ? 'w-5 h-5' : 'w-4 h-4';

  const focusRingColor = isDarkMode ? 'white' : '#0066ff';
  const focusOffsetColor = isDarkMode ? '#1a1a1a' : 'white';

  return (
    <button
      onClick={onClick}
      className={`group w-full cursor-pointer min-h-[44px] ${sizeClasses} font-bold border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-3px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus-visible:outline-none transition-all duration-150 relative overflow-hidden ${
        error
          ? 'bg-red-500 text-white animate-shake'
          : 'bg-gradient-to-b from-yellow-300 via-yellow-400 to-yellow-500 text-black'
      }`}
      style={
        {
          '--focus-ring-color': focusRingColor,
          '--focus-offset-color': focusOffsetColor,
        } as React.CSSProperties & {
          '--focus-ring-color': string;
          '--focus-offset-color': string;
        }
      }
      onFocus={(e) => {
        e.currentTarget.style.boxShadow = `0 0 0 2px ${focusOffsetColor}, 0 0 0 6px ${focusRingColor}`;
      }}
      onBlur={(e) => {
        e.currentTarget.style.boxShadow = '4px 4px 0px 0px rgba(0,0,0,1)';
      }}
      aria-label={`Purchase ${pokemonName} for ${cost} rare candy`}
    >
      {!error && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
      )}
      {error ? (
        <span className="relative z-10">{error}</span>
      ) : (
        <span className="relative z-10 flex items-center justify-center gap-2">
          <span className="text-xs uppercase tracking-wider drop-shadow-[1px_1px_0px_rgba(51,51,51,0.5)]">
            Unlock
          </span>
          <span
            className="flex items-center gap-1 px-2 py-1 rounded"
            style={{
              backgroundColor: isDarkMode
                ? 'rgba(51, 51, 51, 0.2)'
                : 'rgba(0, 0, 0, 0.2)',
              border: isDarkMode
                ? '1px solid rgba(51, 51, 51, 0.3)'
                : '1px solid rgba(0, 0, 0, 0.3)',
            }}
          >
            <span className={`${priceTextSize} font-bold`}>
              {formatNumber(cost)}
            </span>
            <img
              src={`${import.meta.env.BASE_URL}candy.webp`}
              alt="candy"
              className={`${candySize} inline-block group-hover:scale-110 transition-transform`}
              style={{imageRendering: 'pixelated'}}
            />
          </span>
        </span>
      )}
    </button>
  );
}
