import {type PokedexPokemon} from '@features/pokedex';
import {logger} from '@/lib/logger';
import '@ui/pixelact/styles/patterns.css';
import {useState, memo, useEffect} from 'react';
import {UnlockButton} from '@ui/pixelact';
import {getTypeColors, getUnknownPokemonColors} from '../../utils/typeColors';
import {pokemonSpriteCache} from '@/lib/pokemonSpriteCache';
import {typeBackgroundCache} from '@/lib/typeBackgroundCache';
import {usePokemonPurchaseHandler} from '../../hooks/usePokemonPurchaseHandler';
import {PokemonTypeBadges} from '../shared/PokemonTypeBadges';

interface PokemonCardProps {
  pokemon: PokedexPokemon;
  onClick?: (pokemon: PokedexPokemon) => void;
  isDarkMode?: boolean;
  ownedPokemonIds: number[];
}

export const PokemonCard = memo(function PokemonCard({
  pokemon,
  onClick,
  isDarkMode = false,
  ownedPokemonIds,
}: PokemonCardProps) {
  // Derive isOwned from the live ownedPokemonIds array (from ME_QUERY)
  // This ensures the UI updates when the cache updates
  const isOwned = ownedPokemonIds.includes(pokemon.id);

  const primaryType = pokemon.types[0];
  const typeColors = isOwned
    ? getTypeColors(primaryType, isDarkMode)
    : getUnknownPokemonColors(isDarkMode);
  const backgroundImageUrl = isOwned
    ? `${import.meta.env.BASE_URL}pokemon-type-bg/${pokemon.types[0]}.webp`
    : `${import.meta.env.BASE_URL}pokemon-type-bg/unknown.webp`;

  const {handlePurchase, error, isAnimating} = usePokemonPurchaseHandler();

  const [, setCachedSprite] = useState<HTMLImageElement | null>(null);
  const [, setCachedBackground] = useState<HTMLImageElement | null>(null);

  // Preload Pokemon sprite and type background
  useEffect(() => {
    const preloadAssets = async () => {
      try {
        if (isOwned) {
          // Preload Pokemon sprite
          const sprite = await pokemonSpriteCache.getPokemonSprite(pokemon.id);
          setCachedSprite(sprite);

          // Preload type background
          const background =
            await typeBackgroundCache.getTypeBackground(primaryType);
          setCachedBackground(background);
        }
      } catch (error) {
        logger.logError(error, 'PreloadPokemonAssets');
      }
    };

    preloadAssets();
  }, [pokemon.id, isOwned, primaryType]);

  // Use price from API if available, otherwise fallback to '0' (keep as string for Decimal compatibility)
  const cost = pokemon.price ?? '0';

  const handleClick = () => {
    onClick?.(pokemon);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const onPurchaseClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    handlePurchase(pokemon.id, undefined, cost);
  };

  return (
    <aside
      className={`relative cursor-pointer border-4 p-4 w-full max-w-[280px] h-[440px] pixel-font flex flex-col items-center ${typeColors.cardBg}
        transition-all duration-200 ease-in-out
        hover:translate-y-[-4px] ${isAnimating ? 'animate-dopamine-release' : ''}
        focus-visible:outline-none`}
      style={
        {
          borderColor: isDarkMode ? '#333333' : 'black',
          boxShadow: isDarkMode
            ? '4px 4px 0px rgba(51,51,51,1)'
            : '4px 4px 0px rgba(0,0,0,1)',
          '--focus-ring-color': isDarkMode ? 'white' : '#0066ff',
        } as React.CSSProperties & {'--focus-ring-color': string}
      }
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
      onFocus={(e) => {
        const focusColor = isDarkMode ? 'white' : '#0066ff';
        e.currentTarget.style.boxShadow = `0 0 0 2px ${isDarkMode ? '#1a1a1a' : 'white'}, 0 0 0 6px ${focusColor}`;
      }}
      onBlur={(e) => {
        e.currentTarget.style.boxShadow = isDarkMode
          ? '4px 4px 0px rgba(51,51,51,1)'
          : '4px 4px 0px rgba(0,0,0,1)';
      }}
      tabIndex={0}
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

      <article
        className="bg-black/20 p-2 rounded-md w-full flex-1 flex flex-col overflow-hidden"
        style={{textShadow: '1px 1px 0 var(--background)'}}
      >
        <div className="infoGrid flex flex-col gap-1.5 text-[10px] flex-1">
          {/* Pokemon Name */}
          <header className="flex items-center justify-between min-h-[20px]">
            <h2 className="font-bold text-sm capitalize truncate">
              {isOwned ? pokemon.name : '???'}
            </h2>
            {isOwned && (
              <span
                className="font-normal text-[9px] px-2 py-0.5 rounded whitespace-nowrap ml-2"
                style={{
                  backgroundColor: isDarkMode
                    ? 'rgba(51, 51, 51, 0.1)'
                    : 'rgba(0, 0, 0, 0.1)',
                  border: isDarkMode
                    ? '1px solid rgba(51, 51, 51, 0.3)'
                    : '1px solid rgba(0, 0, 0, 0.3)',
                  color: isDarkMode ? 'var(--foreground)' : 'var(--foreground)',
                  textShadow: isDarkMode
                    ? '1px 1px 0 rgba(0, 0, 0, 0.8)'
                    : '1px 1px 0 rgba(255, 255, 255, 0.8)',
                }}
              >
                #{pokemon.pokedexNumber}
              </span>
            )}
          </header>

          {/* Purchase Button or Info Grid */}
          {!isOwned ? (
            <UnlockButton
              onClick={onPurchaseClick}
              cost={cost}
              error={error}
              pokemonName={pokemon.name}
              size="small"
              isDarkMode={isDarkMode}
              aria-label={`Unlock ${pokemon.name}`}
            />
          ) : (
            <>
              {/* Info Grid */}
              <dl className="flex gap-2 text-[9px]">
                <div
                  className="flex-1 rounded px-2 py-1"
                  style={{
                    backgroundColor: isDarkMode
                      ? 'rgba(51, 51, 51, 0.1)'
                      : 'rgba(255, 255, 255, 0.3)',
                    border: isDarkMode
                      ? '1px solid rgba(51, 51, 51, 0.2)'
                      : '1px solid rgba(0, 0, 0, 0.2)',
                  }}
                >
                  <dt className="font-bold text-[8px] uppercase tracking-wide">
                    Height
                  </dt>
                  <dd className="font-bold text-[11px] tabular-nums">
                    {pokemon.height ?? '—'}
                  </dd>
                </div>
                <div
                  className="flex-1 rounded px-2 py-1"
                  style={{
                    backgroundColor: isDarkMode
                      ? 'rgba(51, 51, 51, 0.1)'
                      : 'rgba(255, 255, 255, 0.3)',
                    border: isDarkMode
                      ? '1px solid rgba(51, 51, 51, 0.2)'
                      : '1px solid rgba(0, 0, 0, 0.2)',
                  }}
                >
                  <dt className="font-bold text-[8px] uppercase tracking-wide">
                    Weight
                  </dt>
                  <dd className="font-bold text-[11px] tabular-nums">
                    {pokemon.weight ?? '—'}
                  </dd>
                </div>
              </dl>

              {/* Abilities */}
              {pokemon.abilities && pokemon.abilities.length > 0 && (
                <section className="text-[9px]">
                  <h3 className="font-bold text-[8px]">Abilities</h3>
                  <ul className="flex flex-wrap gap-0.5 mt-0.5 list-none p-0 m-0">
                    {pokemon.abilities.map((ability) => (
                      <li
                        key={ability}
                        className="px-1.5 py-0.5 rounded text-[7.5px] whitespace-nowrap leading-tight"
                        style={{
                          backgroundColor: isDarkMode
                            ? 'rgba(51, 51, 51, 0.2)'
                            : 'rgba(255, 255, 255, 0.5)',
                          border: isDarkMode
                            ? '1px solid rgba(51, 51, 51, 0.2)'
                            : '1px solid rgba(0, 0, 0, 0.2)',
                        }}
                      >
                        {ability}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          )}

          {/* Type Tags */}
          {isOwned && (
            <div className="mt-auto pt-2">
              <PokemonTypeBadges
                types={pokemon.types}
                isDarkMode={isDarkMode}
                size="small"
              />
            </div>
          )}
        </div>
      </article>
    </aside>
  );
});
