import React from 'react';
import {type PokedexPokemon} from '@features/pokedex';
import {useTileRenderer} from '../hooks/useTileRenderer';
import {useCanvasRenderer} from '../hooks/useCanvasRenderer';

// Constants
const SHEET_FRAME_CELL_W = 68; // width of each frame cell in the image file
const SHEET_FRAME_CELL_H = 72; // height of each frame cell in the image file
const SHEET_COLS = 4;
const SHEET_ROWS = 4;

const SPRITE_WIDTH = 46; // Character sprite display width
const SPRITE_HEIGHT = 48.70588; // Character sprite display height

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
  worldPosition: {x: number; y: number};
  collisionMapLoaded: boolean;
  isPositionSemiWalkable: (x: number, y: number) => boolean;
  viewportSize: {width: number; height: number};
  isDarkMode?: boolean;
}

export function TiledMapView(props: TiledMapViewProps) {
  const {
    camera,
    screenPos,
    spritePos,
    wildPokemon,
    worldPosition,
    isPositionSemiWalkable,
    viewportSize,
    isDarkMode = false,
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

  // --- From main ---
  function parsePx(value?: string | number) {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    return parseFloat(String(value).replace('px', '')) || 0;
  }

  const backgroundSizeWidth = SHEET_COLS * SPRITE_WIDTH;
  const backgroundSizeHeight = SHEET_ROWS * SPRITE_HEIGHT;

  // scale factor from sheet cell -> displayed frame
  const scaleX = SPRITE_WIDTH / SHEET_FRAME_CELL_W;
  const scaleY = SPRITE_HEIGHT / SHEET_FRAME_CELL_H;

  // scale incoming background positions (handles strings like "-68px")
  const rawPosX = parsePx(spritePos.backgroundPositionX);
  const rawPosY = parsePx(spritePos.backgroundPositionY);

  const scaledPosX = `${rawPosX * scaleX}px`;
  const scaledPosY = `${rawPosY * scaleY}px`;

  return (
    <>
      {/* Map Background */}
      <div
        ref={containerRef}
        className="absolute inset-0 overflow-hidden"
        style={
          {
            imageRendering: 'pixelated',
            WebkitFontSmoothing: 'none',
          } as React.CSSProperties
        }
      >
        {/* Wild Pokemon */}
        {visiblePokemon.map((visiblePoke, index) => (
          <img
            key={`${visiblePoke.pokemon.id}-${index}`}
            src={visiblePoke.pokemon.sprite}
            alt={visiblePoke.pokemon.name}
            className="absolute"
            fetchPriority="high"
            style={
              {
                left: `${visiblePoke.screenX - 24}px`,
                top: `${visiblePoke.screenY - 24}px`,
                width: '48px',
                height: '48px',
                imageRendering: 'pixelated',
                msInterpolationMode: 'nearest-neighbor',
                WebkitFontSmoothing: 'none',
                pointerEvents: 'none',
                willChange: 'transform',
                backfaceVisibility: 'hidden',
                transform: 'translateZ(0)',
                zIndex: 5, // Above tiles but below character
              } as React.CSSProperties
            }
            title={visiblePoke.pokemon.name}
          />
        ))}
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-40 text-white px-1 py-0.5 pixel-font text-[10px] z-10 pointer-events-none opacity-50"></div>
      )}

      {/* Character Sprite */}
      <div
        className="absolute"
        style={
          {
            top: `${screenPos.y}px`,
            left: `${screenPos.x}px`,
            width: `${SPRITE_WIDTH}px`,
            height: `${SPRITE_HEIGHT}px`,
            backgroundImage: `url('${import.meta.env.BASE_URL}AshKetchumSprite.webp')`,
            backgroundSize: `${backgroundSizeWidth}px ${backgroundSizeHeight}px`,
            backgroundPositionX: scaledPosX,
            backgroundPositionY: scaledPosY,
            imageRendering: 'pixelated',
            WebkitFontSmoothing: 'none',
            willChange: 'top, left',
            opacity: isPositionSemiWalkable(
              worldPosition.x,
              worldPosition.y + SPRITE_HEIGHT / 2 - 24
            )
              ? 0.5
              : 1,
            zIndex: 10,
          } as React.CSSProperties
        }
      />

      {/* Candy counter is now global via CandyCounterOverlay */}
    </>
  );
}
