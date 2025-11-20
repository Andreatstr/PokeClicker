import {ArrowRightIcon} from '@ui/pixelact';
import {logger} from '@/lib/logger';
import {usePokemonById} from '@features/pokedex';
import {useState, useEffect} from 'react';
import {pokemonSpriteCache} from '@/lib/pokemonSpriteCache';

interface EvolutionPokemonProps {
  id: number;
  onSelectPokemon?: (id: number) => void;
  showArrow: boolean;
  isOwned: boolean;
}

export function EvolutionPokemon({
  id,
  onSelectPokemon,
  showArrow,
  isOwned,
}: EvolutionPokemonProps) {
  const {pokemon, loading} = usePokemonById(id);
  const [cachedSprite, setCachedSprite] = useState<HTMLImageElement | null>(
    null
  );

  // Preload evolution sprite
  useEffect(() => {
    const preloadSprite = async () => {
      if (isOwned && pokemon) {
        try {
          const sprite = await pokemonSpriteCache.getPokemonSprite(id);
          setCachedSprite(sprite);
        } catch (error) {
          logger.logError(error, 'PreloadEvolutionSprite');
        }
      }
    };

    preloadSprite();
  }, [id, isOwned, pokemon]);

  if (loading || !pokemon) {
    return (
      <article className="evolutionItem flex items-center gap-1 md:gap-2">
        <div
          className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center"
          aria-hidden="true"
        >
          <span className="text-3xl md:text-4xl font-bold animate-pulse text-gray-400">
            ?
          </span>
        </div>
        {showArrow && (
          <span className="evolutionArrow" aria-hidden="true">
            <ArrowRightIcon className="w-4 h-4 md:w-6 md:h-6" />
          </span>
        )}
      </article>
    );
  }

  const evo = pokemon;

  return (
    <article className="evolutionItem flex items-center gap-1 md:gap-2">
      <button
        className="evolutionButton bg-transparent border-none p-0 cursor-pointer relative"
        onClick={() => onSelectPokemon?.(evo.id)}
        title={isOwned ? `View ${evo.name}` : 'Unknown Pokémon'}
        tabIndex={0}
        aria-label={isOwned ? `View ${evo.name}` : 'Unknown Pokémon'}
      >
        {isOwned ? (
          <figure>
            <img
              src={cachedSprite?.src || evo.sprite}
              alt={evo.name}
              className="evolutionImage w-16 h-16 md:w-20 md:h-20 scale-110 md:scale-125 origin-center object-contain hover:scale-125 md:hover:scale-150 transition-transform duration-200 ease-in-out"
              loading="lazy"
              decoding="async"
              style={{imageRendering: 'pixelated'}}
            />
          </figure>
        ) : (
          <div
            className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center"
            aria-label="Locked evolution"
          >
            <span
              className="text-3xl md:text-4xl font-bold animate-pulse"
              aria-hidden="true"
            >
              ?
            </span>
          </div>
        )}
      </button>
      {showArrow && (
        <span className="evolutionArrow" aria-hidden="true">
          <ArrowRightIcon className="w-6 h-6 md:w-8 md:h-8" />
        </span>
      )}
    </article>
  );
}
