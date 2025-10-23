import {Dialog, DialogBody, UnlockButton} from '@ui/pixelact';
import {StackedProgress} from '@features/clicker';
import type {PokedexPokemon} from '@features/pokedex';
import {usePokemonById, usePurchasePokemon} from '@features/pokedex';
import {useAuth} from '@features/auth';
import {useQuery, gql} from '@apollo/client';
import {useState} from 'react';
import '@ui/pixelact/styles/animations.css';
import {getTypeColors, getContrastColor, getStatBarColors, getUnknownPokemonColors} from '../utils/typeColors';

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
    : getUnknownPokemonColors(isDarkMode);
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
            className={`leftBox border-4 p-3 md:p-4 w-full max-w-[400px] font-press-start flex flex-col items-center relative overflow-hidden backdrop-blur-md ${typeColors.cardBg} ${isAnimating ? 'animate-dopamine-release' : ''}`}
            style={{
              borderColor: isDarkMode ? '#333333' : 'black',
              boxShadow: isDarkMode 
                ? '4px 4px 0px rgba(51,51,51,1)' 
                : '4px 4px 0px rgba(0,0,0,1)',
              backgroundColor: isDarkMode
                ? 'rgba(20, 20, 20, 0.9)'
                : 'rgba(245, 241, 232, 0.95)'
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
              className="spriteFrame border-2 p-2 mb-2 md:mb-3 flex items-center justify-center w-full h-[140px] md:h-[180px] relative"
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
            className="evolutionWrapper p-3 border-4 text-xs md:text-sm w-full max-w-[400px] font-press-start"
            style={{
              borderColor: isDarkMode ? '#333333' : 'black',
              boxShadow: isDarkMode 
                ? '4px 4px 0px rgba(51,51,51,1)' 
                : '4px 4px 0px rgba(0,0,0,1)',
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
