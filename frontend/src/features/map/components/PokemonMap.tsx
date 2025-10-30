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
      // Prefer much taller aspect on small screens for more vertical space
      const pick = (
        width: number,
        ratio: '1:1' | '4:5' | '3:4' | '4:3' | '16:10' | '16:9'
      ) => {
        const h =
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
        return {width, height: h};
      };
      if (w < 380) return pick(280, '1:1');
      if (w < 480) return pick(320, '4:5');
      if (w < 640) return pick(420, '3:4');
      if (w < 768) return pick(520, '4:3');
      if (w < 1024) return pick(640, '16:10');
      if (w < 1280) return pick(840, '16:10');
      return pick(890, '16:9');
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

  // A/B Button handlers
  const handleAButtonClick = useCallback(() => {
    if (pokemon.nearbyPokemon) {
      startBattle(pokemon.nearbyPokemon.pokemon, pokemon.nearbyPokemon.spawnId);
    }
  }, [pokemon.nearbyPokemon, startBattle]);

  const handleBButtonClick = useCallback(() => {
    if (inBattle && battleAttackFunction) {
      // In battle mode, trigger attack
      battleAttackFunction();
    } else {
      // Normal mode, cancel action or show menu
    }
  }, [inBattle, battleAttackFunction]);

  return (
    <GameBoy
      onDirectionChange={movement.handleJoystickDirectionChange}
      onDirectionStart={movement.handleJoystickDirectionStart}
      onDirectionStop={movement.handleJoystickDirectionStop}
      onAButtonClick={handleAButtonClick}
      onBButtonClick={handleBButtonClick}
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
            onAttackFunctionReady={setBattleAttackFunction}
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
