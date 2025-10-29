import {Button, UnlockButton, ArrowUpIcon} from '@ui/pixelact';
import type {PokedexPokemon} from '@features/pokedex';
import {
  usePokemonUpgrade,
  useUpgradePokemonMutation,
  usePurchasePokemon,
} from '@features/pokedex';
import {type User} from '@features/auth';
import {useState} from 'react';
import {formatNumber} from '@/lib/formatNumber';
import '@ui/pixelact/styles/animations.css';
import {getTypeColors, getUnknownPokemonColors} from '../../utils/typeColors';
import {getPokemonCost, getBackgroundImageUrl} from '../../utils/pokemonCost';
import {PokemonTypeBadges} from '../shared/PokemonTypeBadges';
import {PokemonStatsDisplay} from '../shared/PokemonStatsDisplay';
import {PokemonEvolutionSection} from '../shared/PokemonEvolutionSection';

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

  // Fetch Pokemon upgrade data
  const {upgrade, refetch: refetchUpgrade} = usePokemonUpgrade(
    pokemon.isOwned ? pokemon.id : null
  );
  const [upgradePokemonMutation, {loading: upgrading}] =
    useUpgradePokemonMutation();

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
          ...user, // Keep existing user data (stats, etc.)
          ...result.data.purchasePokemon, // Only update fields that changed (rare_candy, owned_pokemon_ids)
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

  // Evolution IDs for the Pokemon
  const evolutionIds = [pokemon.id, ...(pokemon.evolution ?? [])];

  const primaryType = pokemon.types[0];
  const typeColors = pokemon.isOwned
    ? getTypeColors(primaryType, isDarkMode)
    : getUnknownPokemonColors(isDarkMode);
  const backgroundImageUrl = pokemon.isOwned
    ? getBackgroundImageUrl(pokemon.types)
    : `${import.meta.env.BASE_URL}pokemon-type-bg/unknown.webp`;
  const cost = getPokemonCost(pokemon.id);

  // Calculate upgrade level for stats display
  const upgradeLevel = upgrade?.level || 1;

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
          <div className="mb-2 md:mb-3">
            <PokemonTypeBadges
              types={pokemon.types}
              isDarkMode={isDarkMode}
              size="medium"
            />
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
        <PokemonStatsDisplay
          stats={pokemon.stats!}
          upgradeLevel={upgradeLevel}
        />

        {/* Upgrade Button */}
        {pokemon.isOwned && upgrade && (
          <div className="w-full mb-2 md:mb-3">
            <Button
              onClick={handleUpgrade}
              disabled={upgrading || !!(user && user.rare_candy < upgrade.cost)}
              className="w-full pixel-font text-xs md:text-sm font-bold py-6 px-4 border-2 shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              bgColor={isDarkMode ? '#3b82f6' : '#60a5fa'}
              style={{
                color: 'white',
                borderColor: 'black',
              }}
            >
              {upgrading ? (
                'Upgrading...'
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <ArrowUpIcon size={20} />
                  <span>Upgrade</span>
                  <span className="px-2 py-1 border border-white rounded bg-black/20 font-bold">
                    {formatNumber(upgrade.cost)}
                  </span>
                  <img
                    src={`${import.meta.env.BASE_URL}candy.webp`}
                    alt="Candy"
                    className="w-6 h-6"
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
      <PokemonEvolutionSection
        evolutionIds={evolutionIds}
        ownedPokemonIds={ownedPokemonIds}
        onSelectPokemon={onSelectPokemon}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
