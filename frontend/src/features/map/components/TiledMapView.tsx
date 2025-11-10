import React from 'react';
import {useState} from 'react';
import {type PokedexPokemon} from '@features/pokedex';
import {useTileRenderer} from '../hooks/useTileRenderer';
import {useCanvasRenderer} from '../hooks/useCanvasRenderer';
import {formatNumber} from '@/lib/formatNumber';

// Constants
const SPRITE_WIDTH = 68;
const SPRITE_HEIGHT = 72;
const MOVE_SPEED = 120;

interface PokemonSpawn {
  spawnId: string;
  pokemon: PokedexPokemon;
  x: number;
  y: number;
}

interface TiledMapViewProps {
  camera: {x: number; y: number};
  screenPos: {x: number; y: number};
  spritePos: {backgroundPositionX: string; backgroundPositionY: string};
  wildPokemon: PokemonSpawn[];
  nearbyPokemon: PokemonSpawn | null;
  worldPosition: {x: number; y: number};
  user: {rare_candy?: string} | null; // Changed to string for large number support
  collisionMapLoaded: boolean;
  viewportSize: {width: number; height: number};
  isDarkMode?: boolean;
  onStartBattle: (pokemon: PokedexPokemon, spawnId: string) => void;
  onResetToHome: () => void;
}

export function TiledMapView(props: TiledMapViewProps) {
  const {
    camera,
    screenPos,
    spritePos,
    wildPokemon,
    nearbyPokemon,
    user,
    viewportSize,
    isDarkMode = false,
    onStartBattle,
    onResetToHome,
  } = props;

  const {visibleTiles, visiblePokemon, isLoading, tileCacheRef} =
    useTileRenderer(camera, viewportSize, wildPokemon);

  const containerRef = React.useRef<HTMLDivElement | null>(null);

  useCanvasRenderer({
    containerRef,
    visibleTiles,
    tileCacheRef,
    viewportSize,
    tileSize: 512,
    backgroundColor: isDarkMode ? '#0b1220' : '#e6f0eb',
  });

  const [showWelcomeCTA, setShowWelcomeCTA] = useState(() => {
    return user &&
      'owned_pokemon_ids' in user &&
      Array.isArray(user.owned_pokemon_ids)
      ? user.owned_pokemon_ids.length <= 3
      : false;
  });

  return (
    <>
      {/* Map Background */}
      <div ref={containerRef} className="absolute inset-0 overflow-hidden">
        {/* Wild Pokemon */}
        {visiblePokemon.map((visiblePoke, index) => (
          <img
            key={`${visiblePoke.pokemon.id}-${index}`}
            src={visiblePoke.pokemon.sprite}
            alt={visiblePoke.pokemon.name}
            className="absolute transition-none"
            fetchPriority="high"
            style={{
              left: `${visiblePoke.screenX - 24}px`,
              top: `${visiblePoke.screenY - 24}px`,
              width: '48px',
              height: '48px',
              imageRendering: 'pixelated',
              pointerEvents: 'none',
              zIndex: 5, // Above tiles but below character
            }}
            title={visiblePoke.pokemon.name}
          />
        ))}
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-40 text-white px-1 py-0.5 pixel-font text-[10px] z-10 pointer-events-none opacity-50">
          •
        </div>
      )}

      {/* Character Sprite */}
      <div
        className="absolute"
        style={{
          top: `${screenPos.y}px`,
          left: `${screenPos.x}px`,
          width: `${SPRITE_WIDTH}px`,
          height: `${SPRITE_HEIGHT}px`,
          backgroundImage: `url('${import.meta.env.BASE_URL}AshKetchumSprite.webp')`,
          backgroundPositionX: spritePos.backgroundPositionX,
          backgroundPositionY: spritePos.backgroundPositionY,
          imageRendering: 'pixelated',
          transition: `top ${MOVE_SPEED}ms ease-linear, left ${MOVE_SPEED}ms ease-linear`,
          zIndex: 10,
        }}
      />

      {/* Welcome CTA */}
      {!nearbyPokemon && showWelcomeCTA && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 pointer-events-auto">
          <div
            className={`pixel-font text-center px-4 py-3 rounded border-2 shadow-[4px_4px_0px_rgba(0,0,0,1)] ${
              isDarkMode
                ? 'bg-gray-800 text-white border-gray-600'
                : 'bg-white text-black border-black'
            }`}
          >
            <div className="text-sm md:text-base font-bold mb-2">
              Wild Pokémon are out there!
            </div>
            <div className="text-xs md:text-sm opacity-90 mb-3">
              Explore, battle, and catch 'em all!
            </div>
            <button
              onClick={() => setShowWelcomeCTA(false)}
              className={`px-4 py-1 text-xs font-bold border rounded shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-[1px_1px_0px_rgba(0,0,0,1)] ${
                isDarkMode
                  ? 'bg-blue-600 hover:bg-blue-500 text-white border-blue-500'
                  : 'bg-blue-500 hover:bg-blue-400 text-white border-blue-400'
              }`}
              aria-label="OK"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Battle Prompt */}
      {nearbyPokemon && (
        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-16 md:bottom-20 z-30 w-[94%] max-w-[640px]"
          role="dialog"
          aria-live="polite"
        >
          <div
            className={`border-4 shadow-[6px_6px_0_rgba(0,0,0,1)] px-2 py-2 md:px-4 md:py-3 flex items-center gap-2 md:gap-3 rounded-sm ${
              isDarkMode
                ? 'bg-gray-800/95 border-gray-600 text-white'
                : 'bg-white/95 border-black text-black'
            }`}
          >
            <img
              src={nearbyPokemon.pokemon.sprite}
              alt={nearbyPokemon.pokemon.name}
              className="w-6 h-6 md:w-8 md:h-8 image-pixelated flex-shrink-0"
              fetchPriority="high"
              style={{imageRendering: 'pixelated'}}
            />
            <span className="pixel-font text-xs md:text-sm truncate">
              {nearbyPokemon.pokemon.name} nearby!
            </span>
            <button
              className={`ml-auto text-white px-2 py-1 md:px-3 md:py-1.5 pixel-font text-xs md:text-sm border-2 rounded focus-visible:outline focus-visible:outline-3 focus-visible:outline-[#0066ff] focus-visible:outline-offset-2 ${
                isDarkMode ? 'border-gray-600' : 'border-black'
              }`}
              style={{
                backgroundColor: isDarkMode ? '#b91c1c' : '#dc2626',
                boxShadow: isDarkMode
                  ? '4px 4px 0px rgba(51,51,51,1)'
                  : '4px 4px 0px rgba(0,0,0,1)',
                transform: 'translate(0, 0)',
                transition: 'all 0.15s ease-in-out',
              }}
              aria-label="Battle"
              onClick={() =>
                onStartBattle(nearbyPokemon.pokemon, nearbyPokemon.spawnId)
              }
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translate(-2px, -2px)';
                e.currentTarget.style.boxShadow = isDarkMode
                  ? '6px 6px 0px rgba(51,51,51,1)'
                  : '6px 6px 0px rgba(0,0,0,1)';
                e.currentTarget.style.backgroundColor = isDarkMode
                  ? '#991b1b'
                  : '#b91c1c';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translate(0, 0)';
                e.currentTarget.style.boxShadow = isDarkMode
                  ? '4px 4px 0px rgba(51,51,51,1)'
                  : '4px 4px 0px rgba(0,0,0,1)';
                e.currentTarget.style.backgroundColor = isDarkMode
                  ? '#b91c1c'
                  : '#dc2626';
              }}
              tabIndex={0}
            >
              Battle!
            </button>
          </div>
        </div>
      )}

      {/* Rare Candy Counter */}
      <div className="absolute top-2 right-2 z-20">
        <div className="flex items-center gap-2 bg-white/90 border-2 border-black px-2 py-1 shadow-[4px_4px_0_rgba(0,0,0,1)]">
          <img
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/rare-candy.png"
            alt="Rare Candy"
            className="w-6 h-6"
            style={{imageRendering: 'pixelated'}}
          />
          <span className="pixel-font text-base font-bold text-black">
            {formatNumber(user?.rare_candy ?? '0')}
          </span>
        </div>
      </div>

      {/* Home Button - always bottom left */}
      <div className="absolute bottom-2 left-2 z-20">
        <button
          onClick={onResetToHome}
          className="flex items-center gap-1 border-2 border-black px-2 py-1"
          title="Return to home position"
          style={{
            backgroundColor: 'rgba(59, 130, 246, 0.9)',
            boxShadow: '4px 4px 0px rgba(0,0,0,1)',
            transform: 'translate(0, 0)',
            transition: 'all 0.15s ease-in-out',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translate(-2px, -2px)';
            e.currentTarget.style.boxShadow = '6px 6px 0px rgba(0,0,0,1)';
            e.currentTarget.style.backgroundColor = 'rgba(37, 99, 235, 0.95)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translate(0, 0)';
            e.currentTarget.style.boxShadow = '4px 4px 0px rgba(0,0,0,1)';
            e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.9)';
          }}
        >
          <span className="pixel-font text-xs font-bold text-white">
            🏠 Home
          </span>
        </button>
      </div>
    </>
  );
}
