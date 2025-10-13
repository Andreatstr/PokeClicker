import {type PokedexPokemon} from '@/hooks/usePokedexQuery';
import {usePurchasePokemon} from '@/hooks/usePurchasePokemon';
import '@/components/ui/pixelact-ui/styles/patterns.css';
import {useState} from 'react';

interface PokemonCardProps {
  pokemon: PokedexPokemon;
  onClick?: (pokemon: PokedexPokemon) => void;
}

// Helper to calculate Pokemon purchase cost (matches backend)
function getPokemonCost(pokemonId: number): number {
  return Math.floor(100 + (pokemonId / 10));
}

function getContrastColor(bgColor: string): string {
  // Map Tailwind color classes to their hex values
  const colorMap: Record<string, string> = {
    'bg-gray-400': '#9ca3af',
    'bg-red-500': '#ef4444',
    'bg-blue-500': '#3b82f6',
    'bg-yellow-400': '#facc15',
    'bg-green-500': '#22c55e',
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

  const luminance = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);

  // Return black for light backgrounds (luminance > 0.179 gives ~4.5:1 contrast), white for dark
  return luminance > 0.179 ? 'text-black' : 'text-white';
}

function getTypeColors(type: string) {
  const typeColorMap: Record<
    string,
    {badge: string; cardBg: string; cardBorder: string; shadow: string}
  > = {
    normal: {
      badge: 'bg-gray-400',
      cardBg: 'bg-gradient-to-br from-gray-100 to-gray-200',
      cardBorder: 'border-gray-400',
      shadow: 'shadow-gray-400/50',
    },
    fire: {
      badge: 'bg-red-500',
      cardBg: 'bg-red-300',
      cardBorder: 'border-red-400',
      shadow: 'shadow-red-400/50',
    },
    water: {
      badge: 'bg-blue-500',
      cardBg: 'bg-gradient-to-br from-blue-50 to-blue-100',
      cardBorder: 'border-blue-400',
      shadow: 'shadow-blue-400/50',
    },
    electric: {
      badge: 'bg-yellow-400',
      cardBg: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
      cardBorder: 'border-yellow-400',
      shadow: 'shadow-yellow-400/50',
    },
    grass: {
      badge: 'bg-green-500',
      cardBg: 'bg-green-200',
      cardBorder: 'border-green-400',
      shadow: 'shadow-green-400/50',
    },
    ice: {
      badge: 'bg-blue-200',
      cardBg: 'bg-gradient-to-br from-cyan-50 to-cyan-100',
      cardBorder: 'border-cyan-300',
      shadow: 'shadow-cyan-300/50',
    },
    fighting: {
      badge: 'bg-red-700',
      cardBg: 'bg-gradient-to-br from-red-100 to-red-200',
      cardBorder: 'border-red-600',
      shadow: 'shadow-red-600/50',
    },
    poison: {
      badge: 'bg-purple-500',
      cardBg: 'bg-gradient-to-br from-purple-50 to-purple-100',
      cardBorder: 'border-purple-400',
      shadow: 'shadow-purple-400/50',
    },
    ground: {
      badge: 'bg-yellow-600',
      cardBg: 'bg-gradient-to-br from-amber-50 to-amber-100',
      cardBorder: 'border-amber-400',
      shadow: 'shadow-amber-400/50',
    },
    flying: {
      badge: 'bg-indigo-400',
      cardBg: 'bg-gradient-to-br from-indigo-50 to-indigo-100',
      cardBorder: 'border-indigo-300',
      shadow: 'shadow-indigo-300/50',
    },
    psychic: {
      badge: 'bg-pink-500',
      cardBg: 'bg-gradient-to-br from-pink-50 to-pink-100',
      cardBorder: 'border-pink-400',
      shadow: 'shadow-pink-400/50',
    },
    bug: {
      badge: 'bg-green-400',
      cardBg: 'bg-gradient-to-br from-lime-50 to-lime-100',
      cardBorder: 'border-lime-400',
      shadow: 'shadow-lime-400/50',
    },
    rock: {
      badge: 'bg-yellow-800',
      cardBg: 'bg-gradient-to-br from-stone-50 to-stone-100',
      cardBorder: 'border-stone-400',
      shadow: 'shadow-stone-400/50',
    },
    ghost: {
      badge: 'bg-purple-700',
      cardBg: 'bg-gradient-to-br from-violet-50 to-violet-100',
      cardBorder: 'border-violet-400',
      shadow: 'shadow-violet-400/50',
    },
    dragon: {
      badge: 'bg-indigo-700',
      cardBg: 'bg-gradient-to-br from-indigo-100 to-indigo-200',
      cardBorder: 'border-indigo-600',
      shadow: 'shadow-indigo-600/50',
    },
    dark: {
      badge: 'bg-gray-800',
      cardBg: 'bg-gradient-to-br from-slate-100 to-slate-200',
      cardBorder: 'border-slate-600',
      shadow: 'shadow-slate-600/50',
    },
    steel: {
      badge: 'bg-gray-500',
      cardBg: 'bg-gradient-to-br from-gray-50 to-gray-100',
      cardBorder: 'border-gray-500',
      shadow: 'shadow-gray-500/50',
    },
    fairy: {
      badge: 'bg-pink-300',
      cardBg: 'bg-gradient-to-br from-pink-25 to-pink-50',
      cardBorder: 'border-pink-300',
      shadow: 'shadow-pink-300/50',
    },
  };

  return typeColorMap[type] || typeColorMap.normal;
}

function getBackgroundImageUrl(types: string[]): string {
  const primaryType = types[0];
  return `${import.meta.env.BASE_URL}pokemon-type-bg/${primaryType}.png`;
}

export function PokemonCard({pokemon, onClick}: PokemonCardProps) {
  const primaryType = pokemon.types[0];
  const typeColors = getTypeColors(primaryType);
  const backgroundImageUrl = getBackgroundImageUrl(pokemon.types);
  const [purchasePokemon] = usePurchasePokemon();
  const [error, setError] = useState<string | null>(null);

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
      await purchasePokemon({
        variables: {pokemonId: pokemon.id},
      });
    } catch (err: any) {
      setError(err.message || 'Failed to purchase Pokémon');
      // Clear error after 3 seconds
      setTimeout(() => setError(null), 1200);
    }
  };

  return (
    <aside
      className={`relative cursor-pointer border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] p-4 w-full max-w-[280px] pixel-font flex flex-col items-center ${typeColors.cardBg}
        transition-all duration-200 ease-in-out
        hover:translate-y-[-4px] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)]`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${pokemon.name}`}
    >
      <figure
        className="spriteFrame border-2 border-black p-2 mb-4 flex items-center justify-center w-full"
        style={{
          backgroundImage: `url(${backgroundImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <img
          src={pokemon.sprite}
          alt={pokemon.isOwned ? pokemon.name : 'Unknown Pokémon'}
          className="w-full h-full object-contain origin-center"
          style={{
            imageRendering: 'pixelated',
            filter: pokemon.isOwned ? 'none' : 'brightness(0)',
          }}
        />
      </figure>

      <div
        className="bg-black/20 p-2 rounded-md w-full"
        style={{textShadow: '1px 1px 0 #FFF'}}
      >
        <div className="infoGrid grid grid-cols-1 grid-rows-[auto_minmax(28px,auto)_auto] gap-y-1 text-[10px] mb-4">
          <div className="row-start-1">
            <strong className="font-bold text-sm capitalize">{pokemon.name}</strong>
          </div>

          {/* Purchase Button or Pokemon Number */}
          <div className="row-start-2 flex items-center">
            {!pokemon.isOwned ? (
              <button
                onClick={handlePurchase}
                className={`w-full cursor-pointer px-3 py-1 text-[10px] font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all ${
                  error ? 'bg-red-500 text-white' : 'bg-yellow-400 text-black'
                }`}
                aria-label={`Purchase ${pokemon.name} for ${cost} rare candy`}
              >
                {error || `Buy (${cost} 🍬)`}
              </button>
            ) : (
              <span className="font-normal">#{pokemon.pokedexNumber}</span>
            )}
          </div>

          <div className="row-start-3 flex flex-wrap gap-1 mt-2">
            {pokemon.types.map((type) => {
              const typeColors = getTypeColors(type);
              const textColor = getContrastColor(typeColors.badge);
              return (
                <span
                  key={type}
                  className={`px-2 py-0.5 text-[8px] font-bold uppercase border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${typeColors.badge} ${textColor}`}
                  style={{textShadow: 'none'}}
                >
                  {type}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
