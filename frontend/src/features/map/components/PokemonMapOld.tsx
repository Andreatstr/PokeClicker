import {useState, useEffect, useRef} from 'react';
import {useAuth} from '@features/auth/hooks/useAuth';
import {GameBoy} from './GameBoy';
import {MapView} from './MapView';
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
  // Character position in world coordinates
  const [worldPosition, setWorldPosition] = useState({
    x: MAP_WIDTH / 2,
    y: MAP_HEIGHT / 2,
  });
  const [direction, setDirection] = useState<Direction>('down');
  const [isMoving, setIsMoving] = useState(false);
  const [animationFrame, setAnimationFrame] = useState(0);

  const keysPressed = useRef<Set<string>>(new Set());
  const animationIntervalRef = useRef<number | null>(null);
  const movementIntervalRef = useRef<number | null>(null);
  const collisionCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const collisionCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [collisionMapLoaded, setCollisionMapLoaded] = useState(false);
  const [wildPokemon, setWildPokemon] = useState<
    Array<{pokemon: PokedexPokemon; x: number; y: number}>
  >([]);
  const [nearbyPokemon, setNearbyPokemon] = useState<
    {pokemon: PokedexPokemon; x: number; y: number} | null
  >(null);
  // Track the actual rendered pixel size of the viewport container
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [renderSize, setRenderSize] = useState<{width: number; height: number}>(
    DEFAULT_VIEWPORT
  );

  // Fetch random Pokemon from API
  const {data: pokemonData} = usePokedexQuery({
    limit: 10,
    offset: 0,
  });

  // Load collision map
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = MAP_WIDTH;
    canvas.height = MAP_HEIGHT;
    const ctx = canvas.getContext('2d', {willReadFrequently: true});

    if (!ctx) return;

    const img = new Image();
    img.src = `${import.meta.env.BASE_URL}map-collision.webp`;
    img.onload = () => {
      ctx.drawImage(img, 0, 0, MAP_WIDTH, MAP_HEIGHT);
      collisionCanvasRef.current = canvas;
      collisionCtxRef.current = ctx;
      setCollisionMapLoaded(true);
      console.log('Collision map loaded successfully');
    };
    img.onerror = () => {
      console.error('Failed to load collision map');
    };
  }, []);

  // Check if a position is walkable (white pixel on collision map)
  const isPositionWalkable = useCallback((x: number, y: number): boolean => {
    if (!collisionCtxRef.current || !collisionMapLoaded) {
      return true; // Allow movement if collision map not loaded yet
    }

    // Clamp coordinates to map bounds
    const checkX = Math.floor(Math.max(0, Math.min(x, MAP_WIDTH - 1)));
    const checkY = Math.floor(Math.max(0, Math.min(y, MAP_HEIGHT - 1)));

    try {
      const pixelData = collisionCtxRef.current.getImageData(
        checkX,
        checkY,
        1,
        1
      ).data;

      // Check if pixel is white (walkable)
      // White pixels have high RGB values (close to 255)
      const r = pixelData[0];
      const g = pixelData[1];
      const b = pixelData[2];

      // Consider it walkable if it's mostly white (brightness > 200)
      const brightness = (r + g + b) / 3;
      return brightness > 200;
    } catch (error) {
      console.error('Error checking collision:', error);
      return true; // Allow movement on error
    }
  }, [collisionMapLoaded]);

  // Generate random walkable position on the map
  const getRandomWalkablePosition = useCallback((): {
    x: number;
    y: number;
  } => {
    let attempts = 0;
    const maxAttempts = 100;

    while (attempts < maxAttempts) {
      const x = Math.floor(Math.random() * MAP_WIDTH);
      const y = Math.floor(Math.random() * MAP_HEIGHT);

      if (isPositionWalkable(x, y)) {
        return {x, y};
      }
      attempts++;
    }

    // Fallback to center of map if can't find walkable position
    return {x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2};
  }, [isPositionWalkable]);

  // Place Pokemon at random walkable locations when data loads
  useEffect(() => {
    if (pokemonData?.pokedex.pokemon && collisionMapLoaded && wildPokemon.length === 0) {
      const placedPokemon = pokemonData.pokedex.pokemon.map((pokemon) => {
        const position = getRandomWalkablePosition();
        return {
          pokemon,
          x: position.x,
          y: position.y,
        };
      });
      setWildPokemon(placedPokemon);
      console.log('Placed', placedPokemon.length, 'wild Pokemon on the map');
    }
  }, [pokemonData, collisionMapLoaded, getRandomWalkablePosition, wildPokemon.length]);

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

  // Check proximity to nearest wild Pokémon
  useEffect(() => {
    if (wildPokemon.length === 0) {
      setNearbyPokemon(null);
      return;
    }

    const PROXIMITY_RADIUS = 80; // pixels in world space
    let closest: {pokemon: PokedexPokemon; x: number; y: number} | null = null;
    let closestDist = Infinity;

    for (const wp of wildPokemon) {
      const dx = wp.x - worldPosition.x;
      const dy = wp.y - worldPosition.y;
      const dist = Math.hypot(dx, dy);
      if (dist < closestDist) {
        closestDist = dist;
        closest = wp;
      }
    }

    if (closest && closestDist <= PROXIMITY_RADIUS) {
      setNearbyPokemon(closest);
    } else {
      setNearbyPokemon(null);
    }
  }, [worldPosition, wildPokemon]);

  // Handle sprite animation when moving
  useEffect(() => {
    if (isMoving) {
      // Cycle through frames 0, 1, 2, 3 for walking animation
      animationIntervalRef.current = window.setInterval(() => {
        setAnimationFrame((prev) => (prev + 1) % ANIMATION_FRAMES);
      }, ANIMATION_SPEED);
    } else {
      // Stop animation and reset to idle frame
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
        animationIntervalRef.current = null;
      }
      setAnimationFrame(0);
    }

    return () => {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
      }
    };
  }, [isMoving]);

  // Calculate new position based on direction with collision detection
  const calculateNewPosition = useCallback(
    (currentPos: {x: number; y: number}, dir: Direction) => {
      let newPos = {...currentPos};

      switch (dir) {
        case 'up':
          newPos.y = Math.max(currentPos.y - TILE_SIZE, SPRITE_HEIGHT / 2);
          break;
        case 'down':
          newPos.y = Math.min(
            currentPos.y + TILE_SIZE,
            MAP_HEIGHT - SPRITE_HEIGHT / 2
          );
          break;
        case 'left':
          newPos.x = Math.max(currentPos.x - TILE_SIZE, SPRITE_WIDTH / 2);
          break;
        case 'right':
          newPos.x = Math.min(
            currentPos.x + TILE_SIZE,
            MAP_WIDTH - SPRITE_WIDTH / 2
          );
          break;
      }

      // Check if the new position is walkable (check character center)
      if (!isPositionWalkable(newPos.x, newPos.y)) {
        return currentPos; // Block movement if collision detected
      }

      return newPos;
    },
    [isPositionWalkable]
  );

  // Handle continuous movement
  useEffect(() => {
    if (keysPressed.current.size > 0) {
      setIsMoving(true);

      movementIntervalRef.current = window.setInterval(() => {
        // Get the most recent key pressed
        const keys = Array.from(keysPressed.current);
        const lastKey = keys[keys.length - 1];

        let dir: Direction | null = null;
        if (lastKey === 'ArrowUp') dir = 'up';
        else if (lastKey === 'ArrowDown') dir = 'down';
        else if (lastKey === 'ArrowLeft') dir = 'left';
        else if (lastKey === 'ArrowRight') dir = 'right';

        if (dir) {
          setDirection(dir);
          setWorldPosition((prev) => calculateNewPosition(prev, dir));
        }
      }, MOVE_SPEED);
    } else {
      setIsMoving(false);
      if (movementIntervalRef.current) {
        clearInterval(movementIntervalRef.current);
        movementIntervalRef.current = null;
      }
    }

    return () => {
      if (movementIntervalRef.current) {
        clearInterval(movementIntervalRef.current);
      }
    };
  }, [keysPressed.current.size, calculateNewPosition]);

  // Handle key down
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      keysPressed.current.add(e.key);
      // Trigger re-render
      setIsMoving(true);
    }
  }, []);

  // Handle key up
  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      keysPressed.current.delete(e.key);

      // If no keys are pressed, stop moving
      if (keysPressed.current.size === 0) {
        setIsMoving(false);
      }
    }
  }, []);

  // Add keyboard event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // Joystick direction handling
  const handleJoystickDirectionStart = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    const keyMap = {
      up: 'ArrowUp',
      down: 'ArrowDown',
      left: 'ArrowLeft',
      right: 'ArrowRight',
    };

    const key = keyMap[direction];
    keysPressed.current.add(key);
    setIsMoving(true);
  }, []);

  const handleJoystickDirectionChange = useCallback((direction: 'up' | 'down' | 'left' | 'right' | null) => {
    // Clear all current keys
    keysPressed.current.clear();

    if (direction) {
      const keyMap = {
        up: 'ArrowUp',
        down: 'ArrowDown',
        left: 'ArrowLeft',
        right: 'ArrowRight',
      };

      const key = keyMap[direction];
      keysPressed.current.add(key);
      setIsMoving(true);
    } else {
      setIsMoving(false);
    }
  }, []);

  const handleJoystickDirectionStop = useCallback(() => {
    keysPressed.current.clear();
    setIsMoving(false);
  }, []);

  // A/B Button handlers
  const handleAButtonClick = useCallback(() => {
    if (nearbyPokemon) {
      // Start battle with nearby Pokemon
      console.log('Starting battle with', nearbyPokemon.pokemon.name);
      alert(`Battle! You encountered a wild ${nearbyPokemon.pokemon.name}! (Battle feature coming soon)`);
    } else {
      // Interact with environment or show menu
      console.log('A button pressed - no nearby Pokemon');
      alert('A button pressed - no nearby Pokemon to battle');
    }
  }, [nearbyPokemon]);

  const handleBButtonClick = useCallback(() => {
    // Cancel action or show menu
    console.log('B button pressed');
  }, []);

  // Calculate camera offset to center character in viewport
  const getCameraOffset = () => {
    // Try to center character in viewport
    let cameraX = worldPosition.x - renderSize.width / 2;
    let cameraY = worldPosition.y - renderSize.height / 2;

    // Clamp camera to map boundaries
    cameraX = Math.max(0, Math.min(cameraX, MAP_WIDTH - renderSize.width));
    cameraY = Math.max(0, Math.min(cameraY, MAP_HEIGHT - renderSize.height));

    return {x: cameraX, y: cameraY};
  };

  // Calculate character's screen position relative to camera
  const getCharacterScreenPosition = () => {
    const camera = getCameraOffset();
    return {
      x: worldPosition.x - camera.x - SPRITE_WIDTH / 2,
      y: worldPosition.y - camera.y - SPRITE_HEIGHT / 2,
    };
  };

  // Calculate sprite background position
  const getSpritePosition = () => {
    const row = SPRITE_POSITIONS[direction];
    const col = animationFrame;
    return {
      backgroundPositionX: `-${col * SPRITE_WIDTH}px`,
      backgroundPositionY: `-${row * SPRITE_HEIGHT}px`,
    };
  };

  const camera = getCameraOffset();
  const screenPos = getCharacterScreenPosition();
  const spritePos = getSpritePosition();

  // (Mobile controls removed in GameBoy shell variant)

  return (
    <GameBoy
      onDirectionChange={handleJoystickDirectionChange}
      onDirectionStart={handleJoystickDirectionStart}
      onDirectionStop={handleJoystickDirectionStop}
      onAButtonClick={handleAButtonClick}
      onBButtonClick={handleBButtonClick}
      isAuthenticated={isAuthenticated}
      nearbyPokemon={nearbyPokemon}
      viewport={viewport}
    >
      {/* Map Viewport Container - this is the game view */}
      <div
        ref={viewportRef}
        className="relative box-content border-4 border-black shadow-inner bg-black w-full h-full overflow-hidden"
      >
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
              <div className="bg-white/95 border-4 border-black shadow-[6px_6px_0_rgba(0,0,0,1)] px-2 py-2 md:px-4 md:py-3 flex items-center gap-2 md:gap-3 rounded-sm">
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
                  className="ml-auto bg-red-600 hover:bg-red-700 text-white px-2 py-1 md:px-3 md:py-1.5 pixel-font text-xs md:text-sm border-2 border-black rounded"
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
      </div>
    </GameBoy>
  );
}
