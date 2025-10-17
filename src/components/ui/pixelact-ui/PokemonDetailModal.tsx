import {Dialog, DialogBody} from './dialog';
import {StackedProgress} from './StackedProgress';
import type {PokedexPokemon} from '@/hooks/usePokedexQuery';
import {usePokemonById} from '@/hooks/usePokemonById';
import {usePurchasePokemon} from '@/hooks/usePurchasePokemon';
import {useAuth} from '@/hooks/useAuth';
import {useQuery, gql} from '@apollo/client';
import {useState} from 'react';
import {UnlockButton} from '@/components/UnlockButton';
import './styles/animations.css';

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
}

// Helper to calculate Pokemon purchase cost (matches backend)
function getPokemonCost(pokemonId: number): number {
  return Math.floor(100 + pokemonId / 10);
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
      cardBg: 'bg-gradient-to-br from-red-50 to-red-100',
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
      cardBg: 'bg-gradient-to-br from-green-50 to-green-100',
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
}: Props) {
  const [purchasePokemon] = usePurchasePokemon();
  const {updateUser, user} = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const {data: userData} = useQuery(ME_QUERY);

  if (!pokemon) return null;

  const primaryType = pokemon.types[0];
  const typeColors = pokemon.isOwned
    ? getTypeColors(primaryType)
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
            className={`leftBox border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] p-3 md:p-4 w-full max-w-[400px] font-press-start flex flex-col items-center relative overflow-hidden ${typeColors.cardBg} ${isAnimating ? 'animate-dopamine-release' : ''}`}
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
                  const colors = getTypeColors(type);
                  return (
                    <span
                      key={type}
                      className={`${colors.badge} text-white text-[10px] md:text-xs font-bold px-2 py-1 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] uppercase`}
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
                      color="bg-red-300"
                      upgradeColor="bg-red-600"
                    />
                    <StackedProgress
                      baseValue={pokemon.stats?.attack ?? 0}
                      yourValue={pokemon.stats?.attack ?? 0}
                      max={255}
                      color="bg-orange-300"
                      upgradeColor="bg-orange-600"
                    />
                    <StackedProgress
                      baseValue={pokemon.stats?.defense ?? 0}
                      yourValue={pokemon.stats?.defense ?? 0}
                      max={255}
                      color="bg-blue-300"
                      upgradeColor="bg-blue-600"
                    />
                    <StackedProgress
                      baseValue={pokemon.stats?.spAttack ?? 0}
                      yourValue={pokemon.stats?.spAttack ?? 0}
                      max={255}
                      color="bg-purple-300"
                      upgradeColor="bg-purple-600"
                    />
                    <StackedProgress
                      baseValue={pokemon.stats?.spDefense ?? 0}
                      yourValue={pokemon.stats?.spDefense ?? 0}
                      max={255}
                      color="bg-yellow-300"
                      upgradeColor="bg-yellow-600"
                    />
                    <StackedProgress
                      baseValue={pokemon.stats?.speed ?? 0}
                      yourValue={pokemon.stats?.speed ?? 0}
                      max={255}
                      color="bg-pink-300"
                      upgradeColor="bg-pink-600"
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
              />
            )}
          </aside>

          {/* Evolution Section */}
          <div className="evolutionWrapper p-3 bg-[#a0c8ff] border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] text-xs md:text-sm w-full max-w-[400px] font-press-start">
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
