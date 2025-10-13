import {Dialog, DialogBody} from './dialog';
import {StackedProgress} from './StackedProgress';
import type {PokedexPokemon} from '@/hooks/usePokedexQuery';
import {usePokemonById} from '@/hooks/usePokemonById';
import {usePurchasePokemon} from '@/hooks/usePurchasePokemon';
import {useQuery, gql} from '@apollo/client';
import {useState} from 'react';

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
}

// Helper to calculate Pokemon purchase cost (matches backend)
function getPokemonCost(pokemonId: number): number {
  return Math.floor(100 + (pokemonId / 10));
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
      <div className="evolutionItem flex items-center gap-2">
        <div className="w-24 h-24 bg-gray-200 animate-pulse" />
        {showArrow && <span className="evolutionArrow text-base">→</span>}
      </div>
    );
  }

  const evo = data.pokemonById;

  return (
    <div className="evolutionItem flex items-center gap-2">
      <button
        className="evolutionButton bg-transparent border-none p-0 cursor-pointer relative"
        onClick={() => onSelectPokemon?.(evo.id)}
        title={isOwned ? `View ${evo.name}` : 'Unknown Pokémon'}
      >
        {isOwned ? (
          <img
            src={evo.sprite}
            alt={evo.name}
            className="evolutionImage w-24 h-24 scale-125 origin-center object-contain hover:scale-110"
            style={{imageRendering: 'pixelated'}}
          />
        ) : (
          <div className="w-24 h-24 flex items-center justify-center">
            <span className="text-6xl font-bold">?</span>
          </div>
        )}
      </button>
      {showArrow && <span className="evolutionArrow text-base">→</span>}
    </div>
  );
}

export function PokemonDetailModal({
  pokemon,
  isOpen,
  onClose,
  onSelectPokemon,
}: Props) {
  const [purchasePokemon] = usePurchasePokemon();
  const [error, setError] = useState<string | null>(null);
  const {data: userData} = useQuery(ME_QUERY);

  if (!pokemon) return null;

  const primaryType = pokemon.types[0];
  const typeColors = getTypeColors(primaryType);
  const backgroundImageUrl = getBackgroundImageUrl(pokemon.types);
  const cost = getPokemonCost(pokemon.id);
  const ownedPokemonIds = userData?.me?.owned_pokemon_ids || [];

  const handlePurchase = async () => {
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
    <Dialog open={isOpen} onClose={onClose}>
      <button
        className="absolute top-2 right-2 py-1 px-2 text-xs bg-red-500 text-white font-bold border-2 border-black"
        onClick={onClose}
      >
        X
      </button>
      <DialogBody>
        <div className="flex items-center justify-center relative mb-4">
          <h2 className="text-base font-bold font-press-start text-center">
            {pokemon.isOwned ? pokemon.name : '???'}
          </h2>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Side */}
          <aside
            className={`leftBox border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] p-4 w-full max-w-[400px] font-press-start flex flex-col items-center ${typeColors.cardBg}`}
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
              <div className="infoGrid grid grid-cols-1 gap-x-4 gap-y-1 text-[10px] mb-4">
                <div>
                  <strong className="font-bold">Height:</strong>{' '}
                  <span className="font-normal">{pokemon.height ?? '—'}</span>
                </div>
                <div>
                  <strong className="font-bold">Weight:</strong>{' '}
                  <span className="font-normal">{pokemon.weight ?? '—'}</span>
                </div>
                <div>
                  <strong className="font-bold">Gender:</strong>{' '}
                  <span className="font-normal">—</span>
                </div>
                <div>
                  <strong className="font-bold">Habitat:</strong>{' '}
                  <span className="font-normal">—</span>
                </div>

                <div className="abilitiesList text-[10px]">
                  <strong className="font-bold">Abilities:</strong>
                  <ul className="list-disc pl-4 mt-1">
                    {pokemon.abilities?.map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Purchase Button */}
              {!pokemon.isOwned && (
                <button
                  onClick={handlePurchase}
                  className={`mt-3 w-full px-4 py-2 text-xs font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all ${
                    error ? 'bg-red-500 text-white' : 'bg-yellow-400 text-black'
                  }`}
                  aria-label={`Purchase ${pokemon.name} for ${cost} rare candy`}
                >
                  {error || `Purchase for ${cost} 🍬`}
                </button>
              )}

              {/* Owned Badge */}
              {pokemon.isOwned && (
                <div className="mt-3 w-full px-4 py-2 text-xs font-bold bg-green-500 text-Black border-2 border-black text-center">
                  Owned
                </div>
              )}
            </div>
          </aside>

          {/* Right Side */}
          <div className="flex flex-col gap-6 flex-1">
            <section className="rightBox bg-[#b0f0b0] border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] p-4 font-press-start">
              {/* Stats Section */}
              <div className="statsSection">
                <div className="statsHeaderRow grid grid-cols-[1fr,4fr] mb-2 text-xs font-bold text-center">
                  <span></span>
                  <span>Stats</span>
                </div>

                <div className="statsGrid grid grid-cols-[1fr,4fr] grid-rows-auto gap-2">
                  <div className="statsLabels col-start-1 row-start-1 flex flex-col justify-between font-bold text-xs">
                    <span>HP</span>
                    <span>Attack</span>
                    <span>Defense</span>
                    <span>Sp. Atk</span>
                    <span>Sp. Def</span>
                    <span>Speed</span>
                  </div>
                  <div className="statsBars col-start-2 row-start-1 flex flex-col gap-2">
                    <StackedProgress
                      baseValue={pokemon.stats?.hp ?? 0}
                      yourValue={pokemon.stats?.hp ?? 0}
                      max={255}
                    />
                    <StackedProgress
                      baseValue={pokemon.stats?.attack ?? 0}
                      yourValue={pokemon.stats?.attack ?? 0}
                      max={255}
                    />
                    <StackedProgress
                      baseValue={pokemon.stats?.defense ?? 0}
                      yourValue={pokemon.stats?.defense ?? 0}
                      max={255}
                    />
                    <StackedProgress
                      baseValue={pokemon.stats?.spAttack ?? 0}
                      yourValue={pokemon.stats?.spAttack ?? 0}
                      max={255}
                    />
                    <StackedProgress
                      baseValue={pokemon.stats?.spDefense ?? 0}
                      yourValue={pokemon.stats?.spDefense ?? 0}
                      max={255}
                    />
                    <StackedProgress
                      baseValue={pokemon.stats?.speed ?? 0}
                      yourValue={pokemon.stats?.speed ?? 0}
                      max={255}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Evolution Section */}
            <div className="evolutionWrapper p-4 bg-[#a0c8ff] border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] text-sm">
              <h3>Evolution</h3>
              <div className="evolutionChain flex items-center justify-center gap-4">
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
        </div>
      </DialogBody>
    </Dialog>
  );
}

export default PokemonDetailModal;
