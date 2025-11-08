import type {PokemonBasic} from '../hooks/usePokemonBasic';

interface PokemonDisplayButtonProps {
  pokemon: PokemonBasic | null | undefined;
  onClick: () => void;
  disabled?: boolean;
  title: string;
  emptyTitle: string;
  isDarkMode?: boolean;
  isFirstRender?: boolean;
}

export function PokemonDisplayButton({
  pokemon,
  onClick,
  disabled = false,
  title,
  emptyTitle,
  isDarkMode = false,
  isFirstRender = false,
}: PokemonDisplayButtonProps) {
  if (pokemon) {
    return (
      <button
        onClick={onClick}
        className={`px-6 py-4 border-4 transition-all hover:scale-105 cursor-pointer flex items-center gap-4 w-full sm:w-auto sm:min-w-[200px] focus-visible:ring-2 ${isDarkMode ? 'focus-visible:ring-white' : 'focus-visible:ring-[#0066ff]'}  focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]`}
        style={{
          borderColor: isDarkMode ? '#333333' : 'black',
          backgroundColor: isDarkMode ? '#2a2a2a' : '#f5f1e8',
        }}
        title={title}
      >
        <img
          src={pokemon.sprite}
          alt=""
          className="w-16 h-16 sm:w-20 sm:h-20 object-contain flex-shrink-0"
          width={80}
          height={80}
          fetchPriority={isFirstRender ? 'high' : 'auto'}
          decoding="async"
          style={{imageRendering: 'pixelated'}}
        />
        <p className="text-sm sm:text-base capitalize font-bold text-left flex-1">
          {pokemon.name}
        </p>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-6 py-4 border-4 transition-all hover:scale-105 flex items-center gap-4 w-full sm:w-auto sm:min-w-[200px]"
      style={{
        borderColor: isDarkMode ? '#333333' : 'black',
        backgroundColor: disabled ? '#555' : isDarkMode ? '#2a2a2a' : '#f5f1e8',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}
      title={emptyTitle}
    >
      <div
        className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center text-4xl sm:text-5xl flex-shrink-0"
        style={{
          color: isDarkMode ? '#666' : '#999',
          minWidth: '80px',
          minHeight: '80px',
        }}
      >
        ?
      </div>
      <p
        className="text-sm sm:text-base font-bold text-left flex-1"
        style={{color: isDarkMode ? '#666' : '#999'}}
      >
        None
      </p>
    </button>
  );
}
