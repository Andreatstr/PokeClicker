import {Dialog, DialogBody, UnlockButton, Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, useCarousel, Button, ArrowUpIcon, ArrowRightIcon} from '@ui/pixelact';
import {StackedProgress} from '@features/clicker';
import type {PokedexPokemon} from '@features/pokedex';
import {usePokemonById, usePurchasePokemon, usePokemonUpgrade, useUpgradePokemonMutation} from '@features/pokedex';
import {useAuth, type User} from '@features/auth';
import {useQuery, gql} from '@apollo/client';
import {useState, useEffect} from 'react';
import {formatNumber} from '@/lib/formatNumber';
import '@ui/pixelact/styles/animations.css';
import {
  getTypeColors,
  getContrastColor,
  getStatBarColors,
  getUnknownPokemonColors,
} from '../utils/typeColors';
import {pokemonSpriteCache} from '@/lib/pokemonSpriteCache';

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
  allPokemon?: PokedexPokemon[]; // All filtered Pokemon for carousel navigation
  isOpen: boolean;
  onClose: () => void;
  onSelectPokemon?: (id: number) => void;
  onPurchase?: (id: number) => void;
  isDarkMode?: boolean;
}

// Helper to calculate Pokemon purchase cost (matches backend)
// Exponential pricing by tier: 100 × 2^(tier)
// Pokemon are grouped into tiers of 10
// Tier 0 (ID 1-10): 100, Tier 1 (ID 11-20): 200, Tier 2 (ID 21-30): 400, etc.
function getPokemonCost(pokemonId: number): number {
  const tier = Math.floor(pokemonId / 10);
  return Math.floor(100 * Math.pow(2, tier));
}

function getBackgroundImageUrl(types: string[]): string {
  const primaryType = types[0];
  return `${import.meta.env.BASE_URL}pokemon-type-bg/${primaryType}.webp`;
}

// Component to render a single Pokemon's detail card content
function PokemonCardContent({
  pokemon,
  isDarkMode,
  onClose,
  onSelectPokemon,
  onPurchaseComplete,
  purchasePokemonMutation,
  updateUser,
  user,
  ownedPokemonIds,
}: {
  pokemon: PokedexPokemon;
  isDarkMode: boolean;
  onClose: () => void;
  onSelectPokemon?: (id: number) => void;
  onPurchaseComplete?: (id: number) => void;
  purchasePokemonMutation: ReturnType<typeof usePurchasePokemon>[0];
  updateUser: (user: User) => void;
  user: User | null;
  ownedPokemonIds: number[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Fetch Pokemon upgrade data
  const {upgrade, refetch: refetchUpgrade} = usePokemonUpgrade(pokemon.isOwned ? pokemon.id : null);
  const [upgradePokemonMutation, {loading: upgrading}] = useUpgradePokemonMutation();

  // Handle purchase for THIS specific Pokemon
  const handlePurchase = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setError(null);

    try {
      const result = await purchasePokemonMutation({
        variables: {pokemonId: pokemon.id},
      });

      // Immediately update AuthContext with the server response
      if (result.data?.purchasePokemon && user) {
        updateUser({
          ...result.data.purchasePokemon,
          created_at: user.created_at,
        });
      }

      onPurchaseComplete?.(pokemon.id);
      // Trigger animation after successful purchase
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 800);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to purchase Pokémon';
      setError(errorMessage);
      setTimeout(() => setError(null), 1200);
    }
  };

  // Handle Pokemon upgrade
  const handleUpgrade = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setError(null);

    try {
      await upgradePokemonMutation({
        variables: {pokemonId: pokemon.id},
      });

      // Refetch upgrade data to get new level and cost
      await refetchUpgrade();

      // Trigger success animation
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 800);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to upgrade Pokémon';
      setError(errorMessage);
      setTimeout(() => setError(null), 1200);
    }
  };

  // Fetch data for all Pokemon in evolution chain (up to 10 max)
  const evolutionIds = [pokemon.id, ...(pokemon.evolution ?? [])];

  // Call hooks unconditionally for up to 10 Pokemon
  const evo0 = usePokemonById(evolutionIds[0] ?? null);
  const evo1 = usePokemonById(evolutionIds[1] ?? null);
  const evo2 = usePokemonById(evolutionIds[2] ?? null);
  const evo3 = usePokemonById(evolutionIds[3] ?? null);
  const evo4 = usePokemonById(evolutionIds[4] ?? null);
  const evo5 = usePokemonById(evolutionIds[5] ?? null);
  const evo6 = usePokemonById(evolutionIds[6] ?? null);
  const evo7 = usePokemonById(evolutionIds[7] ?? null);
  const evo8 = usePokemonById(evolutionIds[8] ?? null);
  const evo9 = usePokemonById(evolutionIds[9] ?? null);

  const evolutionDataQueries = [evo0, evo1, evo2, evo3, evo4, evo5, evo6, evo7, evo8, evo9];

  const primaryType = pokemon.types[0];
  const typeColors = pokemon.isOwned
    ? getTypeColors(primaryType, isDarkMode)
    : getUnknownPokemonColors(isDarkMode);
  const backgroundImageUrl = pokemon.isOwned
    ? getBackgroundImageUrl(pokemon.types)
    : `${import.meta.env.BASE_URL}pokemon-type-bg/unknown.webp`;
  const cost = getPokemonCost(pokemon.id);
  const statColors = getStatBarColors(isDarkMode);

  // Calculate upgraded stats (3% per level)
  const upgradeLevel = upgrade?.level || 1;
  const statMultiplier = 1 + 0.03 * (upgradeLevel - 1);
  const upgradedStats = {
    hp: Math.floor((pokemon.stats?.hp || 0) * statMultiplier),
    attack: Math.floor((pokemon.stats?.attack || 0) * statMultiplier),
    defense: Math.floor((pokemon.stats?.defense || 0) * statMultiplier),
    spAttack: Math.floor((pokemon.stats?.spAttack || 0) * statMultiplier),
    spDefense: Math.floor((pokemon.stats?.spDefense || 0) * statMultiplier),
    speed: Math.floor((pokemon.stats?.speed || 0) * statMultiplier),
  };

  // Sort evolution chain by pokedexNumber instead of ID
  const sortedEvolutionIds = evolutionIds
    .map((id, index) => ({
      id,
      pokedexNumber: evolutionDataQueries[index]?.data?.pokemonById?.pokedexNumber ?? id,
    }))
    .sort((a, b) => a.pokedexNumber - b.pokedexNumber)
    .map(item => item.id);

  return (
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
            : 'rgba(245, 241, 232, 0.95)',
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
            loading="lazy"
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
                  yourValue={upgradedStats.hp}
                  max={255}
                  color={statColors.hp.color}
                  upgradeColor={statColors.hp.upgradeColor}
                />
                <StackedProgress
                  baseValue={pokemon.stats?.attack ?? 0}
                  yourValue={upgradedStats.attack}
                  max={255}
                  color={statColors.attack.color}
                  upgradeColor={statColors.attack.upgradeColor}
                />
                <StackedProgress
                  baseValue={pokemon.stats?.defense ?? 0}
                  yourValue={upgradedStats.defense}
                  max={255}
                  color={statColors.defense.color}
                  upgradeColor={statColors.defense.upgradeColor}
                />
                <StackedProgress
                  baseValue={pokemon.stats?.spAttack ?? 0}
                  yourValue={upgradedStats.spAttack}
                  max={255}
                  color={statColors.spAttack.color}
                  upgradeColor={statColors.spAttack.upgradeColor}
                />
                <StackedProgress
                  baseValue={pokemon.stats?.spDefense ?? 0}
                  yourValue={upgradedStats.spDefense}
                  max={255}
                  color={statColors.spDefense.color}
                  upgradeColor={statColors.spDefense.upgradeColor}
                />
                <StackedProgress
                  baseValue={pokemon.stats?.speed ?? 0}
                  yourValue={upgradedStats.speed}
                  max={255}
                  color={statColors.speed.color}
                  upgradeColor={statColors.speed.upgradeColor}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Upgrade Button */}
        {pokemon.isOwned && upgrade && (
          <div className="w-full mb-2 md:mb-3">
            <Button
              onClick={handleUpgrade}
              disabled={upgrading || !!(user && user.rare_candy < upgrade.cost)}
              className="w-full pixel-font text-xs md:text-sm font-bold py-2 px-4 border-2 shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              bgColor={isDarkMode ? '#3b82f6' : '#60a5fa'}
              style={{
                color: 'white',
                borderColor: 'black',
              }}
            >
              {upgrading ? (
                'Upgrading...'
              ) : (
                <div className="flex items-center justify-center gap-1">
                  <ArrowUpIcon size={16} />
                  <span>Upgrade</span>
                  <span>{formatNumber(upgrade.cost)}</span>
                  <img 
                    src={`${import.meta.env.BASE_URL}candy.webp`} 
                    alt="Candy" 
                    className="w-4 h-4"
                  />
                </div>
              )}
            </Button>
            {error && (
              <div className="text-xs text-red-500 mt-1 text-center font-bold">
                {error}
              </div>
            )}
          </div>
        )}

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
            ? '#1e3a5f' // Dark blue for dark mode
            : '#a0c8ff', // Original light blue for light mode
        }}
      >
        <h3 className="font-bold mb-2">Evolution</h3>
        <div className="evolutionChain flex flex-wrap items-center justify-center gap-2 md:gap-3">
          {sortedEvolutionIds.map((id, i, arr) => (
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
  );
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
  const [cachedSprite, setCachedSprite] = useState<HTMLImageElement | null>(
    null
  );

  // Preload evolution sprite
  useEffect(() => {
    const preloadSprite = async () => {
      if (isOwned && data?.pokemonById) {
        try {
          const sprite = await pokemonSpriteCache.getPokemonSprite(id);
          setCachedSprite(sprite);
        } catch (error) {
          console.warn('Failed to preload evolution sprite:', error);
        }
      }
    };

    preloadSprite();
  }, [id, isOwned, data?.pokemonById]);

  if (loading || !data?.pokemonById) {
    return (
      <div className="evolutionItem flex items-center gap-1 md:gap-2">
        <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-200 animate-pulse" />
        {showArrow && (
          <span className="evolutionArrow">
            <ArrowRightIcon className="w-4 h-4 md:w-6 md:h-6" />
          </span>
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
            src={cachedSprite?.src || evo.sprite}
            alt={evo.name}
            className="evolutionImage w-16 h-16 md:w-20 md:h-20 scale-110 md:scale-125 origin-center object-contain hover:scale-125 md:hover:scale-150 transition-transform duration-200 ease-in-out"
            loading="lazy"
            style={{imageRendering: 'pixelated'}}
          />
        ) : (
          <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center">
            <span className="text-3xl md:text-4xl font-bold">?</span>
          </div>
        )}
      </button>
      {showArrow && (
        <span className="evolutionArrow">
          <ArrowRightIcon className="w-6 h-6 md:w-8 md:h-8" />
        </span>
      )}
    </div>
  );
}

export function PokemonDetailModal({
  pokemon,
  allPokemon = [],
  isOpen,
  onClose,
  onSelectPokemon,
  onPurchase,
  isDarkMode = false,
}: Props) {
  const [purchasePokemon] = usePurchasePokemon();
  const {updateUser, user} = useAuth();
  const {data: userData} = useQuery(ME_QUERY);

  // Add Escape key handler to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }

    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!pokemon) return null;

  const ownedPokemonIds = userData?.me?.owned_pokemon_ids || [];

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogBody>
        {/* Mobile drawer handle */}
        <div className="md:hidden flex justify-center mb-2">
          <div className="w-12 h-1 bg-gray-400 rounded-full"></div>
        </div>

        {allPokemon.length > 1 ? (
          <CarouselWrapper
            allPokemon={allPokemon}
            currentPokemon={pokemon}
            isDarkMode={isDarkMode}
            onClose={onClose}
            onSelectPokemon={onSelectPokemon}
            onPurchaseComplete={onPurchase}
            purchasePokemonMutation={purchasePokemon}
            updateUser={updateUser}
            user={user}
            ownedPokemonIds={ownedPokemonIds}
          />
        ) : (
          <PokemonCardContent
            pokemon={pokemon}
            isDarkMode={isDarkMode}
            onClose={onClose}
            onSelectPokemon={onSelectPokemon}
            onPurchaseComplete={onPurchase}
            purchasePokemonMutation={purchasePokemon}
            updateUser={updateUser}
            user={user}
            ownedPokemonIds={ownedPokemonIds}
          />
        )}
      </DialogBody>
    </Dialog>
  );
}

// Wrapper component to handle carousel initialization
function CarouselWrapper({
  allPokemon,
  currentPokemon,
  isDarkMode,
  onClose,
  onSelectPokemon,
  onPurchaseComplete,
  purchasePokemonMutation,
  updateUser,
  user,
  ownedPokemonIds,
}: {
  allPokemon: PokedexPokemon[];
  currentPokemon: PokedexPokemon;
  isDarkMode: boolean;
  onClose: () => void;
  onSelectPokemon?: (id: number) => void;
  onPurchaseComplete?: (id: number) => void;
  purchasePokemonMutation: ReturnType<typeof usePurchasePokemon>[0];
  updateUser: (user: User) => void;
  user: User | null;
  ownedPokemonIds: number[];
}) {
  const initialIndex = allPokemon.findIndex(p => p.id === currentPokemon.id);

  return (
    <Carousel className="relative">
      {/* Position carousel buttons outside the content - hidden on mobile (swipe instead) */}
      <CarouselPrevious
        className="hidden md:block fixed left-[calc(50%-300px)] top-1/2 -translate-y-1/2 z-[60] w-14 h-14 border-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_rgba(0,0,0,1)] active:shadow-[2px_2px_0px_rgba(0,0,0,1)] text-2xl"
      />
      <CarouselNext
        className="hidden md:block fixed right-[calc(50%-300px)] top-1/2 -translate-y-1/2 z-[60] w-14 h-14 border-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_rgba(0,0,0,1)] active:shadow-[2px_2px_0px_rgba(0,0,0,1)] text-2xl"
      />

      <CarouselContent>
        <CarouselInitializer initialIndex={initialIndex} itemCount={allPokemon.length} />
        {allPokemon.map((poke, index) => (
          <CarouselItem key={poke.id}>
            <LazyPokemonCard
              pokemon={poke}
              index={index}
              isDarkMode={isDarkMode}
              onClose={onClose}
              onSelectPokemon={onSelectPokemon}
              onPurchaseComplete={onPurchaseComplete}
              purchasePokemonMutation={purchasePokemonMutation}
              updateUser={updateUser}
              user={user}
              ownedPokemonIds={ownedPokemonIds}
            />
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}

// Helper component to set initial carousel index and item count
function CarouselInitializer({initialIndex, itemCount}: {initialIndex: number; itemCount: number}) {
  const {setCurrentIndex, setItemsCount} = useCarousel();

  useEffect(() => {
    if (initialIndex >= 0) {
      setCurrentIndex(initialIndex);
    }
    setItemsCount(itemCount);
  }, [initialIndex, itemCount, setCurrentIndex, setItemsCount]);

  return null;
}

// Lazy-loaded Pokemon card that only renders when near the current carousel index
function LazyPokemonCard({
  pokemon,
  index,
  isDarkMode,
  onClose,
  onSelectPokemon,
  onPurchaseComplete,
  purchasePokemonMutation,
  updateUser,
  user,
  ownedPokemonIds,
}: {
  pokemon: PokedexPokemon;
  index: number;
  isDarkMode: boolean;
  onClose: () => void;
  onSelectPokemon?: (id: number) => void;
  onPurchaseComplete?: (id: number) => void;
  purchasePokemonMutation: ReturnType<typeof usePurchasePokemon>[0];
  updateUser: (user: User) => void;
  user: User | null;
  ownedPokemonIds: number[];
}) {
  const {currentIndex} = useCarousel();

  // Only render current Pokemon ± 1 to reduce API calls
  // This prevents loading evolution chains for all Pokemon at once
  const renderWindow = 1;
  const shouldRender = Math.abs(currentIndex - index) <= renderWindow;

  if (!shouldRender) {
    return (
      <div className="flex flex-col gap-3 md:gap-4 items-center w-full max-w-[400px] mx-auto" style={{minHeight: '600px'}}>
        {/* Placeholder - content loads when scrolled into view */}
      </div>
    );
  }

  return (
    <PokemonCardContent
      pokemon={pokemon}
      isDarkMode={isDarkMode}
      onClose={onClose}
      onSelectPokemon={onSelectPokemon}
      onPurchaseComplete={onPurchaseComplete}
      purchasePokemonMutation={purchasePokemonMutation}
      updateUser={updateUser}
      user={user}
      ownedPokemonIds={ownedPokemonIds}
    />
  );
}

export default PokemonDetailModal;
