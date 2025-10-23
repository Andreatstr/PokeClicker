import {type PokedexPokemon, usePurchasePokemon} from '@features/pokedex';
import {useAuth} from '@features/auth';
import '@ui/pixelact/styles/patterns.css';
import {useState, memo} from 'react';
import {UnlockButton} from '@ui/pixelact';
import {getTypeColors} from '../utils/typeColors';

interface PokemonCardProps {
  pokemon: PokedexPokemon;
  onClick?: (pokemon: PokedexPokemon) => void;
  isDarkMode?: boolean;
}

// Helper to calculate Pokemon purchase cost (matches backend)
function getPokemonCost(pokemonId: number): number {
  return Math.floor(100 + pokemonId / 10);
}

function getContrastColor(bgColor: string): string {
  // Map Tailwind color classes to their hex values
  const colorMap: Record<string, string> = {
    'bg-gray-400': '#9ca3af',
    'bg-red-500': '#ef4444',
    'bg-blue-500': '#3b82f6',
    'bg-yellow-400': '#facc15',
    'bg-green-500': '#22c55e',
    'bg-green-600': '#16a34a',
    'bg-blue-200': '#bfdbfe',
    'bg-red-700': '#b91c1c',
    'bg-purple-500': '#a855f7',
    'bg-yellow-600': '#ca8a04',
    'bg-indigo-400': '#818cf8',
    'bg-pink-500': '#ec4899',
    'bg-green-400': '#4ade80',
    'bg-yellow-800': '#854d0e',
    'bg-purple-700': '#7e22ce',
    'bg-indigo-700': '#4338ca',
    'bg-gray-800': '#1f2937',
    'bg-gray-500': '#6b7280',
    'bg-pink-300': '#f9a8d4',
    // Dark mode colors (solid)
    'bg-red-600': '#dc2626',
    'bg-blue-600': '#2563eb',
    'bg-yellow-600': '#ca8a04',
    'bg-green-600': '#16a34a',
    'bg-purple-600': '#9333ea',
    'bg-pink-600': '#db2777',
    'bg-cyan-500': '#06b6d4',
    'bg-indigo-600': '#4f46e5',
    'bg-lime-600': '#65a30d',
    'bg-stone-600': '#57534e',
    'bg-violet-600': '#7c3aed',
    'bg-slate-700': '#334155',
    'bg-gray-600': '#4b5563',
    'bg-pink-500': '#ec4899',
    'bg-red-700': '#b91c1c',
    'bg-amber-600': '#d97706',
    // Additional dark mode colors
    'bg-lime-500': '#84cc16',
    'bg-lime-600': '#65a30d',
    'bg-stone-500': '#78716c',
    'bg-stone-600': '#57534e',
    'bg-violet-500': '#8b5cf6',
    'bg-violet-600': '#7c3aed',
    'bg-indigo-700': '#4338ca',
    'bg-slate-600': '#475569',
    'bg-slate-700': '#334155',
    'bg-cyan-400': '#22d3ee',
    'bg-cyan-500': '#06b6d4',
    'bg-pink-400': '#f472b6',
    'bg-pink-500': '#ec4899',
    // Darker dark mode colors (700-800 range)
    'bg-red-700': '#b91c1c',
    'bg-red-800': '#991b1b',
    'bg-blue-700': '#1d4ed8',
    'bg-yellow-700': '#a16207',
    'bg-green-700': '#15803d',
    'bg-cyan-600': '#0891b2',
    'bg-purple-700': '#7e22ce',
    'bg-amber-700': '#a16207',
    'bg-indigo-700': '#4338ca',
    'bg-indigo-800': '#3730a3',
    'bg-pink-700': '#be185d',
    'bg-lime-700': '#4d7c0f',
    'bg-stone-700': '#44403c',
    'bg-violet-700': '#6d28d9',
    'bg-slate-800': '#1e293b',
    'bg-gray-700': '#374151',
    // Even darker dark mode colors (800-900 range)
    'bg-red-800': '#991b1b',
    'bg-red-900': '#7f1d1d',
    'bg-blue-800': '#1e40af',
    'bg-yellow-800': '#854d0e',
    'bg-green-800': '#166534',
    'bg-cyan-700': '#0e7490',
    'bg-purple-800': '#6b21a8',
    'bg-amber-800': '#92400e',
    'bg-indigo-800': '#3730a3',
    'bg-indigo-900': '#312e81',
    'bg-pink-800': '#9d174d',
    'bg-lime-800': '#365314',
    'bg-stone-800': '#292524',
    'bg-violet-800': '#5b21b6',
    'bg-slate-900': '#0f172a',
    'bg-gray-800': '#1f2937',
  };

  const hex = colorMap[bgColor] || '#000000';

  // Convert hex to RGB
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  // Calculate relative luminance using proper sRGB formula
  const toLinear = (c: number) => {
    const val = c / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  };

  const luminance =
    0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);

  // Return black for light backgrounds (luminance > 0.5 gives better contrast), white for dark
  return luminance > 0.5 ? 'text-black' : 'text-white';
}


function getBackgroundImageUrl(types: string[]): string {
  const primaryType = types[0];
  return `${import.meta.env.BASE_URL}pokemon-type-bg/${primaryType}.png`;
}

export const PokemonCard = memo(function PokemonCard({pokemon, onClick, isDarkMode = false}: PokemonCardProps) {
  const primaryType = pokemon.types[0];
  const typeColors = pokemon.isOwned
    ? getTypeColors(primaryType, isDarkMode)
    : isDarkMode
    ? {
        badge: 'bg-gray-500',
        cardBg: 'bg-gradient-to-br from-gray-700 to-gray-800',
        cardBorder: 'border-gray-600',
        shadow: 'shadow-gray-600/50',
      }
    : {
        badge: 'bg-gray-400',
        cardBg: 'bg-gradient-to-br from-gray-200 to-gray-300',
        cardBorder: 'border-gray-400',
        shadow: 'shadow-gray-400/50',
      };
  const backgroundImageUrl = pokemon.isOwned
    ? getBackgroundImageUrl(pokemon.types)
    : `${import.meta.env.BASE_URL}pokemon-type-bg/unknown.png`;
  const [purchasePokemon] = usePurchasePokemon();
  const {updateUser, user} = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const cost = getPokemonCost(pokemon.id);

  const handleClick = () => {
    onClick?.(pokemon);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const handlePurchase = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setError(null);

    try {
      const result = await purchasePokemon({
        variables: {pokemonId: pokemon.id},
      });

      // Immediately update AuthContext with the server response
      if (result.data?.purchasePokemon && user) {
        updateUser({
          ...result.data.purchasePokemon,
          created_at: user.created_at, // Preserve the created_at field
        });
      }

      // Trigger animation after successful purchase
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 800); // Animation duration
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to purchase Pokémon';
      setError(errorMessage);
      // Clear error after 1.2 seconds
      setTimeout(() => setError(null), 1200);
    }
  };

  return (
    <aside
      className={`relative cursor-pointer border-4 p-4 w-full max-w-[280px] h-[440px] pixel-font flex flex-col items-center ${typeColors.cardBg}
        transition-all duration-200 ease-in-out
        hover:translate-y-[-4px] ${isAnimating ? 'animate-dopamine-release' : ''}`}
      style={{
        borderColor: isDarkMode ? '#333333' : 'black',
        boxShadow: isDarkMode 
          ? '4px 4px 0px rgba(51,51,51,1)' 
          : '4px 4px 0px rgba(0,0,0,1)',
      }}
      onMouseEnter={(e) => {
        if (!isAnimating) {
          e.currentTarget.style.boxShadow = isDarkMode 
            ? '6px 6px 0px rgba(51,51,51,1)' 
            : '6px 6px 0px rgba(0,0,0,1)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isAnimating) {
          e.currentTarget.style.boxShadow = isDarkMode 
            ? '4px 4px 0px rgba(51,51,51,1)' 
            : '4px 4px 0px rgba(0,0,0,1)';
        }
      }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${pokemon.name}`}
    >
      <figure
        className="spriteFrame border-2 p-2 mb-3 flex items-center justify-center w-full h-[210px] relative flex-shrink-0"
        style={{
          borderColor: isDarkMode ? '#333333' : 'black',
          backgroundImage: `url(${backgroundImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <img
          src={pokemon.sprite}
          alt={pokemon.isOwned ? pokemon.name : 'Unknown Pokémon'}
          className="w-full h-full object-contain origin-center"
          loading="lazy"
          style={{
            imageRendering: 'pixelated',
            filter: pokemon.isOwned ? 'none' : 'brightness(0)',
          }}
        />
      </figure>

      <div
        className="bg-black/20 p-2 rounded-md w-full flex-1 flex flex-col overflow-hidden"
        style={{textShadow: '1px 1px 0 var(--background)'}}
      >
        <div className="infoGrid flex flex-col gap-1.5 text-[10px] flex-1">
          {/* Pokemon Name */}
          <div className="flex items-center justify-between min-h-[20px]">
            <strong className="font-bold text-sm capitalize truncate">
              {pokemon.isOwned ? pokemon.name : '???'}
            </strong>
            {pokemon.isOwned && (
              <span 
                className="font-normal text-[9px] px-2 py-0.5 rounded whitespace-nowrap ml-2"
                style={{
                  backgroundColor: isDarkMode ? 'rgba(51, 51, 51, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                  border: isDarkMode ? '1px solid rgba(51, 51, 51, 0.3)' : '1px solid rgba(0, 0, 0, 0.3)',
                  color: isDarkMode ? 'var(--foreground)' : 'var(--foreground)',
                  textShadow: isDarkMode ? '1px 1px 0 rgba(0, 0, 0, 0.8)' : '1px 1px 0 rgba(255, 255, 255, 0.8)'
                }}
              >
                #{pokemon.pokedexNumber}
              </span>
            )}
          </div>

          {/* Purchase Button or Info Grid */}
          {!pokemon.isOwned ? (
            <UnlockButton
              onClick={handlePurchase}
              cost={cost}
              error={error}
              pokemonName={pokemon.name}
              size="small"
              isDarkMode={isDarkMode}
            />
          ) : (
            <>
              {/* Info Grid */}
              <div className="flex gap-2 text-[9px]">
                <div 
                  className="flex-1 rounded px-2 py-1"
                  style={{
                    backgroundColor: isDarkMode ? 'rgba(51, 51, 51, 0.1)' : 'rgba(255, 255, 255, 0.3)',
                    border: isDarkMode ? '1px solid rgba(51, 51, 51, 0.2)' : '1px solid rgba(0, 0, 0, 0.2)',
                  }}
                >
                  <div className="font-bold text-[8px] uppercase tracking-wide" style={{color: 'var(--muted-foreground)'}}>
                    Height
                  </div>
                  <div className="font-bold text-[11px] tabular-nums">
                    {pokemon.height ?? '—'}
                  </div>
                </div>
                <div 
                  className="flex-1 rounded px-2 py-1"
                  style={{
                    backgroundColor: isDarkMode ? 'rgba(51, 51, 51, 0.1)' : 'rgba(255, 255, 255, 0.3)',
                    border: isDarkMode ? '1px solid rgba(51, 51, 51, 0.2)' : '1px solid rgba(0, 0, 0, 0.2)',
                  }}
                >
                  <div className="font-bold text-[8px] uppercase tracking-wide" style={{color: 'var(--muted-foreground)'}}>
                    Weight
                  </div>
                  <div className="font-bold text-[11px] tabular-nums">
                    {pokemon.weight ?? '—'}
                  </div>
                </div>
              </div>

              {/* Abilities */}
              {pokemon.abilities && pokemon.abilities.length > 0 && (
                <div className="text-[9px]">
                  <strong className="font-bold text-[8px]">Abilities</strong>
                  <div className="flex flex-wrap gap-0.5 mt-0.5">
                    {pokemon.abilities.map((ability) => (
                      <span
                        key={ability}
                        className="px-1.5 py-0.5 rounded text-[7.5px] whitespace-nowrap leading-tight"
                        style={{
                          backgroundColor: isDarkMode ? 'rgba(51, 51, 51, 0.2)' : 'rgba(255, 255, 255, 0.5)',
                          border: isDarkMode ? '1px solid rgba(51, 51, 51, 0.2)' : '1px solid rgba(0, 0, 0, 0.2)',
                        }}
                      >
                        {ability}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Type Tags */}
          {pokemon.isOwned && (
            <div className="flex flex-wrap gap-1 mt-auto pt-2 min-h-[24px]">
              {pokemon.types.map((type) => {
                const typeColors = getTypeColors(type, isDarkMode);
                const textColor = getContrastColor(typeColors.badge);
                return (
                  <span
                    key={type}
                    className={`px-2 py-0.5 text-[8px] font-bold uppercase border-2 ${typeColors.badge} ${textColor}`}
                    style={{
                      textShadow: 'none',
                      borderColor: isDarkMode ? '#333333' : 'black',
                      boxShadow: isDarkMode 
                        ? '2px 2px 0px 0px rgba(51,51,51,1)' 
                        : '2px 2px 0px 0px rgba(0,0,0,1)',
                    }}
                  >
                    {type}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
});
