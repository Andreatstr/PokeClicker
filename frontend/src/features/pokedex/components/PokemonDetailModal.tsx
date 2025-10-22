import {Dialog, DialogBody, UnlockButton} from '@ui/pixelact';
import {StackedProgress} from '@features/clicker';
import type {PokedexPokemon} from '@features/pokedex';
import {usePokemonById, usePurchasePokemon} from '@features/pokedex';
import {useAuth} from '@features/auth';
import {useQuery, gql} from '@apollo/client';
import {useState} from 'react';
import '@ui/pixelact/styles/animations.css';
import {getTypeColors} from '../utils/typeColors';

const ME_QUERY = gql`
  query Me {
    me {
      _id
      owned_pokemon_ids
    }
  }
`;

interface Props {
  pokemon: PokedexPokemon | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectPokemon?: (id: number) => void;
  onPurchase?: (id: number) => void;
  isDarkMode?: boolean;
}

// Helper to calculate Pokemon purchase cost (matches backend)
function getPokemonCost(pokemonId: number): number {
  return Math.floor(100 + pokemonId / 10);
}


function getBackgroundImageUrl(types: string[]): string {
  const primaryType = types[0];
  return `${import.meta.env.BASE_URL}pokemon-type-bg/${primaryType}.png`;
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

function getStatBarColors(isDarkMode: boolean) {
  if (isDarkMode) {
    return {
      hp: { color: 'bg-red-500/60', upgradeColor: 'bg-red-400/80' },
      attack: { color: 'bg-orange-500/60', upgradeColor: 'bg-orange-400/80' },
      defense: { color: 'bg-blue-500/60', upgradeColor: 'bg-blue-400/80' },
      spAttack: { color: 'bg-purple-500/60', upgradeColor: 'bg-purple-400/80' },
      spDefense: { color: 'bg-yellow-500/60', upgradeColor: 'bg-yellow-400/80' },
      speed: { color: 'bg-pink-500/60', upgradeColor: 'bg-pink-400/80' },
    };
  } else {
    return {
      hp: { color: 'bg-red-300', upgradeColor: 'bg-red-600' },
      attack: { color: 'bg-orange-300', upgradeColor: 'bg-orange-600' },
      defense: { color: 'bg-blue-300', upgradeColor: 'bg-blue-600' },
      spAttack: { color: 'bg-purple-300', upgradeColor: 'bg-purple-600' },
      spDefense: { color: 'bg-yellow-300', upgradeColor: 'bg-yellow-600' },
      speed: { color: 'bg-pink-300', upgradeColor: 'bg-pink-600' },
    };
  }
}

function EvolutionPokemon({
  id,
  onSelectPokemon,
  showArrow,
  isOwned,
}: {
  id: number;
  onSelectPokemon?: (id: number) => void;
  showArrow: boolean;
  isOwned: boolean;
}) {
  const {data, loading} = usePokemonById(id);

  if (loading || !data?.pokemonById) {
    return (
      <div className="evolutionItem flex items-center gap-1 md:gap-2">
        <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-200 animate-pulse" />
        {showArrow && (
          <span className="evolutionArrow text-sm md:text-base">→</span>
        )}
      </div>
    );
  }

  const evo = data.pokemonById;

  return (
    <div className="evolutionItem flex items-center gap-1 md:gap-2">
      <button
        className="evolutionButton bg-transparent border-none p-0 cursor-pointer relative"
        onClick={() => onSelectPokemon?.(evo.id)}
        title={isOwned ? `View ${evo.name}` : 'Unknown Pokémon'}
      >
        {isOwned ? (
          <img
            src={evo.sprite}
            alt={evo.name}
            className="evolutionImage w-16 h-16 md:w-20 md:h-20 scale-110 md:scale-125 origin-center object-contain hover:scale-125 md:hover:scale-150 transition-transform duration-200 ease-in-out"
            style={{imageRendering: 'pixelated'}}
          />
        ) : (
          <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center">
            <span className="text-3xl md:text-4xl font-bold">?</span>
          </div>
        )}
      </button>
      {showArrow && (
        <span className="evolutionArrow text-2xl md:text-3xl">→</span>
      )}
    </div>
  );
}

export function PokemonDetailModal({
  pokemon,
  isOpen,
  onClose,
  onSelectPokemon,
  onPurchase,
  isDarkMode = false,
}: Props) {
  const [purchasePokemon] = usePurchasePokemon();
  const {updateUser, user} = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const {data: userData} = useQuery(ME_QUERY);

  if (!pokemon) return null;

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
  const cost = getPokemonCost(pokemon.id);
  const ownedPokemonIds = userData?.me?.owned_pokemon_ids || [];
  const statColors = getStatBarColors(isDarkMode);

  const handlePurchase = async (e: React.MouseEvent) => {
    e.stopPropagation();
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

      onPurchase?.(pokemon.id);
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
    <Dialog open={isOpen} onClose={onClose}>
      <DialogBody>
        {/* Mobile drawer handle */}
        <div className="md:hidden flex justify-center mb-2">
          <div className="w-12 h-1 bg-gray-400 rounded-full"></div>
        </div>

        <div className="flex flex-col gap-3 md:gap-4 items-center">
          {/* Pokemon Card */}
          <aside
            className={`leftBox border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] p-3 md:p-4 w-full max-w-[400px] font-press-start flex flex-col items-center relative overflow-hidden backdrop-blur-md ${typeColors.cardBg} ${isAnimating ? 'animate-dopamine-release' : ''}`}
            style={{
              backgroundColor: isDarkMode 
                ? 'rgba(0, 0, 0, 0.8)' 
                : 'rgba(255, 255, 255, 0.95)'
            }}
          >
            {/* Owned Corner Tape Badge */}
            {pokemon.isOwned && (
              <div className="absolute top-0 left-0 z-20 overflow-visible">
                <div className="relative w-0 h-0">
                  {/* Main tape */}
                  <div className="bg-green-500 text-white text-[11px] md:text-sm font-bold px-8 md:px-10 py-1.5 md:py-2 border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,0.4)] transform -rotate-45 origin-top-left translate-x-[-28px] translate-y-[62px] md:translate-x-[-33px] md:translate-y-[75px] min-w-[140px] md:min-w-[160px] text-center">
                    OWNED
                  </div>
                </div>
              </div>
            )}

            {/* Close Button */}
            <button
              className="absolute top-2 right-2 z-10 py-1 px-2 text-xs bg-red-500 text-white font-bold border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_rgba(0,0,0,1)] transition-all"
              onClick={onClose}
            >
              X
            </button>

            {/* Pokemon Name */}
            <h2 className="text-sm md:text-base font-bold text-center mb-2 md:mb-3 capitalize">
              {pokemon.isOwned ? pokemon.name : '???'}
            </h2>

            {/* Type Badges */}
            {pokemon.isOwned && (
              <div className="flex gap-2 mb-2 md:mb-3">
                {pokemon.types.map((type) => {
                  const colors = getTypeColors(type, isDarkMode);
                  const textColor = getContrastColor(colors.badge);
                  return (
                    <span
                      key={type}
                      className={`${colors.badge} ${textColor} text-[10px] md:text-xs font-bold px-2 py-1 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] uppercase`}
                      style={{textShadow: 'none'}}
                    >
                      {type}
                    </span>
                  );
                })}
              </div>
            )}

            <figure
              className="spriteFrame border-2 border-black p-2 mb-2 md:mb-3 flex items-center justify-center w-full h-[140px] md:h-[180px] relative"
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

            {/* Stats Section */}
            <section className="w-full bg-tranparent border-none p-2 md:p-3 mb-2 md:mb-3 font-press-start">
              <div className="statsSection">
                <div className="statsHeaderRow grid grid-cols-[1fr,4fr] mb-1 text-[10px] md:text-xs font-bold text-center">
                  <span></span>
                </div>

                <div className="statsGrid grid grid-cols-[1fr,4fr] grid-rows-auto gap-1">
                  <div className="statsLabels col-start-1 row-start-1 flex flex-col justify-between font-bold text-[10px] md:text-xs">
                    <span>HP</span>
                    <span>Attack</span>
                    <span>Defense</span>
                    <span>Sp. Atk</span>
                    <span>Sp. Def</span>
                    <span>Speed</span>
                  </div>
                  <div className="statsBars col-start-2 row-start-1 flex flex-col gap-1">
                    <StackedProgress
                      baseValue={pokemon.stats?.hp ?? 0}
                      yourValue={pokemon.stats?.hp ?? 0}
                      max={255}
                      color={statColors.hp.color}
                      upgradeColor={statColors.hp.upgradeColor}
                    />
                    <StackedProgress
                      baseValue={pokemon.stats?.attack ?? 0}
                      yourValue={pokemon.stats?.attack ?? 0}
                      max={255}
                      color={statColors.attack.color}
                      upgradeColor={statColors.attack.upgradeColor}
                    />
                    <StackedProgress
                      baseValue={pokemon.stats?.defense ?? 0}
                      yourValue={pokemon.stats?.defense ?? 0}
                      max={255}
                      color={statColors.defense.color}
                      upgradeColor={statColors.defense.upgradeColor}
                    />
                    <StackedProgress
                      baseValue={pokemon.stats?.spAttack ?? 0}
                      yourValue={pokemon.stats?.spAttack ?? 0}
                      max={255}
                      color={statColors.spAttack.color}
                      upgradeColor={statColors.spAttack.upgradeColor}
                    />
                    <StackedProgress
                      baseValue={pokemon.stats?.spDefense ?? 0}
                      yourValue={pokemon.stats?.spDefense ?? 0}
                      max={255}
                      color={statColors.spDefense.color}
                      upgradeColor={statColors.spDefense.upgradeColor}
                    />
                    <StackedProgress
                      baseValue={pokemon.stats?.speed ?? 0}
                      yourValue={pokemon.stats?.speed ?? 0}
                      max={255}
                      color={statColors.speed.color}
                      upgradeColor={statColors.speed.upgradeColor}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Purchase Button */}
            {!pokemon.isOwned && (
              <UnlockButton
                onClick={handlePurchase}
                cost={cost}
                error={error}
                pokemonName={pokemon.name}
                size="small"
                isDarkMode={isDarkMode}
              />
            )}
          </aside>

          {/* Evolution Section */}
          <div 
            className="evolutionWrapper p-3 border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] text-xs md:text-sm w-full max-w-[400px] font-press-start"
            style={{
              backgroundColor: isDarkMode 
                ? '#1e3a5f'  // Dark blue for dark mode
                : '#a0c8ff'  // Original light blue for light mode
            }}
          >
            <h3 className="font-bold mb-2">Evolution</h3>
            <div className="evolutionChain flex items-center justify-center gap-2 md:gap-3">
              {[pokemon.id, ...(pokemon.evolution ?? [])]
                .sort((a, b) => a - b)
                .map((id, i, arr) => (
                  <EvolutionPokemon
                    key={id}
                    id={id}
                    onSelectPokemon={onSelectPokemon}
                    showArrow={i < arr.length - 1}
                    isOwned={ownedPokemonIds.includes(id)}
                  />
                ))}
            </div>
          </div>
        </div>
      </DialogBody>
    </Dialog>
  );
}

export default PokemonDetailModal;
