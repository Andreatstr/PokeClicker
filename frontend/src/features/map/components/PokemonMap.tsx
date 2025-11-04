import {useState, useEffect, useRef, useCallback} from 'react';
import {logger} from '@/lib/logger';
import {useAuth} from '@features/auth/hooks/useAuth';
import {GameBoy} from './GameBoy';
import {TiledMapView} from './TiledMapView';
import {BattleView} from '@features/battle';
import {useCollisionMap} from '../hooks/useCollisionMap';
import {useMapMovement} from '../hooks/useMapMovement';
import {usePokemonSpawning} from '../hooks/usePokemonSpawning';
import {usePokemonById} from '@features/pokedex/hooks/usePokemonById';
import {useCatchPokemon} from '@features/pokedex/hooks/useCatchPokemon';
import {useGameMutations} from '@features/clicker/hooks/useGameMutations';
import {calculateCandyPerClick} from '@/lib/calculateCandyPerClick';
import type {PokedexPokemon} from '@features/pokedex';

// Default viewport dimensions (overridden responsively below). Use 16:9 to be wider/less tall.
const DEFAULT_VIEWPORT = {width: 720, height: 405};

interface PokemonMapProps {
  isDarkMode?: boolean;
}

export function PokemonMap({isDarkMode = false}: PokemonMapProps) {
  const {user, isAuthenticated, updateUser} = useAuth();

  // Fetch user's favorite Pokemon for battles
  const {pokemon: favoritePokemon, refreshStats} = usePokemonById(
    user?.favorite_pokemon_id || null
  );

  // Mutations for awarding battle rewards
  const [catchPokemon] = useCatchPokemon();
  const {updateRareCandy} = useGameMutations();

  // Battle state
  const [inBattle, setInBattle] = useState(false);
  const [battleOpponent, setBattleOpponent] = useState<PokedexPokemon | null>(
    null
  );
  const [playerPokemon, setPlayerPokemon] = useState<PokedexPokemon | null>(
    null
  );
  const [battleSpawnId, setBattleSpawnId] = useState<string | null>(null);

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
  const movement = useMapMovement(collisionMap, renderSize);
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
    async (result: 'victory' | 'defeat', clickCount: number) => {
      if (result === 'victory' && battleOpponent && battleSpawnId) {
        try {
          // Calculate rare candy reward based on clicker power
          // Reward = clickCount × candyPerClick × 10
          const candyPerClick = user?.stats
            ? calculateCandyPerClick(user.stats)
            : 1;
          const rareCandyReward = Math.floor(clickCount * candyPerClick * 10);

          // Award rare candy
          await updateRareCandy(rareCandyReward, updateUser);

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
    [
      battleOpponent,
      battleSpawnId,
      updateRareCandy,
      updateUser,
      catchPokemon,
      pokemon,
      user?.stats,
    ]
  );

  const handleAButtonClick = useCallback(() => {
    if (inBattle && battleAttackFunction) {
      battleAttackFunction();
    } else if (pokemon.nearbyPokemon) {
      startBattle(pokemon.nearbyPokemon.pokemon, pokemon.nearbyPokemon.spawnId);
    } else {
      movement.handleJoystickDirectionChange('left');
    }
  }, [
    inBattle,
    battleAttackFunction,
    pokemon.nearbyPokemon,
    startBattle,
    movement,
  ]);

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
    <GameBoy
      onDirectionChange={movement.handleJoystickDirectionChange}
      onDirectionStart={movement.handleJoystickDirectionStart}
      onDirectionStop={movement.handleJoystickDirectionStop}
      onAButtonClick={handleAButtonClick}
      onBButtonClick={handleAButtonClick}
      isAuthenticated={isAuthenticated}
      nearbyPokemon={pokemon.nearbyPokemon}
      viewport={viewport}
    >
      {/* Map/Battle Viewport Container - this is the game view */}
      <div
        ref={viewportRef}
        className="relative box-content border-4 border-black shadow-inner bg-black w-full h-full overflow-hidden"
      >
        {inBattle && battleOpponent && playerPokemon ? (
          <BattleView
            playerPokemon={playerPokemon}
            opponentPokemon={battleOpponent}
            onBattleComplete={handleBattleComplete}
            isDarkMode={isDarkMode}
            onAttackFunctionReady={setBattleAttackFunctionWrapper}
          />
        ) : (
          <TiledMapView
            camera={movement.camera}
            screenPos={movement.screenPos}
            spritePos={movement.spritePos}
            wildPokemon={pokemon.getVisiblePokemon(movement.camera, renderSize)}
            nearbyPokemon={pokemon.nearbyPokemon}
            worldPosition={movement.worldPosition}
            user={user}
            collisionMapLoaded={collisionMap.collisionMapLoaded}
            viewportSize={renderSize}
            isDarkMode={isDarkMode}
            onStartBattle={startBattle}
            onResetToHome={movement.resetToHome}
          />
        )}
      </div>
    </GameBoy>
  );
}
