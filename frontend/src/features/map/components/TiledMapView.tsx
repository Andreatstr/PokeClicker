import React from 'react';
import {useState, useEffect} from 'react';
import {type PokedexPokemon} from '@features/pokedex';
import {useTileRenderer} from '../hooks/useTileRenderer';
import {useCanvasRenderer} from '../hooks/useCanvasRenderer';
import {formatNumber} from '@/lib/formatNumber';
import {useMobileDetection} from '@/hooks/useMobileDetection';
import {Button} from '@ui/pixelact';

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
  user: {rare_candy?: number} | null;
  collisionMapLoaded: boolean;
  viewportSize: {width: number; height: number};
  isDarkMode?: boolean;
  onStartBattle: (pokemon: PokedexPokemon, spawnId: string) => void;
  onResetToHome: () => void;
  showWorldInfo?: boolean;
  onCloseWorldInfo?: () => void;
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
    showWorldInfo: externalShowWorldInfo,
    onCloseWorldInfo,
  } = props;

  const {visibleTiles, visiblePokemon, isLoading, tileCacheRef} =
    useTileRenderer(camera, viewportSize, wildPokemon);

  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const isMobile = useMobileDetection(768);

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

  const [internalShowWorldInfo, setInternalShowWorldInfo] = useState(false);
  const showWorldInfo =
    externalShowWorldInfo !== undefined
      ? externalShowWorldInfo
      : internalShowWorldInfo;
  const handleCloseWorldInfo = () => {
    if (onCloseWorldInfo) {
      onCloseWorldInfo();
    } else {
      setInternalShowWorldInfo(false);
    }
  };

  // Hide scrollbar on mobile
  useEffect(() => {
    if (isMobile && showWorldInfo) {
      const style = document.createElement('style');
      style.id = 'world-guide-scrollbar-hide';
      style.textContent = `
        #world-guide-modal::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }
      `;
      document.head.appendChild(style);
      return () => {
        const existingStyle = document.head.querySelector(
          '#world-guide-scrollbar-hide'
        );
        if (existingStyle) {
          document.head.removeChild(existingStyle);
        }
      };
    }
  }, [isMobile, showWorldInfo]);

  const accentColor = isDarkMode ? '#facc15' : '#3971a9ff';
  const bodyTextColor = isDarkMode ? '#e5e7eb' : '#18181b';

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
      <div className="absolute top-2 right-3 z-20">
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

      {/* Home Button - bottom left */}
      <div className="absolute bottom-3 left-2 z-20">
        <button
          onClick={onResetToHome}
          className="flex items-center justify-center border-2 border-black w-10 h-10 text-white"
          title="Return to home position"
          aria-label="Return to home position"
          style={{
            backgroundColor: 'rgba(59, 130, 246, 0.9)',
            boxShadow: '4px 4px 0px rgba(0,0,0,1)',
            transform: 'translate(0, 0)',
            transition: 'all 0.15s ease-in-out',
            color: 'white',
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
          <svg
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="w-5 h-5"
          >
            <path
              d="M14 2h-4v2H8v2H6v2H4v2H2v2h2v10h7v-6h2v6h7V12h2v-2h-2V8h-2V6h-2V4h-2V2zm0 2v2h2v2h2v2h2v2h-2v8h-3v-6H9v6H6v-8H4v-2h2V8h2V6h2V4h4z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>

      {/* Info Button - bottom right (only show if not controlled externally) */}
      {!onCloseWorldInfo && (
        <div className="absolute bottom-3 right-3 z-20">
          <button
            onClick={() => setInternalShowWorldInfo(true)}
            className="flex items-center justify-center border-2 border-black w-10 h-10 text-white"
            aria-label="How World works"
            title="How World works"
            style={{
              backgroundColor: 'rgba(59, 130, 246, 0.9)',
              boxShadow: '4px 4px 0px rgba(0,0,0,1)',
              transform: 'translate(0, 0)',
              transition: 'all 0.15s ease-in-out',
              color: 'white',
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
            <svg
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="w-5 h-5"
            >
              <path
                d="M3 3h2v18H3V3zm16 0H5v2h14v14H5v2h16V3h-2zm-8 6h2V7h-2v2zm2 8h-2v-6h2v6z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
      )}

      {/* World Info Modal */}
      {showWorldInfo && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[10000]"
            onClick={handleCloseWorldInfo}
            aria-hidden="true"
            style={{
              backgroundColor: isDarkMode
                ? 'rgba(0, 0, 0, 0.8)'
                : 'rgba(0, 0, 0, 0.7)',
            }}
          />
          {/* Card Modal */}
          <div
            className={`fixed z-[10001] overflow-y-auto ${
              isMobile
                ? 'bottom-0 left-0 right-0 w-full max-h-[85vh]'
                : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-[960px] max-h-[90vh]'
            } ${isMobile ? '[&::-webkit-scrollbar]:hidden' : ''}`}
            role="dialog"
            aria-labelledby="world-guide-title"
            aria-modal="true"
            id="world-guide-modal"
            style={{
              scrollbarWidth: isMobile ? 'none' : 'auto',
              msOverflowStyle: isMobile ? 'none' : 'auto',
              backgroundColor: 'transparent',
            }}
          >
            <div
              className={`pixel-font border-4 p-3 md:p-4 relative overflow-hidden backdrop-blur-md w-full min-h-full ${
                isDarkMode
                  ? 'bg-gray-900 border-gray-700'
                  : 'bg-[#f5f1e8] border-black'
              } ${isMobile ? 'border-b-0 border-l-0 border-r-0 rounded-t-lg' : ''}`}
              style={{
                borderColor: isDarkMode ? '#333333' : 'black',
                boxShadow: isDarkMode
                  ? '4px 4px 0px rgba(51,51,51,1)'
                  : '4px 4px 0px rgba(0,0,0,1)',
                backgroundColor: isDarkMode
                  ? 'rgba(20, 20, 20, 0.98)'
                  : 'rgba(245, 241, 232, 1)',
              }}
            >
              {/* Close Button */}
              <button
                className="absolute top-2 right-2 z-10 py-1 px-2 text-xs bg-red-600 text-white font-bold border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_rgba(0,0,0,1)] transition-all"
                onClick={handleCloseWorldInfo}
                aria-label="Exit"
              >
                X
              </button>

              {/* Header */}
              <header className="mb-4">
                <h2
                  id="world-guide-title"
                  className="pixel-font text-base font-bold"
                  style={{color: accentColor}}
                >
                  How to play
                </h2>
              </header>
              <div className="px-4 py-3 md:px-8 md:py-6">
                {/* Battle flow (inline sprite, Battle! button, candy) */}
                <div
                  className="mx-auto mt-4 md:mt-6"
                  style={{maxWidth: '100%'}}
                >
                  <div className="flex flex-col md:flex-row md:items-stretch md:justify-center gap-3 md:gap-4">
                    {/* Step 1: Find Pokemon */}
                    <div
                      className={`flex flex-col items-start gap-2 p-2 md:p-3 md:min-w-[200px] border-2 rounded-sm shadow-[4px_4px_0_rgba(0,0,0,1)] ${
                        isDarkMode
                          ? 'bg-gray-800 border-gray-600'
                          : 'bg-white border-black'
                      }`}
                    >
                      <span
                        className="pixel-font text-xs md:text-[10px] text-left"
                        style={{color: isDarkMode ? '#e5e7eb' : '#111827'}}
                      >
                        <span className="font-bold">1.</span> Find a pokemon
                      </span>
                      <div
                        className="relative flex items-center justify-center self-center"
                        style={{
                          width: 96,
                          height: 96,
                        }}
                      >
                        <img
                          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png"
                          alt="Wild Pokémon"
                          className="image-pixelated relative z-10"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            imageRendering: 'pixelated',
                            filter:
                              'drop-shadow(0 0 12px rgba(34, 197, 94, 0.6)) drop-shadow(0 0 20px rgba(34, 197, 94, 0.4))',
                          }}
                        />
                      </div>
                    </div>

                    {/* Step 2: Press Battle */}
                    <div
                      className={`flex flex-col items-start gap-6 p-2 md:p-3 md:min-w-[200px] border-2 rounded-sm shadow-[4px_4px_0_rgba(0,0,0,1)] ${
                        isDarkMode
                          ? 'bg-gray-800 border-gray-600'
                          : 'bg-white border-black'
                      }`}
                    >
                      <span
                        className="pixel-font text-xs md:text-[10px] text-left"
                        style={{color: isDarkMode ? '#e5e7eb' : '#111827'}}
                      >
                        <span className="font-bold">2.</span> Press Battle!
                      </span>
                      <button
                        type="button"
                        className={`text-white px-4 py-2 md:px-6 md:py-3 pixel-font text-sm md:text-base border-2 rounded focus-visible:outline focus-visible:outline-3 focus-visible:outline-[#0066ff] focus-visible:outline-offset-2 self-center ${
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
                        onMouseEnter={(e) => {
                          if (isMobile) return;
                          e.currentTarget.style.transform =
                            'translate(-2px, -2px)';
                          e.currentTarget.style.boxShadow = isDarkMode
                            ? '6px 6px 0px rgba(51,51,51,1)'
                            : '6px 6px 0px rgba(0,0,0,1)';
                          e.currentTarget.style.backgroundColor = isDarkMode
                            ? '#991b1b'
                            : '#b91c1c';
                        }}
                        onMouseLeave={(e) => {
                          if (isMobile) return;
                          e.currentTarget.style.transform = 'translate(0, 0)';
                          e.currentTarget.style.boxShadow = isDarkMode
                            ? '4px 4px 0px rgba(51,51,51,1)'
                            : '4px 4px 0px rgba(0,0,0,1)';
                          e.currentTarget.style.backgroundColor = isDarkMode
                            ? '#b91c1c'
                            : '#dc2626';
                        }}
                        onClick={(e) => e.preventDefault()}
                        aria-label="Battle"
                      >
                        Battle!
                      </button>
                    </div>

                    {/* Step 3: Win to Earn Candy */}
                    <div
                      className={`flex flex-col items-start gap-2 p-2 md:p-3 md:min-w-[200px] border-2 rounded-sm shadow-[4px_4px_0_rgba(0,0,0,1)] ${
                        isDarkMode
                          ? 'bg-gray-800 border-gray-600'
                          : 'bg-white border-black'
                      }`}
                    >
                      <span
                        className="pixel-font text-xs md:text-[10px] text-left"
                        style={{color: isDarkMode ? '#e5e7eb' : '#111827'}}
                      >
                        <span className="font-bold">3.</span> Win to gain candy
                        and new pokemon
                      </span>
                      <div className="flex items-center gap-2 self-center">
                        <div className="relative flex items-center justify-center">
                          <img
                            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/rare-candy.png"
                            alt="Candy"
                            className="relative z-10"
                            style={{
                              width: 58,
                              height: 58,
                              imageRendering: 'pixelated',
                              filter:
                                'drop-shadow(0 0 12px rgba(236, 72, 153, 0.6)) drop-shadow(0 0 20px rgba(236, 72, 153, 0.4))',
                            }}
                          />
                        </div>
                        <span
                          className="pixel-font text-lg font-bold"
                          style={{color: isDarkMode ? '#e5e7eb' : '#111827'}}
                        >
                          +
                        </span>
                        <div className="relative flex items-center justify-center">
                          <img
                            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png"
                            alt="New Pokemon"
                            className="relative z-10"
                            style={{
                              width: 96,
                              height: 96,
                              imageRendering: 'pixelated',
                              filter:
                                'drop-shadow(0 0 12px rgba(34, 197, 94, 0.6)) drop-shadow(0 0 20px rgba(34, 197, 94, 0.4))',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional guidance */}
                <div className="mt-6 md:mt-8 space-y-4">
                  <section>
                    <h3
                      className="pixel-font text-sm font-bold mb-2"
                      style={{color: accentColor}}
                    >
                      Movement
                    </h3>
                    <div className="flex items-center justify-center gap-4 md:gap-6 flex-wrap">
                      {/* Arrow keys layout - hidden on mobile */}
                      {!isMobile && (
                        <>
                          <div
                            className="flex flex-col items-center gap-1"
                            aria-label="Arrow keys"
                          >
                            <div className="flex justify-center">
                              <span
                                className="pixel-font text-xs border-2 px-3 py-1"
                                style={{
                                  background: isDarkMode
                                    ? '#f9fafb'
                                    : '#ffffff',
                                  color: '#111827',
                                  borderColor: 'black',
                                  boxShadow: '2px 2px 0 rgba(0,0,0,1)',
                                }}
                              >
                                ▲
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span
                                className="pixel-font text-xs border-2 px-3 py-1"
                                style={{
                                  background: isDarkMode
                                    ? '#f9fafb'
                                    : '#ffffff',
                                  color: '#111827',
                                  borderColor: 'black',
                                  boxShadow: '2px 2px 0 rgba(0,0,0,1)',
                                }}
                              >
                                ◀
                              </span>
                              <span
                                className="pixel-font text-xs border-2 px-3 py-1"
                                style={{
                                  background: isDarkMode
                                    ? '#f9fafb'
                                    : '#ffffff',
                                  color: '#111827',
                                  borderColor: 'black',
                                  boxShadow: '2px 2px 0 rgba(0,0,0,1)',
                                }}
                              >
                                ▼
                              </span>
                              <span
                                className="pixel-font text-xs border-2 px-3 py-1"
                                style={{
                                  background: isDarkMode
                                    ? '#f9fafb'
                                    : '#ffffff',
                                  color: '#111827',
                                  borderColor: 'black',
                                  boxShadow: '2px 2px 0 rgba(0,0,0,1)',
                                }}
                              >
                                ▶
                              </span>
                            </div>
                            <span
                              className="pixel-font text-[10px] mt-1 h-4 flex items-center justify-center"
                              style={{
                                color: isDarkMode ? '#e5e7eb' : '#111827',
                              }}
                            >
                              Arrow Keys
                            </span>
                          </div>

                          <span
                            className="pixel-font text-xs opacity-60"
                            style={{
                              color: isDarkMode ? '#e5e7eb' : '#111827',
                            }}
                          >
                            or
                          </span>

                          {/* WASD layout - hidden on mobile */}
                          <div
                            className="flex flex-col items-center gap-1"
                            aria-label="WASD keys"
                          >
                            <div className="flex justify-center">
                              <span
                                className="pixel-font text-xs border-2 px-3 py-1"
                                style={{
                                  background: isDarkMode
                                    ? '#f9fafb'
                                    : '#ffffff',
                                  color: '#111827',
                                  borderColor: 'black',
                                  boxShadow: '2px 2px 0 rgba(0,0,0,1)',
                                }}
                              >
                                W
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span
                                className="pixel-font text-xs border-2 px-3 py-1"
                                style={{
                                  background: isDarkMode
                                    ? '#f9fafb'
                                    : '#ffffff',
                                  color: '#111827',
                                  borderColor: 'black',
                                  boxShadow: '2px 2px 0 rgba(0,0,0,1)',
                                }}
                              >
                                A
                              </span>
                              <span
                                className="pixel-font text-xs border-2 px-3 py-1"
                                style={{
                                  background: isDarkMode
                                    ? '#f9fafb'
                                    : '#ffffff',
                                  color: '#111827',
                                  borderColor: 'black',
                                  boxShadow: '2px 2px 0 rgba(0,0,0,1)',
                                }}
                              >
                                S
                              </span>
                              <span
                                className="pixel-font text-xs border-2 px-3 py-1"
                                style={{
                                  background: isDarkMode
                                    ? '#f9fafb'
                                    : '#ffffff',
                                  color: '#111827',
                                  borderColor: 'black',
                                  boxShadow: '2px 2px 0 rgba(0,0,0,1)',
                                }}
                              >
                                D
                              </span>
                            </div>
                            <span
                              className="pixel-font text-[10px] mt-1 h-4 flex items-center justify-center"
                              style={{
                                color: isDarkMode ? '#e5e7eb' : '#111827',
                              }}
                            >
                              WASD
                            </span>
                          </div>
                          <span
                            className="pixel-font text-xs opacity-60"
                            style={{
                              color: isDarkMode ? '#e5e7eb' : '#111827',
                            }}
                          >
                            or
                          </span>
                        </>
                      )}
                      {/* Joystick preview (non-interactive) */}
                      <div
                        className="flex flex-col items-center gap-1"
                        style={{pointerEvents: 'none'}}
                        aria-label="Joystick preview"
                      >
                        <div
                          style={{transform: 'scale(0.7)', height: '70px'}}
                          className="relative w-[100px] h-[100px]"
                        >
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 bg-[#2a2a3e] rounded-full shadow-md border-2 border-[#1a1a2e]"></div>
                          </div>
                          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-red-500 rounded-full border-2 border-red-700 shadow-lg" />
                        </div>
                        <span
                          className="pixel-font text-[10px] h-4 flex items-center justify-center w-full"
                          style={{
                            color: isDarkMode ? '#e5e7eb' : '#111827',
                          }}
                        >
                          Joystick
                        </span>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3
                      className="pixel-font text-sm font-bold mb-2"
                      style={{color: accentColor}}
                    >
                      Controls
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span
                            className="pixel-font text-[11px]"
                            style={{color: bodyTextColor}}
                          >
                            Start battle:
                          </span>
                          <Button
                            size="sm"
                            bgColor="#8B3A62"
                            className="w-10 h-10 rounded-full border-2 shadow-lg pixel-font text-xs text-white font-bold p-0"
                            aria-label="B button"
                            style={
                              {
                                borderColor: '#2a2a3e',
                                '--custom-inner-border-color': '#2a2a3e',
                                pointerEvents: 'none',
                              } as React.CSSProperties
                            }
                          >
                            B
                          </Button>
                          {!isMobile && (
                            <span
                              className="pixel-font text-xs border-2 px-2 py-1"
                              style={{
                                background: isDarkMode ? '#f9fafb' : '#ffffff',
                                color: '#111827',
                                borderColor: 'black',
                                boxShadow: '2px 2px 0 rgba(0,0,0,1)',
                              }}
                            >
                              B
                            </span>
                          )}
                          <button
                            type="button"
                            className={`text-white px-3 py-1.5 pixel-font text-xs border-2 rounded focus-visible:outline focus-visible:outline-3 focus-visible:outline-[#0066ff] focus-visible:outline-offset-2 ${
                              isDarkMode ? 'border-gray-600' : 'border-black'
                            }`}
                            style={{
                              backgroundColor: isDarkMode
                                ? '#b91c1c'
                                : '#dc2626',
                              boxShadow: isDarkMode
                                ? '2px 2px 0px rgba(51,51,51,1)'
                                : '2px 2px 0px rgba(0,0,0,1)',
                            }}
                            onClick={(e) => e.preventDefault()}
                            aria-label="Battle"
                          >
                            Battle!
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span
                            className="pixel-font text-[11px]"
                            style={{color: bodyTextColor}}
                          >
                            Attack:
                          </span>
                          <Button
                            size="sm"
                            bgColor="#8B3A62"
                            className="w-10 h-10 rounded-full border-2 shadow-lg pixel-font text-xs text-white font-bold p-0"
                            aria-label="A button"
                            style={
                              {
                                borderColor: '#2a2a3e',
                                '--custom-inner-border-color': '#2a2a3e',
                                pointerEvents: 'none',
                              } as React.CSSProperties
                            }
                          >
                            A
                          </Button>
                          <Button
                            size="sm"
                            bgColor="#8B3A62"
                            className="w-10 h-10 rounded-full border-2 shadow-lg pixel-font text-xs text-white font-bold p-0"
                            aria-label="B button"
                            style={
                              {
                                borderColor: '#2a2a3e',
                                '--custom-inner-border-color': '#2a2a3e',
                                pointerEvents: 'none',
                              } as React.CSSProperties
                            }
                          >
                            B
                          </Button>
                          {!isMobile && (
                            <>
                              <span
                                className="pixel-font text-xs border-2 px-2 py-1"
                                style={{
                                  background: isDarkMode
                                    ? '#f9fafb'
                                    : '#ffffff',
                                  color: '#111827',
                                  borderColor: 'black',
                                  boxShadow: '2px 2px 0 rgba(0,0,0,1)',
                                }}
                              >
                                A
                              </span>
                              <span
                                className="pixel-font text-xs border-2 px-2 py-1"
                                style={{
                                  background: isDarkMode
                                    ? '#f9fafb'
                                    : '#ffffff',
                                  color: '#111827',
                                  borderColor: 'black',
                                  boxShadow: '2px 2px 0 rgba(0,0,0,1)',
                                }}
                              >
                                B
                              </span>
                            </>
                          )}
                          <img
                            src={`${import.meta.env.BASE_URL}pixilated-hand.webp`}
                            alt="Hand"
                            className="w-8 h-8"
                          />
                        </div>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3
                      className="pixel-font text-sm font-bold mt-6 md:mt-8 mb-2"
                      style={{color: accentColor}}
                    >
                      Quick Tips
                    </h3>
                    <ul
                      className="pixel-font text-[11px] leading-relaxed space-y-1 ml-4 list-none"
                      style={{color: bodyTextColor}}
                    >
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>
                          Toggle fullscreen for an immersive experience
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>
                          Pick Pokémon in Profile wisely to beat hard Pokémon
                        </span>
                      </li>
                    </ul>
                  </section>
                </div>

                {/* Got it! Button */}
                <div className="mt-6 md:mt-8 flex justify-end">
                  <button
                    className="pixel-font text-xs font-bold border-2 px-4 py-2 shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_rgba(0,0,0,1)] transition-all"
                    onClick={handleCloseWorldInfo}
                    style={{
                      backgroundColor: '#11873cff',
                      color: 'white',
                      borderColor: 'black',
                    }}
                  >
                    Got it!
                  </button>
                </div>

                {/* Visual, minimal guide */}
                <div className="mx-auto hidden" style={{maxWidth: 420}}>
                  <div
                    className="relative border-4 rounded-sm shadow-[6px_6px_0_rgba(0,0,0,1)] mx-auto"
                    style={{
                      width: '100%',
                      height: 240,
                      backgroundColor: isDarkMode ? '#0b1220' : '#e6f0eb',
                      borderColor: isDarkMode ? '#374151' : 'black',
                    }}
                  >
                    {/* Player (bigger) */}
                    <div
                      className="absolute"
                      style={{
                        left: '44%',
                        top: '50%',
                        width: 24,
                        height: 24,
                        backgroundColor: '#0ea5e9',
                        border: '2px solid black',
                        boxShadow: '2px 2px 0 rgba(0,0,0,1)',
                      }}
                    />

                    {/* Wild Pokémon (bigger) */}
                    <img
                      src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png"
                      alt="Wild Pokémon"
                      className="absolute"
                      style={{
                        left: '64%',
                        top: '38%',
                        width: 40,
                        height: 40,
                        imageRendering: 'pixelated',
                      }}
                    />

                    {/* Candy indicator (bigger) */}
                    <div
                      className="absolute flex items-center gap-1"
                      style={{top: 8, right: 8}}
                    >
                      <img
                        src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/rare-candy.png"
                        alt="Candy"
                        className="w-6 h-6"
                        style={{imageRendering: 'pixelated'}}
                      />
                      <span
                        className="pixel-font text-[12px] font-bold"
                        style={{color: isDarkMode ? '#e5e7eb' : '#111827'}}
                      >
                        +Candy
                      </span>
                    </div>

                    {/* Home */}
                    <div
                      className="absolute flex items-center gap-1"
                      style={{left: 8, bottom: 8}}
                    >
                      <svg
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="w-4 h-4"
                        style={{color: isDarkMode ? '#e5e7eb' : '#111827'}}
                      >
                        <path
                          d="M14 2h-4v2H8v2H6v2H4v2H2v2h2v10h7v-6h2v6h7V12h2v-2h-2V8h-2V6h-2V4h-2V2zm0 2v2h2v2h2v2h2v2h-2v8h-3v-6H9v6H6v-8H4v-2h2V8h2V6h2V4h4z"
                          fill="currentColor"
                        />
                      </svg>
                      <span
                        className="pixel-font text-[10px] font-bold"
                        style={{color: isDarkMode ? '#e5e7eb' : '#111827'}}
                      >
                        Home
                      </span>
                    </div>

                    {/* Info */}
                    <div
                      className="absolute flex items-center gap-1"
                      style={{right: 8, bottom: 8}}
                    >
                      <svg
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="w-4 h-4"
                        style={{color: isDarkMode ? '#e5e7eb' : '#111827'}}
                      >
                        <path
                          d="M3 3h2v18H3V3zm16 0H5v2h14v14H5v2h16V3h-2zm-8 6h2V7h-2v2zm2 8h-2v-6h2v6z"
                          fill="currentColor"
                        />
                      </svg>
                      <span
                        className="pixel-font text-[10px] font-bold"
                        style={{color: isDarkMode ? '#e5e7eb' : '#111827'}}
                      >
                        Info
                      </span>
                    </div>

                    {/* A button */}
                    <div
                      className="absolute flex items-center justify-center pixel-font text-[10px] font-bold"
                      style={{
                        left: '48%',
                        bottom: 14,
                        width: 20,
                        height: 20,
                        border: '2px solid black',
                        borderRadius: 9999,
                        background: '#8B3A62',
                        color: 'white',
                        boxShadow: '2px 2px 0 rgba(0,0,0,1)',
                      }}
                    >
                      A
                    </div>

                    {/* SVG arrows */}
                    <svg
                      className="absolute inset-0"
                      width="100%"
                      height="100%"
                      viewBox="0 0 420 240"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <defs>
                        <marker
                          id="arrowhead"
                          markerWidth="6"
                          markerHeight="6"
                          refX="5"
                          refY="3"
                          orient="auto"
                          fill={isDarkMode ? '#facc15' : '#111827'}
                        >
                          <path d="M0,0 L6,3 L0,6 Z" />
                        </marker>
                      </defs>
                      {/* Move */}
                      <g
                        stroke={isDarkMode ? '#facc15' : '#111827'}
                        strokeWidth="2"
                        fill="none"
                        markerEnd="url(#arrowhead)"
                      >
                        <line x1="190" y1="125" x2="190" y2="95" />
                        <line x1="190" y1="125" x2="160" y2="125" />
                        <line x1="210" y1="125" x2="240" y2="125" />
                        <line x1="200" y1="135" x2="200" y2="165" />
                      </g>
                      {/* Battle */}
                      <path
                        d="M208,118 C250,110 260,100 276,96"
                        stroke={isDarkMode ? '#facc15' : '#ef4444'}
                        strokeWidth="2.5"
                        fill="none"
                        markerEnd="url(#arrowhead)"
                      />
                      {/* Reward */}
                      <path
                        d="M286,96 C320,70 354,40 392,26"
                        stroke={isDarkMode ? '#facc15' : '#10b981'}
                        strokeWidth="2.5"
                        fill="none"
                        markerEnd="url(#arrowhead)"
                      />
                      {/* A -> Pokémon */}
                      <path
                        d="M210,190 C240,184 260,130 276,110"
                        stroke={isDarkMode ? '#facc15' : '#111827'}
                        strokeWidth="2"
                        fill="none"
                        markerEnd="url(#arrowhead)"
                      />
                    </svg>

                    {/* Tiny labels */}
                    <span
                      className="absolute pixel-font text-[10px] font-bold"
                      style={{
                        left: 12,
                        top: 12,
                        color: isDarkMode ? '#e5e7eb' : '#111827',
                      }}
                    >
                      Move
                    </span>
                    <span
                      className="absolute pixel-font text-[10px] font-bold"
                      style={{
                        left: '58%',
                        top: '28%',
                        color: isDarkMode ? '#e5e7eb' : '#111827',
                      }}
                    >
                      Battle
                    </span>
                    <span
                      className="absolute pixel-font text-[10px] font-bold"
                      style={{
                        right: 12,
                        top: 28,
                        color: isDarkMode ? '#e5e7eb' : '#111827',
                      }}
                    >
                      Candy
                    </span>
                  </div>
                  <div className="mt-3">
                    <p
                      className="pixel-font text-[11px] text-center"
                      style={{color: isDarkMode ? '#e5e7eb' : '#111827'}}
                    >
                      Walk into a wild Pokémon to start a battle, or press A
                      when near.
                    </p>
                    <p
                      className="pixel-font text-[11px] text-center opacity-80"
                      style={{color: isDarkMode ? '#e5e7eb' : '#111827'}}
                    >
                      Win battles to earn Rare Candy and catch new Pokémon.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
