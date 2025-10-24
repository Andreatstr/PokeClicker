import {useState, useEffect, useRef, useCallback} from 'react';
import {useAuth} from '@features/auth/hooks/useAuth';
import {GameBoy} from './GameBoy';
import {TiledMapView} from './TiledMapView';
import {useCollisionMap} from '../hooks/useCollisionMap';
import {useMapMovement} from '../hooks/useMapMovement';
import {usePokemonSpawning} from '../hooks/usePokemonSpawning';

// Default viewport dimensions (overridden responsively below). Use 16:9 to be wider/less tall.
const DEFAULT_VIEWPORT = {width: 720, height: 405};

export function PokemonMap() {
  const {user, isAuthenticated} = useAuth();

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
      if (w < 1280) return pick(840, '4:3');
      return pick(1000, '4:3');
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
    if (typeof ResizeObserver !== 'undefined' && viewportRef.current) {
      ro = new ResizeObserver(() => updateSize());
      ro.observe(viewportRef.current);
    } else {
      window.addEventListener('resize', updateSize);
    }
    return () => {
      if (ro && viewportRef.current) ro.unobserve(viewportRef.current);
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  // A/B Button handlers
  const handleAButtonClick = useCallback(() => {
    if (pokemon.nearbyPokemon) {
      // Start battle with nearby Pokemon
      console.log('Starting battle with', pokemon.nearbyPokemon.pokemon.name);
      alert(`Battle! You encountered a wild ${pokemon.nearbyPokemon.pokemon.name}! (Battle feature coming soon)`);
    } else {
      // Interact with environment or show menu
      console.log('A button pressed - no nearby Pokemon');
      alert('A button pressed - no nearby Pokemon to battle');
    }
  }, [pokemon.nearbyPokemon]);

  const handleBButtonClick = useCallback(() => {
    // Cancel action or show menu
    console.log('B button pressed');
  }, []);

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
      {/* Map Viewport Container - this is the game view */}
      <div
        ref={viewportRef}
        className="relative box-content border-4 border-black shadow-inner bg-black w-full h-full overflow-hidden"
      >
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
        />
      </div>
    </GameBoy>
  );
}