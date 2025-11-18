import {Button, UnlockButton, ArrowUpIcon} from '@ui/pixelact';
import type {PokedexPokemon} from '@features/pokedex';
import {
  usePokemonUpgrade,
  useUpgradePokemonMutation,
  usePurchasePokemon,
} from '@features/pokedex';
import {type User} from '@features/auth';
import {useState, useRef, useEffect} from 'react';
import {formatNumber} from '@/lib/formatNumber';
import '@ui/pixelact/styles/animations.css';
import {getTypeColors, getUnknownPokemonColors} from '../../utils/typeColors';
import {PokemonTypeBadges} from '../shared/PokemonTypeBadges';
import {PokemonStatsDisplay} from '../shared/PokemonStatsDisplay';
import {PokemonEvolutionSection} from '../shared/PokemonEvolutionSection';
import {toDecimal} from '@/lib/decimal';
import {useError} from '@/hooks/useError';
import {useMutation} from '@apollo/client';
import {
  SET_FAVORITE_POKEMON_MUTATION,
  SET_SELECTED_POKEMON_MUTATION,
} from '@/lib/graphql/mutations';
import type {
  SetFavoritePokemonData,
  SetSelectedPokemonData,
  PokemonIdVariables,
} from '@/lib/graphql/types';
import {useCandyContext} from '@/contexts/useCandyContext';

interface PokemonDetailCardProps {
  pokemon: PokedexPokemon;
  isDarkMode: boolean;
  onClose: () => void;
  onSelectPokemon?: (id: number) => void;
  onPurchaseComplete?: (id: number) => void;
  purchasePokemonMutation: ReturnType<typeof usePurchasePokemon>[0];
  updateUser: (user: User) => void;
  user: User | null;
  ownedPokemonIds: number[];
  closeButtonRef?: React.RefObject<HTMLButtonElement | null>;
}

export function PokemonDetailCard({
  pokemon,
  isDarkMode,
  onClose,
  onSelectPokemon,
  onPurchaseComplete,
  purchasePokemonMutation,
  updateUser,
  user,
  ownedPokemonIds,
  closeButtonRef,
}: PokemonDetailCardProps) {
  const [error, setError] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const errorTimeoutRef = useRef<number | null>(null);
  const {addSuccess} = useError();
  const {localRareCandy, flushPendingCandy} = useCandyContext();

  // Derive isOwned from the live ownedPokemonIds array (from ME_QUERY)
  // This ensures the UI updates when the cache updates
  const isOwned = ownedPokemonIds.includes(pokemon.id);

  const {upgrade} = usePokemonUpgrade(isOwned ? pokemon.id : null);
  const [upgradePokemonMutation, {loading: upgrading}] =
    useUpgradePokemonMutation();

  // Mutations for setting favorite/selected Pokemon
  const [setFavoritePokemon] = useMutation<
    SetFavoritePokemonData,
    PokemonIdVariables
  >(SET_FAVORITE_POKEMON_MUTATION);
  const [setSelectedPokemon] = useMutation<
    SetSelectedPokemonData,
    PokemonIdVariables
  >(SET_SELECTED_POKEMON_MUTATION);

  const handlePurchase = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // Clear any existing error timeout to prevent race conditions
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }
    setError(null);

    // Client-side validation: Check if user can afford the Pokemon
    // This prevents the optimistic response from flashing the unlocked state
    if (user && toDecimal(user.rare_candy).lt(toDecimal(cost))) {
      setError('Not enough Rare Candy!');
      errorTimeoutRef.current = setTimeout(() => {
        setError(null);
        errorTimeoutRef.current = null;
      }, 1200);
      return;
    }

    try {
      const result = await purchasePokemonMutation({
        variables: {pokemonId: pokemon.id, price: pokemon.price ?? undefined},
      });

      // Check for GraphQL errors first (Apollo's errorPolicy: 'all' returns both data and errors)
      // This handles cases where server rejects the purchase (e.g., not enough candy)
      if (result.errors && result.errors.length > 0) {
        const errorMessage =
          result.errors[0]?.message || 'Failed to purchase Pokémon';
        setError(errorMessage);
        errorTimeoutRef.current = setTimeout(() => {
          setError(null);
          errorTimeoutRef.current = null;
        }, 1200);
        return; // Don't show success or update UI if there are errors
      }

      // Only proceed if there are no errors and server confirmed the purchase
      if (result.data?.purchasePokemon && user) {
        updateUser({
          ...user, // Keep existing user data (stats, etc.)
          ...result.data.purchasePokemon, // Only update fields that changed (rare_candy, owned_pokemon_ids)
          created_at: user.created_at,
        });

        // Show success toast notification only after server confirmation
        const capitalizedName =
          pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
        console.log(
          'About to call addSuccess with:',
          `Successfully bought ${capitalizedName}!`
        );
        addSuccess(`Successfully bought ${capitalizedName}!`);
        console.log('addSuccess called');

        onPurchaseComplete?.(pokemon.id);
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 800);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to purchase Pokémon';
      setError(errorMessage);
      errorTimeoutRef.current = setTimeout(() => {
        setError(null);
        errorTimeoutRef.current = null;
      }, 1200);
    }
  };

  const handleUpgrade = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // Clear any existing error timeout to prevent race conditions
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }
    setError(null);

    // Client-side validation: Check if user can afford the upgrade
    // Use global candy context (includes unsynced passive income)
    if (upgrade && toDecimal(localRareCandy).lt(toDecimal(upgrade.cost))) {
      setError('Not enough Rare Candy!');
      errorTimeoutRef.current = setTimeout(() => {
        setError(null);
        errorTimeoutRef.current = null;
      }, 1200);
      return;
    }

    // CRITICAL: Flush pending candy to backend before upgrade
    // This ensures backend has accurate candy count for validation
    try {
      await flushPendingCandy();
    } catch {
      setError('Failed to sync candy. Please try again.');
      errorTimeoutRef.current = setTimeout(() => {
        setError(null);
        errorTimeoutRef.current = null;
      }, 1200);
      return;
    }

    try {
      const result = await upgradePokemonMutation({
        variables: {pokemonId: pokemon.id},
      });

      // Immediately update AuthContext with the server response
      if (result.data?.upgradePokemon?.user && user) {
        updateUser({
          ...user, // Keep existing user data (stats, owned_pokemon_ids, etc.)
          ...result.data.upgradePokemon.user, // Only update fields that changed (rare_candy)
          created_at: user.created_at,
        });
      }

      // No need to manually refetch - mutation handles it via refetchQueries

      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 800);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to upgrade Pokémon';
      setError(errorMessage);
      errorTimeoutRef.current = setTimeout(() => {
        setError(null);
        errorTimeoutRef.current = null;
      }, 1200);
    }
  };

  // Handler for using Pokemon in Map
  const handleUseInMap = async () => {
    try {
      const result = await setFavoritePokemon({
        variables: {pokemonId: pokemon.id},
      });
      if (result.data?.setFavoritePokemon) {
        updateUser(result.data.setFavoritePokemon);
        addSuccess(`${pokemon.name} set for Map!`);
      }
    } catch (err) {
      console.error('Failed to set favorite Pokemon:', err);
      setError('Failed to set for Map');
      errorTimeoutRef.current = setTimeout(() => {
        setError(null);
        errorTimeoutRef.current = null;
      }, 1200);
    }
  };

  // Handler for using Pokemon in Clicker
  const handleUseInClicker = async () => {
    try {
      const result = await setSelectedPokemon({
        variables: {pokemonId: pokemon.id},
      });
      if (result.data?.setSelectedPokemon) {
        updateUser(result.data.setSelectedPokemon);
        addSuccess(`${pokemon.name} set for Clicker!`);
      }
    } catch (err) {
      console.error('Failed to set selected Pokemon:', err);
      setError('Failed to set for Clicker');
      errorTimeoutRef.current = setTimeout(() => {
        setError(null);
        errorTimeoutRef.current = null;
      }, 1200);
    }
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, []);

  const evolutionIds = [pokemon.id, ...(pokemon.evolution ?? [])];
  const primaryType = pokemon.types[0];
  const typeColors = isOwned
    ? getTypeColors(primaryType, isDarkMode)
    : getUnknownPokemonColors(isDarkMode);
  const backgroundImageUrl = isOwned
    ? `${import.meta.env.BASE_URL}pokemon-type-bg/${pokemon.types[0]}.webp`
    : `${import.meta.env.BASE_URL}pokemon-type-bg/unknown.webp`;
  // Use price from API if available, otherwise fallback to '0' (keep as string for Decimal compatibility)
  const cost = pokemon.price ?? '0';
  const upgradeLevel = upgrade?.level || 1;

  return (
    <article
      className="flex flex-col gap-3 md:gap-4 items-center"
      role="article"
      aria-label="Pokemon details"
    >
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
        {isOwned && (
          <aside
            className="absolute top-0 left-0 z-20 overflow-visible"
            aria-label="Pokemon ownership status"
          >
            <div className="relative w-0 h-0" aria-hidden="true">
              {/* Main tape */}
              <div className="bg-green-700 text-white text-[11px] md:text-sm font-bold px-8 md:px-10 py-1.5 md:py-2 border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,0.4)] transform -rotate-45 origin-top-left translate-x-[-28px] translate-y-[62px] md:translate-x-[-33px] md:translate-y-[75px] min-w-[140px] md:min-w-[160px] text-center">
                OWNED
              </div>
            </div>
          </aside>
        )}

        {/* Close Button - 44x44px min touch target */}
        <button
          ref={closeButtonRef}
          className="absolute top-2 right-2 z-10 w-11 h-11 text-xs bg-red-600 cursor-pointer text-white font-bold border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center"
          onClick={onClose}
          aria-label="Exit"
          data-autofocus="true"
        >
          X
        </button>

        {/* Pokemon Name */}
        <h2 className="text-sm md:text-base font-bold text-center mb-2 md:mb-3 capitalize">
          {isOwned ? pokemon.name : '???'}
        </h2>

        {/* Type Badges */}
        {isOwned && (
          <section className="mb-2 md:mb-3" aria-label="Pokemon types">
            <PokemonTypeBadges
              types={pokemon.types}
              isDarkMode={isDarkMode}
              size="medium"
            />
          </section>
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
            alt={isOwned ? pokemon.name : 'Unknown Pokémon'}
            className="w-full h-full object-contain origin-center"
            loading="lazy"
            decoding="async"
            style={{
              imageRendering: 'pixelated',
              filter: isOwned ? 'none' : 'brightness(0)',
            }}
          />
        </figure>

        {/* Stats Section */}
        <section
          data-onboarding="pokemon-stats"
          className="w-full"
          aria-label="Pokemon statistics"
        >
          <PokemonStatsDisplay
            stats={pokemon.stats!}
            upgradeLevel={upgradeLevel}
          />
        </section>

        {/* Action Buttons Container */}
        {isOwned && (
          <section
            className="w-full flex flex-col gap-2"
            aria-label="Pokemon actions"
          >
            {/* Upgrade Button */}
            {upgrade && (
              <div data-onboarding="pokemon-upgrade" className="w-full">
                <Button
                  onClick={handleUpgrade}
                  disabled={
                    upgrading ||
                    toDecimal(localRareCandy).lt(toDecimal(upgrade.cost))
                  }
                  className="pixel-font text-xs md:text-sm font-bold border-2 shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  bgColor={isDarkMode ? '#3472d7ff' : '#3c77b3ff'}
                  aria-label="Upgrade pokemon"
                  isDarkMode={isDarkMode}
                  style={{
                    width: 'calc(100% - 8px)',
                    boxSizing: 'border-box',
                    paddingTop: '1.5rem',
                    paddingBottom: '1.5rem',
                    paddingLeft: '0.5rem',
                    paddingRight: '0.5rem',
                    color: 'white',
                    borderColor: 'black',
                  }}
                >
                  {upgrading ? (
                    'Upgrading...'
                  ) : (
                    <span className="flex items-center justify-center gap-1 md:gap-2">
                      <ArrowUpIcon size={16} className="md:w-5 md:h-5" />
                      <span>Upgrade</span>
                      <span className="px-1.5 py-0.5 md:px-2 md:py-1 border border-white rounded bg-black/20 font-bold text-[10px] md:text-xs">
                        {formatNumber(upgrade.cost)}
                      </span>
                      <img
                        src={`${import.meta.env.BASE_URL}candy.webp`}
                        alt="Candy"
                        className="w-5 h-5 md:w-6 md:h-6"
                        loading="lazy"
                        decoding="async"
                      />
                    </span>
                  )}
                </Button>
                {error && (
                  <p
                    className="text-xs text-red-500 mt-1 text-center font-bold"
                    role="alert"
                    aria-live="polite"
                  >
                    {error}
                  </p>
                )}
              </div>
            )}

            {/* Use Pokemon in Clicker/Map Buttons */}
            <div className="w-full flex gap-2">
              <Button
                onClick={handleUseInClicker}
                disabled={user?.selected_pokemon_id === pokemon.id}
                className="pixel-font text-[9px] md:text-[10px] font-bold border-2 shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-all leading-tight"
                bgColor={isDarkMode ? '#2d5a2e' : '#4a9d4f'}
                aria-label="Use in Clicker"
                isDarkMode={isDarkMode}
                style={{
                  flex: 1,
                  width: 0,
                  paddingTop: '1.5rem',
                  paddingBottom: '1.5rem',
                  paddingLeft: '0.5rem',
                  paddingRight: '0.5rem',
                  color: 'white',
                  borderColor: 'black',
                }}
              >
                Use in Clicker
              </Button>
              <Button
                onClick={handleUseInMap}
                disabled={user?.favorite_pokemon_id === pokemon.id}
                className="pixel-font text-[9px] md:text-[10px] font-bold border-2 shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-all leading-tight"
                bgColor={isDarkMode ? '#5a2d2e' : '#9d4a4f'}
                aria-label="Use in Map"
                isDarkMode={isDarkMode}
                style={{
                  flex: 1,
                  width: 0,
                  paddingTop: '1.5rem',
                  paddingBottom: '1.5rem',
                  paddingLeft: '0.5rem',
                  paddingRight: '0.5rem',
                  color: 'white',
                  borderColor: 'black',
                }}
              >
                Use in Map
              </Button>
            </div>
          </section>
        )}

        {/* Purchase Button */}
        {!isOwned && (
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
      <section
        data-onboarding="pokemon-evolution"
        aria-label="Pokemon evolution chain"
      >
        <PokemonEvolutionSection
          evolutionIds={evolutionIds}
          ownedPokemonIds={ownedPokemonIds}
          onSelectPokemon={onSelectPokemon}
          isDarkMode={isDarkMode}
        />
      </section>
    </article>
  );
}
