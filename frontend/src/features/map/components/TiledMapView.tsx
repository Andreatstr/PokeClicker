import {type PokedexPokemon} from '@features/pokedex';
import {useTileRenderer} from '../hooks/useTileRenderer';

// Constants
const SPRITE_WIDTH = 68;
const SPRITE_HEIGHT = 72;
const MOVE_SPEED = 120;
const TILE_SIZE = 512;

interface PokemonSpawn {
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
  user: any;
  collisionMapLoaded: boolean;
  viewportSize: {width: number; height: number};
  isDarkMode?: boolean;
}

export function TiledMapView({
  camera,
  screenPos,
  spritePos,
  wildPokemon,
  nearbyPokemon,
  worldPosition,
  user,
  collisionMapLoaded,
  viewportSize,
  isDarkMode = false,
}: TiledMapViewProps) {
  const {visibleTiles, visiblePokemon, isLoading} = useTileRenderer(camera, viewportSize, wildPokemon);

  return (
    <>
      {/* Tiled Map Background */}
      <div className="absolute inset-0 overflow-hidden">
        {visibleTiles.map((tile) => {
          const key = `${tile.x}_${tile.y}`;
          return (
            <div
              key={key}
              className="absolute transition-none"
              style={{
                left: `${tile.screenX}px`,
                top: `${tile.screenY}px`,
                width: `${TILE_SIZE}px`,
                height: `${TILE_SIZE}px`,
                backgroundImage: tile.loaded ? `url('${tile.src}')` : 'none',
                backgroundSize: `${TILE_SIZE}px ${TILE_SIZE}px`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: '0 0',
                imageRendering: 'pixelated',
                opacity: tile.loaded ? 1 : 0.3,
                backgroundColor: tile.loaded ? 'transparent' : '#1a2a1a',
              }}
            />
          );
        })}
        
        {/* Wild Pokemon - positioned absolutely on the map */}
        {visiblePokemon.map((visiblePoke, index) => (
          <img
            key={`${visiblePoke.pokemon.id}-${index}`}
            src={visiblePoke.pokemon.sprite}
            alt={visiblePoke.pokemon.name}
            className="absolute transition-none"
            style={{
              left: `${visiblePoke.screenX - 24}px`, // Pre-calculated screen coordinates
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

      {/* Optional subtle loading indicator (non-blocking) */}
      {isLoading && (
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-40 text-white px-1 py-0.5 pixel-font text-[10px] z-10 pointer-events-none opacity-50">
          •
        </div>
      )}


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
          Collision: {collisionMapLoaded ? 'Loaded' : 'Loading...'}
        </div>
        <div>Wild Pokemon: {wildPokemon.length}</div>
        <div>Visible Tiles: {visibleTiles.length}</div>
        <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
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