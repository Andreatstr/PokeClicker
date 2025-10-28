import {ArrowRightIcon} from '@ui/pixelact';
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
