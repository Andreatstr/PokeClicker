/**
 * Interactive Pokemon world map with exploration and battles.
 *
 * Features:
 * - Tiled map rendering with Phaser-like movement
 * - WASD/Arrow key controls + on-screen joystick (mobile)
 * - Wild Pokemon spawning and encounters
 * - Real-time collision detection
 * - Battle system integration
 * - Fullscreen mode support
 * - GameBoy-style wrapper interface
 *
 * Map mechanics:
 * - Player moves tile-by-tile on key/joystick input
 * - Collisions with walls/objects prevent movement
 * - Wild Pokemon spawn randomly on grass tiles
 * - Walking into Pokemon triggers battle
 * - Victory rewards candy + catches Pokemon
 *
 * State management:
 * - useMapMovement: player position, velocity, collision handling
 * - usePokemonSpawning: wild Pokemon placement and encounters
 * - useCollisionMap: collision layer data from tilemap
 * - Player's favorite Pokemon used for battles
 *
 * Fullscreen:
 * - Can enter/exit fullscreen mode
 * - Hides global navbar and candy counter when fullscreen
 * - Responsive viewport sizing (default 720x405, 16:9 aspect)
 *
 * Accessibility:
 * - Keyboard navigation (WASD/arrows)
 * - Touch controls for mobile
 * - Focus indicators on controls
 */
import {useState, useEffect, useRef, useCallback} from 'react';
import {logger} from '@/lib/logger';
import {useAuth} from '@features/auth/hooks/useAuth';
import {GameBoy} from './GameBoy';
import {CandyCounterOverlay} from '@/components';
import {TiledMapView} from './TiledMapView';
import {BattleView} from '@features/battle';
import {useCollisionMap} from '../hooks/useCollisionMap';
import {useMapMovement} from '../hooks/useMapMovement';
import {usePokemonSpawning} from '../hooks/usePokemonSpawning';
import {usePokemonById} from '@features/pokedex/hooks/usePokemonById';
import {useCatchPokemon} from '@features/pokedex/hooks/useCatchPokemon';
import type {PokedexPokemon} from '@features/pokedex';
import {useMobileDetection} from '@/hooks';

// Cross-browser fullscreen helpers with typed vendor prefixes
type VendorDocument = Document & {
  webkitFullscreenElement?: Element | null;
  mozFullScreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
  mozCancelFullScreen?: () => Promise<void> | void;
};

type VendorElement = Element & {
  webkitRequestFullscreen?: () => Promise<void> | void;
  mozRequestFullScreen?: () => Promise<void> | void;
};

function isFullscreenActive(doc: Document): boolean {
  const d = doc as VendorDocument;
  return !!(
    doc.fullscreenElement ||
    d.webkitFullscreenElement ||
    d.mozFullScreenElement
  );
}

async function requestFullscreen(el: Element): Promise<void> {
  const e = el as VendorElement;
  if (el.requestFullscreen) {
    await el.requestFullscreen();
  } else if (e.webkitRequestFullscreen) {
    await Promise.resolve(e.webkitRequestFullscreen());
  } else if (e.mozRequestFullScreen) {
    await Promise.resolve(e.mozRequestFullScreen());
  }
}

async function exitFullscreen(doc: Document): Promise<void> {
  const d = doc as VendorDocument;
  if (doc.exitFullscreen) {
    await doc.exitFullscreen();
  } else if (d.webkitExitFullscreen) {
    await Promise.resolve(d.webkitExitFullscreen());
  } else if (d.mozCancelFullScreen) {
    await Promise.resolve(d.mozCancelFullScreen());
  }
}

// Default viewport dimensions (overridden responsively below). Use 16:9 to be wider/less tall.
const DEFAULT_VIEWPORT = {width: 720, height: 405};

interface PokemonMapProps {
  isDarkMode?: boolean;
  onFullscreenChange?: (isFullscreen: boolean) => void;
}

export function PokemonMap({
  isDarkMode = false,
  onFullscreenChange,
}: PokemonMapProps) {
  const {user, isAuthenticated} = useAuth();

  // Fetch user's favorite Pokemon for battles
  const {pokemon: favoritePokemon, refreshStats} = usePokemonById(
    user?.favorite_pokemon_id || null
  );

  // Mutations for awarding battle rewards
  const [catchPokemon] = useCatchPokemon();

  // Battle state
  const [inBattle, setInBattle] = useState(false);
  const [battleOpponent, setBattleOpponent] = useState<PokedexPokemon | null>(
    null
  );
  const [playerPokemon, setPlayerPokemon] = useState<PokedexPokemon | null>(
    null
  );
  const [battleSpawnId, setBattleSpawnId] = useState<string | null>(null);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // How to Play modal state
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  // Responsive viewport for fitting GameBoy on mobile and web
  const [viewport, setViewport] = useState<{width: number; height: number}>(
    DEFAULT_VIEWPORT
  );

  // Track the actual rendered pixel size of the viewport container
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [renderSize, setRenderSize] = useState<{width: number; height: number}>(
    DEFAULT_VIEWPORT
  );

  // Custom hooks for game logic
  const collisionMap = useCollisionMap();
  const movement = useMapMovement(collisionMap, renderSize, inBattle);
  const pokemon = usePokemonSpawning(collisionMap, movement.worldPosition);

  // Responsive viewport calculation
  useEffect(() => {
    const computeViewport = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      // Check if mobile
      const isMobileWidth = w < 768;

      // Prefer much taller aspect on small screens for more vertical space
      const pick = (
        baseWidth: number,
        ratio: '1:1' | '4:5' | '3:4' | '4:3' | '16:10' | '16:9'
      ) => {
        let width = baseWidth;

        // For desktop, apply responsive scaling
        if (!isMobileWidth) {
          // Account for GameBoy shell overhead (~200px for controls, labels, etc.)
          const gameViewHeight =
            ratio === '1:1'
              ? baseWidth
              : ratio === '4:5'
                ? Math.round((baseWidth * 5) / 4)
                : ratio === '3:4'
                  ? Math.round((baseWidth * 4) / 3)
                  : ratio === '4:3'
                    ? Math.round((baseWidth * 3) / 4)
                    : ratio === '16:10'
                      ? Math.round((baseWidth * 10) / 16)
                      : Math.round((baseWidth * 9) / 16);

          // Use percentage-based overhead for proportional scaling
          const availableHeight = h * 0.85; // Use 85% of browser height

          // Calculate scale based on what percentage of available height the game view should take
          const gameViewTargetHeight = availableHeight * 0.5; // Game view takes 50% of available height
          const heightConstraintScale = gameViewTargetHeight / gameViewHeight;

          // Apply width constraints
          const widthFactor = Math.min(w / 800, 2);

          // Use the more restrictive of height or width constraint
          const scaleFactor = Math.min(heightConstraintScale, widthFactor);

          width = Math.round(baseWidth * scaleFactor);
        }

        const height =
          ratio === '1:1'
            ? width
            : ratio === '4:5'
              ? Math.round((width * 5) / 4)
              : ratio === '3:4'
                ? Math.round((width * 4) / 3)
                : ratio === '4:3'
                  ? Math.round((width * 3) / 4)
                  : ratio === '16:10'
                    ? Math.round((width * 10) / 16)
                    : Math.round((width * 9) / 16);
        return {width, height};
      };

      if (w < 380) return pick(280, '1:1');
      if (w < 480) return pick(320, '4:5');
      if (w < 640) return pick(420, '3:4');
      if (w < 768) return pick(520, '4:3');
      if (w < 1024) return pick(640, '16:10');
      if (w < 1280) return pick(840, '16:10');
      if (w < 1440) return pick(1080, '16:9');
      if (w < 1920) return pick(1280, '16:9');
      if (w < 2560) return pick(1200, '16:9');
      return pick(Math.min(w * 0.6, 1400), '16:9');
    };
    const apply = () => setViewport(computeViewport());
    apply();
    window.addEventListener('resize', apply);
    return () => window.removeEventListener('resize', apply);
  }, []);

  // Observe viewport container size to keep character perfectly centered
  useEffect(() => {
    const updateSize = () => {
      const el = viewportRef.current;
      if (!el) return;
      const width = el.clientWidth;
      const height = el.clientHeight;
      if (width > 0 && height > 0) setRenderSize({width, height});
    };
    updateSize();
    let ro: ResizeObserver | null = null;
    const currentViewport = viewportRef.current;
    if (typeof ResizeObserver !== 'undefined' && currentViewport) {
      ro = new ResizeObserver(() => updateSize());
      ro.observe(currentViewport);
    } else {
      window.addEventListener('resize', updateSize);
    }
    return () => {
      if (ro && currentViewport) ro.unobserve(currentViewport);
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  const [battleAttackFunction, setBattleAttackFunction] = useState<
    (() => void) | null
  >(null);
  const battleAttackFunctionRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    battleAttackFunctionRef.current = battleAttackFunction;
  }, [battleAttackFunction]);

  const setBattleAttackFunctionWrapper = useCallback(
    (fn: (() => void) | null) => {
      // Wrap in arrow function because setState interprets functions as updaters
      setBattleAttackFunction(() => fn);
    },
    []
  );

  // Start battle handler
  const startBattle = useCallback(
    async (opponent: PokedexPokemon, spawnId: string) => {
      // Store the spawn ID for removal after victory
      setBattleSpawnId(spawnId);

      // Use the user's favorite Pokemon
      if (favoritePokemon?.id) {
        const playerPokemon: PokedexPokemon = {
          id: favoritePokemon.id,
          name: favoritePokemon.name,
          types: favoritePokemon.types,
          sprite: favoritePokemon.sprite,
          pokedexNumber: favoritePokemon.id,
          stats: favoritePokemon.stats,
          isOwned: true,
        };

        await refreshStats();
        setPlayerPokemon(playerPokemon);
        setBattleOpponent(opponent);
        setInBattle(true);
      } else {
        // Fallback to Bulbasaur if favorite Pokemon not set
        const defaultPlayerPokemon: PokedexPokemon = {
          id: 1,
          name: 'Bulbasaur',
          types: ['grass', 'poison'],
          sprite:
            'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
          pokedexNumber: 1,
          stats: {
            hp: 45,
            attack: 49,
            defense: 49,
            spAttack: 65,
            spDefense: 65,
            speed: 45,
          },
          isOwned: true,
        };

        setPlayerPokemon(defaultPlayerPokemon);
        setBattleOpponent(opponent);
        setInBattle(true);
      }
    },
    [favoritePokemon, refreshStats]
  );

  // Battle complete handler
  const handleBattleComplete = useCallback(
    async (result: 'victory' | 'defeat') => {
      if (result === 'victory' && battleOpponent && battleSpawnId) {
        try {
          // Add Pokemon to collection if not already owned
          if (!battleOpponent.isOwned) {
            await catchPokemon({
              variables: {pokemonId: battleOpponent.id},
            });
          }

          // Remove the caught Pokemon from the map and spawn a new one
          pokemon.removePokemon(battleSpawnId);
        } catch (error) {
          logger.logError(error, 'AwardBattleRewards');
        }
      }

      setInBattle(false);
      setBattleOpponent(null);
      setPlayerPokemon(null);
      setBattleSpawnId(null);
      setBattleAttackFunction(null);
    },
    [battleOpponent, battleSpawnId, catchPokemon, pokemon]
  );

  const handleAButtonClick = useCallback(() => {
    if (inBattle && battleAttackFunction) {
      battleAttackFunction();
    } else if (pokemon.nearbyPokemon) {
      startBattle(pokemon.nearbyPokemon.pokemon, pokemon.nearbyPokemon.spawnId);
    }
    // No action when neither in battle nor near Pokemon - prevents unwanted map movement
  }, [inBattle, battleAttackFunction, pokemon.nearbyPokemon, startBattle]);

  // Detect mobile device (unified hook)
  const isMobile = useMobileDetection(768);

  // Handle fullscreen changes (for desktop browsers that support it)
  useEffect(() => {
    if (isMobile) return; // Skip for mobile, we'll use CSS fullscreen

    const handleFullscreenChange = () => {
      setIsFullscreen(isFullscreenActive(document));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener(
        'webkitfullscreenchange',
        handleFullscreenChange
      );
      document.removeEventListener(
        'mozfullscreenchange',
        handleFullscreenChange
      );
    };
  }, [isMobile]);

  // Notify parent when fullscreen state changes
  useEffect(() => {
    onFullscreenChange?.(isFullscreen);
  }, [isFullscreen, onFullscreenChange]);

  // Toggle fullscreen mode
  const toggleFullscreen = useCallback(async () => {
    // On mobile, use CSS-based fullscreen instead of Fullscreen API
    if (isMobile) {
      setIsFullscreen((prev) => !prev);
      return;
    }

    // Desktop: Try to use native Fullscreen API
    try {
      const element = containerRef.current;
      if (!element) return;

      const isCurrentlyFullscreen = isFullscreenActive(document);

      if (!isCurrentlyFullscreen) {
        // Request fullscreen with vendor prefixes
        await requestFullscreen(element);
      } else {
        // Exit fullscreen with vendor prefixes
        await exitFullscreen(document);
      }
    } catch (error) {
      logger.logError(error, 'ToggleFullscreen');
      // Fallback to CSS fullscreen if native API fails
      setIsFullscreen((prev) => !prev);
    }
  }, [isMobile]);

  useEffect(() => {
    const pressedKeys = new Set<string>();

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      // Start battle with B button
      if (!inBattle && key === 'b') {
        e.preventDefault();
        e.stopPropagation();
        if (pokemon.nearbyPokemon && !pressedKeys.has(key)) {
          pressedKeys.add(key);
          startBattle(
            pokemon.nearbyPokemon.pokemon,
            pokemon.nearbyPokemon.spawnId
          );
        }
      }

      // Attack with A and B buttons
      if (inBattle && (key === 'a' || key === 'b')) {
        e.preventDefault();
        e.stopPropagation();
        if (!pressedKeys.has(key)) {
          pressedKeys.add(key);
          handleAButtonClick();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'a' || key === 'b') {
        pressedKeys.delete(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown, {
      capture: true,
      passive: false,
    });
    window.addEventListener('keyup', handleKeyUp, {capture: true});
    return () => {
      window.removeEventListener('keydown', handleKeyDown, {capture: true});
      window.removeEventListener('keyup', handleKeyUp, {capture: true});
    };
  }, [inBattle, pokemon.nearbyPokemon, handleAButtonClick, startBattle]);

  return (
    <div
      ref={containerRef}
      style={
        isFullscreen && isMobile
          ? {
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: '100vh',
              zIndex: 9999,
              overflow: 'hidden',
              paddingTop: 'env(safe-area-inset-top)',
              paddingBottom: 'env(safe-area-inset-bottom)',
              paddingLeft: 'env(safe-area-inset-left)',
              paddingRight: 'env(safe-area-inset-right)',
            }
          : undefined
      }
    >
      <GameBoy
        onDirectionChange={movement.handleJoystickDirectionChange}
        onDirectionStart={movement.handleJoystickDirectionStart}
        onDirectionStop={movement.handleJoystickDirectionStop}
        onAButtonClick={handleAButtonClick}
        onBButtonClick={handleAButtonClick}
        isAuthenticated={isAuthenticated}
        nearbyPokemon={pokemon.nearbyPokemon}
        viewport={viewport}
        onToggleFullscreen={toggleFullscreen}
        isFullscreen={isFullscreen}
        isMapLoading={!collisionMap.collisionMapLoaded}
        isDarkMode={isDarkMode}
      >
        {/* Map/Battle Viewport Container - this is the game view */}
        <div
          ref={viewportRef}
          className={`relative shadow-inner bg-black overflow-hidden ${
            isFullscreen ? 'w-full h-full' : 'w-full h-full box-content'
          }`}
        >
          {/* Candy counter in fullscreen, anchored to the GameBoy viewport (top-right) */}
          {isFullscreen && (
            <CandyCounterOverlay position="top-right" strategy="absolute" />
          )}
          {/* Fullscreen/Exit Button - top left of viewport */}
          <button
            onClick={toggleFullscreen}
            onTouchEnd={(e) => {
              e.preventDefault();
              toggleFullscreen();
            }}
            className="absolute top-2 left-2 z-50 flex items-center gap-1 active:bg-blue-700 border-2 border-black px-2 py-1 touch-manipulation"
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            style={{
              WebkitTapHighlightColor: 'transparent',
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
            <svg
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="w-4 h-4 text-white"
            >
              <path
                d="M21 3h-8v2h4v2h2v4h2V3zm-4 4h-2v2h-2v2h2V9h2V7zm-8 8h2v-2H9v2H7v2h2v-2zm-4-2v4h2v2H5h6v2H3v-8h2z"
                fill="currentColor"
              />
            </svg>
            <span className="pixel-font text-xs font-bold text-white">
              {isFullscreen ? 'EXIT' : 'FULL'}
            </span>
          </button>

          {/* Info / How to Play Button - Bottom Right */}
          {!inBattle && (
            <button
              onClick={() => setShowHowToPlay(true)}
              onTouchEnd={(e) => {
                e.preventDefault();
                setShowHowToPlay(true);
              }}
              className="absolute bottom-3 right-3 z-50 flex items-center justify-center border-2 border-black w-10 h-10 touch-manipulation text-xs font-bold"
              title="How to play"
              style={{
                WebkitTapHighlightColor: 'transparent',
                backgroundColor: 'rgba(59, 130, 246, 0.9)',
                boxShadow: '4px 4px 0px rgba(0,0,0,1)',
                transform: 'translate(0, 0)',
                transition: 'all 0.15s ease-in-out',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translate(-2px, -2px)';
                e.currentTarget.style.boxShadow = '6px 6px 0px rgba(0,0,0,1)';
                e.currentTarget.style.backgroundColor =
                  'rgba(37, 99, 235, 0.95)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translate(0, 0)';
                e.currentTarget.style.boxShadow = '4px 4px 0px rgba(0,0,0,1)';
                e.currentTarget.style.backgroundColor =
                  'rgba(59, 130, 246, 0.9)';
              }}
            >
              <svg
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="w-5 h-5 text-white"
              >
                <path
                  d="M3 3h2v18H3V3zm16 0H5v2h14v14H5v2h16V3h-2zm-8 6h2V7h-2v2zm2 8h-2v-6h2v6z"
                  fill="currentColor"
                />
              </svg>
            </button>
          )}

          {inBattle && battleOpponent && playerPokemon ? (
            <BattleView
              playerPokemon={playerPokemon}
              opponentPokemon={battleOpponent}
              onBattleComplete={handleBattleComplete}
              isDarkMode={isDarkMode}
              onAttackFunctionReady={setBattleAttackFunctionWrapper}
              isFullscreen={isFullscreen}
            />
          ) : (
            <TiledMapView
              camera={movement.camera}
              screenPos={movement.screenPos}
              spritePos={movement.spritePos}
              wildPokemon={pokemon.getVisiblePokemon(
                movement.camera,
                renderSize
              )}
              nearbyPokemon={pokemon.nearbyPokemon}
              worldPosition={movement.worldPosition}
              collisionMapLoaded={collisionMap.collisionMapLoaded}
              isPositionSemiWalkable={collisionMap.isPositionSemiWalkable}
              teleportLocation={movement.teleportLocation}
              isTeleporting={movement.isTeleporting}
              teleportCooldown={movement.teleportCooldown}
              viewportSize={renderSize}
              isDarkMode={isDarkMode}
              onStartBattle={startBattle}
              showWorldInfo={showHowToPlay}
              onCloseWorldInfo={() => setShowHowToPlay(false)}
              onTeleport={movement.teleportToRandomLocation}
            />
          )}
        </div>
      </GameBoy>
    </div>
  );
}
