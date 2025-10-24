import React from 'react';
import {type PokedexPokemon} from '@features/pokedex';

// Constants
const SPRITE_WIDTH = 68;
const SPRITE_HEIGHT = 72;
const MOVE_SPEED = 150;
const MAP_WIDTH = 10560;
const MAP_HEIGHT = 6080;

interface PokemonSpawn {
  pokemon: PokedexPokemon;
  x: number;
  y: number;
}

interface MapViewProps {
  camera: {x: number; y: number};
  screenPos: {x: number; y: number};
  spritePos: {backgroundPositionX: string; backgroundPositionY: string};
  wildPokemon: PokemonSpawn[];
  nearbyPokemon: PokemonSpawn | null;
  worldPosition: {x: number; y: number};
  user: any;
  collisionMapLoaded: boolean;
  isDarkMode?: boolean;
}

export function MapView({
  camera,
  screenPos,
  spritePos,
  wildPokemon,
  nearbyPokemon,
  worldPosition,
  user,
  collisionMapLoaded,
  isDarkMode = false,
}: MapViewProps) {
  return (
    <>
      {/* Map Background - scrolls to follow character */}
      <div
        className="absolute transition-all ease-linear"
        style={{
          width: `${MAP_WIDTH}px`,
          height: `${MAP_HEIGHT}px`,
          left: `-${camera.x}px`,
          top: `-${camera.y}px`,
          backgroundImage: `url('${import.meta.env.BASE_URL}map.webp')`,
          backgroundSize: `${MAP_WIDTH}px ${MAP_HEIGHT}px`,
          backgroundRepeat: 'no-repeat',
          imageRendering: 'pixelated',
          transitionDuration: `${MOVE_SPEED}ms`,
        }}
      >
        {/* Wild Pokemon - positioned in world coordinates inside map layer */}
        {wildPokemon.map((wildPoke, index) => (
          <img
            key={`${wildPoke.pokemon.id}-${index}`}
            src={wildPoke.pokemon.sprite}
            alt={wildPoke.pokemon.name}
            className="absolute"
            style={{
              left: `${wildPoke.x - 24}px`, // World coordinates, centered
              top: `${wildPoke.y - 24}px`,
              width: '48px',
              height: '48px',
              imageRendering: 'pixelated',
              pointerEvents: 'none',
            }}
            title={wildPoke.pokemon.name}
          />
        ))}
      </div>

      {/* Character Sprite - stays centered in viewport */}
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

      {/* Battle Prompt Popup */}
      {nearbyPokemon && (
        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-2 md:bottom-4 z-30 w-[94%] max-w-[640px]"
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
              style={{imageRendering: 'pixelated'}}
            />
            <span className="pixel-font text-xs md:text-sm truncate">
              {nearbyPokemon.pokemon.name} nearby!
            </span>
            <button
              className={`ml-auto text-white px-2 py-1 md:px-3 md:py-1.5 pixel-font text-xs md:text-sm border-2 rounded ${
                isDarkMode
                  ? 'bg-red-700 hover:bg-red-800 border-gray-600'
                  : 'bg-red-600 hover:bg-red-700 border-black'
              }`}
              onClick={() => {
                // Placeholder action for now
                console.log('Battle start with', nearbyPokemon.pokemon.name);
              }}
            >
              Battle!
            </button>
          </div>
        </div>
      )}

      {/* Position Debug Info */}
      <div className="hidden lg:block absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 pixel-font text-[10px] border border-white z-20">
        <div>World: {Math.floor(worldPosition.x)}, {Math.floor(worldPosition.y)}</div>
        <div>Camera: {Math.floor(camera.x)}, {Math.floor(camera.y)}</div>
        <div>
          Collision: {collisionMapLoaded ? '✓ Loaded' : '⏳ Loading...'}
        </div>
        <div>Wild Pokemon: {wildPokemon.length}</div>
      </div>

      {/* Rare Candy Counter (Top Right) */}
      <div className="absolute top-2 right-2 z-20">
        <div className="flex items-center gap-2 bg-white/90 border-2 border-black px-2 py-1 shadow-[4px_4px_0_rgba(0,0,0,1)]">
          <img
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/rare-candy.png"
            alt="Rare Candy"
            className="w-6 h-6"
            style={{imageRendering: 'pixelated'}}
          />
          <span className="pixel-font text-base font-bold text-black">
            {Math.floor(user?.rare_candy ?? 0)}
          </span>
        </div>
      </div>
    </>
  );
}