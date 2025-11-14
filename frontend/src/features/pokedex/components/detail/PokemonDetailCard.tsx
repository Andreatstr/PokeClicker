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
import {getPokemonCost} from '@/config';
import {useError} from '@/hooks/useError';

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
}: PokemonDetailCardProps) {
  const [error, setError] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const errorTimeoutRef = useRef<number | null>(null);
  const {addSuccess} = useError();

  // Derive isOwned from the live ownedPokemonIds array (from ME_QUERY)
  // This ensures the UI updates when the cache updates
  const isOwned = ownedPokemonIds.includes(pokemon.id);

  const {upgrade, refetch: refetchUpgrade} = usePokemonUpgrade(
    isOwned ? pokemon.id : null
  );
  const [upgradePokemonMutation, {loading: upgrading}] =
    useUpgradePokemonMutation();

  const handlePurchase = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // Clear any existing error timeout to prevent race conditions
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }
    setError(null);

    // Client-side validation: Check if user can afford the Pokemon
    // This prevents the optimistic response from flashing the unlocked state
    if (user && toDecimal(user.rare_candy).lt(cost)) {
      setError('Not enough Rare Candy!');
      errorTimeoutRef.current = setTimeout(() => {
        setError(null);
        errorTimeoutRef.current = null;
      }, 1200);
      return;
    }

    try {
      const result = await purchasePokemonMutation({
        variables: {pokemonId: pokemon.id},
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
        addSuccess(`Successfully bought ${capitalizedName}!`);

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
    // This prevents the optimistic response from causing UI inconsistencies
    if (user && upgrade && toDecimal(user.rare_candy).lt(upgrade.cost)) {
      setError('Not enough Rare Candy!');
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

      await refetchUpgrade();

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
  const cost = getPokemonCost(pokemon.id);
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

        {/* Close Button */}
        <button
          className="absolute top-2 right-2 z-10 py-1 px-2 text-xs bg-red-600 text-white font-bold border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_rgba(0,0,0,1)] transition-all"
          onClick={onClose}
          aria-label="Exit"
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

        {/* Upgrade Button */}
        {isOwned && upgrade && (
          <section
            data-onboarding="pokemon-upgrade"
            className="w-full mb-2 md:mb-3"
            aria-label="Pokemon upgrade"
          >
            <Button
              onClick={handleUpgrade}
              disabled={
                upgrading ||
                !!(user && toDecimal(user.rare_candy).lt(upgrade.cost))
              }
              className="w-full pixel-font text-xs md:text-sm font-bold py-6 px-4 border-2 shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              bgColor={isDarkMode ? '#3472d7ff' : '#3c77b3ff'}
              aria-label="Upgrade pokemon"
              isDarkMode={isDarkMode}
              style={{
                color: 'white',
                borderColor: 'black',
              }}
            >
              {upgrading ? (
                'Upgrading...'
              ) : (
                <span className="flex items-center justify-center gap-3">
                  <ArrowUpIcon size={20} />
                  <span>Upgrade</span>
                  <span className="px-2 py-1 border border-white rounded bg-black/20 font-bold">
                    {formatNumber(upgrade.cost)}
                  </span>
                  <img
                    src={`${import.meta.env.BASE_URL}candy.webp`}
                    alt="Candy"
                    className="w-6 h-6"
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
