import React from 'react';
import {useState} from 'react';
import {type PokedexPokemon} from '@features/pokedex';
import {useTileRenderer} from '../hooks/useTileRenderer';
import {useCanvasRenderer} from '../hooks/useCanvasRenderer';
import {formatNumber} from '@/lib/formatNumber';

// Constants
const SHEET_FRAME_CELL_W = 68; // width of each frame cell in the image file
const SHEET_FRAME_CELL_H = 72; // height of each frame cell in the image file
const SHEET_COLS = 4;
const SHEET_ROWS = 4;

const SPRITE_WIDTH = 46; // Character sprite display width
const SPRITE_HEIGHT = 48.70588; // Character sprite display height

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
  user: {rare_candy?: number} | null;
  collisionMapLoaded: boolean;
  isPositionSemiWalkable: (x: number, y: number) => boolean;
  teleportLocation: string | null;
  isTeleporting: boolean;
  teleportCooldown: number;
  viewportSize: {width: number; height: number};
  isDarkMode?: boolean;
  onStartBattle: (pokemon: PokedexPokemon, spawnId: string) => void;
  onTeleport: () => void;
}

export function TiledMapView(props: TiledMapViewProps) {
  const {
    camera,
    screenPos,
    spritePos,
    wildPokemon,
    nearbyPokemon,
    user,
    worldPosition,
    isPositionSemiWalkable,
    teleportLocation,
    isTeleporting,
    teleportCooldown,
    viewportSize,
    isDarkMode = false,
    onStartBattle,
    onTeleport,
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
    backgroundColor: isDarkMode ? '#000000' : '#000000',
  });

  const [showWelcomeCTA, setShowWelcomeCTA] = useState(() => {
    return user &&
      'owned_pokemon_ids' in user &&
      Array.isArray(user.owned_pokemon_ids)
      ? user.owned_pokemon_ids.length <= 3
      : false;
  });

  function parsePx(value?: string | number) {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    return parseFloat(String(value).replace('px', '')) || 0;
  }

  const backgroundSizeWidth = SHEET_COLS * SPRITE_WIDTH; // 4 * 46 = 184
  const backgroundSizeHeight = SHEET_ROWS * SPRITE_HEIGHT; // 4 * 56 = 224

  // scale factor from sheet cell -> displayed frame
  const scaleX = SPRITE_WIDTH / SHEET_FRAME_CELL_W; // 46/68
  const scaleY = SPRITE_HEIGHT / SHEET_FRAME_CELL_H; // 56/72

  // scale incoming background positions (handles strings like "-68px")
  const rawPosX = parsePx(spritePos.backgroundPositionX);
  const rawPosY = parsePx(spritePos.backgroundPositionY);

  const scaledPosX = `${rawPosX * scaleX}px`;
  const scaledPosY = `${rawPosY * scaleY}px`;

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
          backgroundSize: `${backgroundSizeWidth}px ${backgroundSizeHeight}px`,
          backgroundPositionX: scaledPosX,
          backgroundPositionY: scaledPosY,
          imageRendering: 'pixelated',
          transition: `top ${MOVE_SPEED}ms ease-linear, left ${MOVE_SPEED}ms ease-linear, opacity 200ms ease-in-out`,
          opacity: isPositionSemiWalkable(
            worldPosition.x,
            worldPosition.y + SPRITE_HEIGHT / 2 - 24
          )
            ? 0.5
            : 1,
          zIndex: 10,
        }}
      />

      {/* Teleport Notification */}
      {teleportLocation && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none animate-fade-in">
          <div
            className={`pixel-font text-center px-4 py-2 rounded border-2 shadow-[4px_4px_0px_rgba(0,0,0,1)] ${
              isDarkMode
                ? 'bg-blue-500 text-white border-black'
                : 'bg-blue-500 text-white border-black'
            }`}
          >
            <div className="pixel-font text-xs font-bold text-white">
              Teleported to {teleportLocation}
            </div>
          </div>
        </div>
      )}

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
            {formatNumber(Math.floor(user?.rare_candy ?? 0))}
          </span>
        </div>
      </div>

      {/* Teleport Button - always bottom left */}
      <div className="absolute bottom-3 left-2 z-20">
        <button
          onClick={onTeleport}
          disabled={isTeleporting || teleportCooldown > 0}
          className="flex items-center gap-1 border-2 border-black px-2 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
          title={
            isTeleporting
              ? 'Teleporting...'
              : teleportCooldown > 0
                ? `Wait ${teleportCooldown}s`
                : 'Teleport to random location'
          }
          style={{
            backgroundColor:
              isTeleporting || teleportCooldown > 0
                ? 'rgba(59, 130, 246, 0.85)'
                : 'rgba(59, 130, 246, 0.9)',
            boxShadow: '4px 4px 0px rgba(0,0,0,1)',
            transform: 'translate(0, 0)',
            transition: 'all 0.15s ease-in-out',
          }}
          onMouseEnter={(e) => {
            if (!isTeleporting && teleportCooldown === 0) {
              e.currentTarget.style.transform = 'translate(-2px, -2px)';
              e.currentTarget.style.boxShadow = '6px 6px 0px rgba(0,0,0,1)';
              e.currentTarget.style.backgroundColor = 'rgba(37, 99, 235, 0.95)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translate(0, 0)';
            e.currentTarget.style.boxShadow = '4px 4px 0px rgba(0,0,0,1)';
            e.currentTarget.style.backgroundColor =
              isTeleporting || teleportCooldown > 0
                ? 'rgba(59, 130, 246, 0.85)'
                : 'rgba(59, 130, 246, 0.9)';
          }}
        >
          <svg
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="w-4 h-4 text-white flex-shrink-0"
          >
            <path
              d="M7 2h10v2H7V2zM5 6V4h2v2H5zm0 8H3V6h2v8zm2 2H5v-2h2v2zm2 2H7v-2h2v2zm2 2H9v-2h2v2zm2 0v2h-2v-2h2zm2-2v2h-2v-2h2zm2-2v2h-2v-2h2zm2-2v2h-2v-2h2zm0-8h2v8h-2V6zm0 0V4h-2v2h2zm-5 2h-4v4h4V8z"
              fill="currentColor"
            />
          </svg>
          <span className="pixel-font text-xs font-bold text-white">
            {isTeleporting
              ? ' Teleporting'
              : teleportCooldown > 0
                ? ` Wait ${teleportCooldown}s`
                : ' Teleport'}
          </span>
        </button>
      </div>
    </>
  );
}
