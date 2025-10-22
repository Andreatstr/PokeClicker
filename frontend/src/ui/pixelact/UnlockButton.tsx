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

  const priceTextSize = size === 'large' ? 'text-2xl' : 'text-lg';
  const candySize = size === 'large' ? 'w-6 h-6' : 'w-5 h-5';

  return (
    <button
      onClick={onClick}
      className={`group w-full cursor-pointer ${sizeClasses} font-bold border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-3px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-150 relative overflow-hidden ${
        error
          ? 'bg-red-500 text-white animate-shake'
          : 'bg-gradient-to-b from-yellow-300 via-yellow-400 to-yellow-500 text-black'
      }`}
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
              backgroundColor: isDarkMode ? 'rgba(51, 51, 51, 0.2)' : 'rgba(0, 0, 0, 0.2)',
              border: isDarkMode ? '1px solid rgba(51, 51, 51, 0.3)' : '1px solid rgba(0, 0, 0, 0.3)',
            }}
          >
            <span className={`${priceTextSize} font-bold`}>{cost}</span>
            <img
              src={`${import.meta.env.BASE_URL}candy.png`}
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
