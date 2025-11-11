import {useState, useEffect, useCallback, useRef} from 'react';
import {logger} from '@/lib/logger';
import {useAuth} from '@features/auth/hooks/useAuth';

// Constants
const TILE_SIZE = 8; // Pixel size of each step (gentle speed increase)
const SHEET_FRAME_CELL_W = 68;
const SHEET_FRAME_CELL_H = 72;

// desired on-screen size
const SPRITE_WIDTH = 46;
const SPRITE_HEIGHT = 48.70588;
const ANIMATION_SPEED = 120; // ms between animation frames (slower for smoother look)
const MOVE_SPEED = 50; // ms for movement transition
const ANIMATION_FRAMES = 4; // Number of frames per direction

// Map dimensions
const MAP_WIDTH = 10560;
const MAP_HEIGHT = 6080;
// Spawn tweak: move initial spawn slightly down to avoid getting stuck on mobile
// Use a multiple of TILE_SIZE to align to the grid
const SPAWN_X_OFFSET = 634; // 5280 + 634 = 5914
const SPAWN_Y_OFFSET = 100; // 3040 + 100 = 3140

// Sprite sheet layout: 4 rows (down, left, right, up) x 3 columns (animation frames)
type Direction = 'down' | 'left' | 'right' | 'up';

const SPRITE_POSITIONS: Record<Direction, number> = {
  down: 0,
  left: 1,
  right: 2,
  up: 3,
};

const PLAYER_POSITION_KEY = 'playerPosition';

interface CollisionChecker {
  isPositionWalkable: (x: number, y: number) => boolean;
  collisionMapLoaded: boolean;
}

interface MovementState {
  worldPosition: {x: number; y: number};
  direction: Direction;
  isMoving: boolean;
  animationFrame: number;
}

interface MovementActions {
  handleJoystickDirectionStart: (
    direction: 'up' | 'down' | 'left' | 'right'
  ) => void;
  handleJoystickDirectionChange: (
    direction: 'up' | 'down' | 'left' | 'right' | null
  ) => void;
  handleJoystickDirectionStop: () => void;
  resetToHome: () => void;
}

interface CameraInfo {
  camera: {x: number; y: number};
  screenPos: {x: number; y: number};
  spritePos: {backgroundPositionX: string; backgroundPositionY: string};
}

export function useMapMovement(
  collisionChecker: CollisionChecker,
  renderSize: {width: number; height: number}
): MovementState & MovementActions & CameraInfo {
  const {user} = useAuth();

  // Create user-specific position key (same pattern as Pokemon spawns)
  const userPositionKey = user?._id
    ? `${PLAYER_POSITION_KEY}_${user._id}`
    : PLAYER_POSITION_KEY;

  // Helper for default/home position (centered, but nudged by SPAWN_X_OFFSET and SPAWN_Y_OFFSET)
  const getHomePosition = () => {
    const x = Math.min(
      MAP_WIDTH - SPRITE_WIDTH / 2,
      Math.max(SPRITE_WIDTH / 2, MAP_WIDTH / 2 + SPAWN_X_OFFSET)
    );
    const y = Math.min(
      MAP_HEIGHT - SPRITE_HEIGHT / 2,
      Math.max(SPRITE_HEIGHT / 2, MAP_HEIGHT / 2 + SPAWN_Y_OFFSET)
    );
    return {x, y};
  };

  // Character position in world coordinates - restore from user-specific localStorage
  const [worldPosition, setWorldPosition] = useState(() => {
    if (!user?._id) {
      // Not logged in - use default center
      return getHomePosition();
    }

    const saved = localStorage.getItem(userPositionKey);
    if (saved) {
      try {
        const restored = JSON.parse(saved);
        logger.info(
          `[MapMovement] Restored position for user ${user._id}: (${restored.x}, ${restored.y})`
        );
        return restored;
      } catch (e) {
        logger.logError(e, 'RestorePlayerPosition');
      }
    }

    // First time for this user - start near center (nudged down)
    logger.info(`[MapMovement] New user ${user._id}, starting at map center`);
    return getHomePosition();
  });
  const [direction, setDirection] = useState<Direction>('down');
  const [isMoving, setIsMoving] = useState(false);
  const [animationFrame, setAnimationFrame] = useState(0);

  const keysPressed = useRef<Set<string>>(new Set());
  const animationIntervalRef = useRef<number | null>(null);
  const movementIntervalRef = useRef<number | null>(null);
  const animationResetTimeoutRef = useRef<number | null>(null);

  // Save player position to user-specific localStorage whenever it changes
  useEffect(() => {
    if (user?._id) {
      localStorage.setItem(userPositionKey, JSON.stringify(worldPosition));
    }
  }, [worldPosition, userPositionKey, user?._id]);

  // Find nearest walkable point to a target (simple radial search)
  const findNearestWalkable = useCallback(
    (targetX: number, targetY: number) => {
      // If map not loaded, assume current is ok (we'll re-validate later)
      if (!collisionChecker.collisionMapLoaded) {
        return {x: targetX, y: targetY};
      }

      const clamp = (x: number, min: number, max: number) =>
        Math.max(min, Math.min(max, x));

      const startX = clamp(
        targetX,
        SPRITE_WIDTH / 2,
        MAP_WIDTH - SPRITE_WIDTH / 2
      );
      const startY = clamp(
        targetY,
        SPRITE_HEIGHT / 2,
        MAP_HEIGHT - SPRITE_HEIGHT / 2
      );

      // Direct hit
      if (collisionChecker.isPositionWalkable(startX, startY)) {
        return {x: startX, y: startY};
      }

      // Search outwards on a grid in TILE_SIZE steps along square rings
      const MAX_RADIUS = 2400; // px (~100 tiles)
      const STEP = TILE_SIZE; // px

      for (let r = STEP; r <= MAX_RADIUS; r += STEP) {
        // Top and bottom edges
        for (let dx = -r; dx <= r; dx += STEP) {
          const tx = clamp(
            startX + dx,
            SPRITE_WIDTH / 2,
            MAP_WIDTH - SPRITE_WIDTH / 2
          );
          const tyTop = clamp(
            startY - r,
            SPRITE_HEIGHT / 2,
            MAP_HEIGHT - SPRITE_HEIGHT / 2
          );
          const tyBottom = clamp(
            startY + r,
            SPRITE_HEIGHT / 2,
            MAP_HEIGHT - SPRITE_HEIGHT / 2
          );
          if (collisionChecker.isPositionWalkable(tx, tyTop))
            return {x: tx, y: tyTop};
          if (collisionChecker.isPositionWalkable(tx, tyBottom))
            return {x: tx, y: tyBottom};
        }
        // Left and right edges (skip corners; already checked)
        for (let dy = -r + STEP; dy <= r - STEP; dy += STEP) {
          const ty = clamp(
            startY + dy,
            SPRITE_HEIGHT / 2,
            MAP_HEIGHT - SPRITE_HEIGHT / 2
          );
          const txLeft = clamp(
            startX - r,
            SPRITE_WIDTH / 2,
            MAP_WIDTH - SPRITE_WIDTH / 2
          );
          const txRight = clamp(
            startX + r,
            SPRITE_WIDTH / 2,
            MAP_WIDTH - SPRITE_WIDTH / 2
          );
          if (collisionChecker.isPositionWalkable(txLeft, ty))
            return {x: txLeft, y: ty};
          if (collisionChecker.isPositionWalkable(txRight, ty))
            return {x: txRight, y: ty};
        }
      }

      // Fallback to target if nothing found (should be very rare)
      return {x: startX, y: startY};
    },
    [collisionChecker]
  );

  // Reset position when user changes (login/logout)
  useEffect(() => {
    if (user?._id) {
      const saved = localStorage.getItem(userPositionKey);
      if (saved) {
        try {
          const restored = JSON.parse(saved);
          logger.info(
            `[MapMovement] User changed, restoring position: (${restored.x}, ${restored.y})`
          );
          setWorldPosition(restored);
        } catch (e) {
          logger.logError(e, 'RestorePlayerPosition');
          logger.info(`[MapMovement] Failed to restore, resetting to home`);
          setWorldPosition(getHomePosition());
        }
      } else {
        // New user - start near center (nudged down)
        logger.info(
          `[MapMovement] No saved position for user ${user._id}, starting at home`
        );
        setWorldPosition(getHomePosition());
      }
    }
  }, [user?._id, userPositionKey]);

  // Once the collision map is loaded, validate current position and snap to nearest walkable
  useEffect(() => {
    if (!collisionChecker.collisionMapLoaded) return;
    setWorldPosition((prev: typeof worldPosition) => {
      if (collisionChecker.isPositionWalkable(prev.x, prev.y)) return prev;
      const fixed = findNearestWalkable(prev.x, prev.y);
      logger.info(
        `[MapMovement] Adjusted spawn to nearest walkable: (${fixed.x}, ${fixed.y})`
      );
      return fixed;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collisionChecker.collisionMapLoaded]);

  // Handle sprite animation when moving
  useEffect(() => {
    // Clear any existing timeout
    if (animationResetTimeoutRef.current) {
      clearTimeout(animationResetTimeoutRef.current);
      animationResetTimeoutRef.current = null;
    }

    if (isMoving) {
      // Cycle through frames 0, 1, 2, 3 for walking animation
      animationIntervalRef.current = window.setInterval(() => {
        setAnimationFrame((prev) => (prev + 1) % ANIMATION_FRAMES);
      }, ANIMATION_SPEED);
    } else {
      // Stop animation but don't reset to idle frame immediately
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
        animationIntervalRef.current = null;
      }
      // Keep current frame for better tap animation, reset to 0 after a delay
      animationResetTimeoutRef.current = window.setTimeout(() => {
        if (keysPressed.current.size === 0) {
          setAnimationFrame(0);
        }
      }, 300);
    }

    return () => {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
      }
      if (animationResetTimeoutRef.current) {
        clearTimeout(animationResetTimeoutRef.current);
      }
    };
  }, [isMoving]);

  // Calculate new position based on direction with collision detection
  const calculateNewPosition = useCallback(
    (currentPos: {x: number; y: number}, dir: Direction) => {
      const newPos = {...currentPos};

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

      // Check collision at character's feet position
      // Reduce the offset slightly so character appears lower on walkable area
      const feetX = newPos.x;
      const feetY = newPos.y + SPRITE_HEIGHT / 2 - 24;

      if (!collisionChecker.isPositionWalkable(feetX, feetY)) {
        return currentPos; // Block movement if collision detected
      }

      return newPos;
    },
    [collisionChecker]
  );

  // Movement interval management - back to original working logic
  useEffect(() => {
    // ALWAYS clear any existing interval first
    if (movementIntervalRef.current) {
      clearInterval(movementIntervalRef.current);
      movementIntervalRef.current = null;
    }

    if (isMoving) {
      movementIntervalRef.current = window.setInterval(() => {
        // Block movement if collision map isn't loaded yet
        if (!collisionChecker.collisionMapLoaded) {
          return;
        }

        const keys = Array.from(keysPressed.current);
        if (keys.length === 0) return; // Just return, don't call setIsMoving(false)

        const lastKey = keys[keys.length - 1];
        let dir: Direction | null = null;
        if (lastKey === 'ArrowUp' || lastKey === 'w' || lastKey === 'W')
          dir = 'up';
        else if (lastKey === 'ArrowDown' || lastKey === 's' || lastKey === 'S')
          dir = 'down';
        else if (lastKey === 'ArrowLeft' || lastKey === 'a' || lastKey === 'A')
          dir = 'left';
        else if (lastKey === 'ArrowRight' || lastKey === 'd' || lastKey === 'D')
          dir = 'right';

        if (dir) {
          setDirection(dir);
          setWorldPosition((prev: typeof worldPosition) => {
            const newPos = {...prev};

            switch (dir) {
              case 'up':
                newPos.y = Math.max(prev.y - TILE_SIZE, SPRITE_HEIGHT / 2);
                break;
              case 'down':
                newPos.y = Math.min(
                  prev.y + TILE_SIZE,
                  MAP_HEIGHT - SPRITE_HEIGHT / 2
                );
                break;
              case 'left':
                newPos.x = Math.max(prev.x - TILE_SIZE, SPRITE_WIDTH / 2);
                break;
              case 'right':
                newPos.x = Math.min(
                  prev.x + TILE_SIZE,
                  MAP_WIDTH - SPRITE_WIDTH / 2
                );
                break;
            }

            // Check collision directly without dependency
            if (!collisionChecker.isPositionWalkable(newPos.x, newPos.y)) {
              return prev;
            }

            return newPos;
          });
        }
      }, MOVE_SPEED);
    }

    return () => {
      if (movementIntervalRef.current) {
        clearInterval(movementIntervalRef.current);
        movementIntervalRef.current = null;
      }
    };
    // ESLint wants us to add [collisionChecker] as a dependency, but collisionChecker
    // is a new object reference on every render (returned from useCollisionMap).
    // Adding it would cause the movement interval to restart constantly, breaking
    // the ability to hold movement buttons (you'd have to tap repeatedly instead).
    // The collision check inside uses collisionChecker.isPositionWalkable which is
    // stable via useCallback, so the functionality works correctly without the dep.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMoving]);

  // Handle key down
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Block movement if collision map isn't loaded yet
      if (!collisionChecker.collisionMapLoaded) {
        return;
      }

      const validKeys = [
        'ArrowUp',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
        'w',
        'a',
        's',
        'd',
        'W',
        'A',
        'S',
        'D',
      ];
      if (validKeys.includes(e.key)) {
        e.preventDefault();

        // Check if this is a new key press (not a repeat)
        const isNewKey = !keysPressed.current.has(e.key);
        keysPressed.current.add(e.key);

        // Immediate movement for any new key press (tap responsiveness)
        if (isNewKey) {
          let dir: Direction | null = null;
          if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') dir = 'up';
          else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S')
            dir = 'down';
          else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A')
            dir = 'left';
          else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D')
            dir = 'right';

          if (dir) {
            setDirection(dir);
            setWorldPosition((prev: typeof worldPosition) =>
              calculateNewPosition(prev, dir)
            );
            setAnimationFrame((prev) => (prev + 1) % ANIMATION_FRAMES);
          }
          setIsMoving(true);
        }
      }
    },
    [calculateNewPosition, collisionChecker.collisionMapLoaded]
  );

  // Handle key up
  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    const validKeys = [
      'ArrowUp',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'w',
      'a',
      's',
      'd',
      'W',
      'A',
      'S',
      'D',
    ];
    if (validKeys.includes(e.key)) {
      e.preventDefault();
      keysPressed.current.delete(e.key);
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
  const handleJoystickDirectionStart = useCallback(
    (direction: 'up' | 'down' | 'left' | 'right') => {
      // Block movement if collision map isn't loaded yet
      if (!collisionChecker.collisionMapLoaded) {
        return;
      }

      const keyMap = {
        up: 'ArrowUp',
        down: 'ArrowDown',
        left: 'ArrowLeft',
        right: 'ArrowRight',
      };

      const key = keyMap[direction];
      const wasEmpty = keysPressed.current.size === 0;
      keysPressed.current.add(key);

      // Immediate movement for joystick responsiveness
      if (wasEmpty) {
        const dir = direction as Direction;
        setDirection(dir);
        setWorldPosition((prev: typeof worldPosition) =>
          calculateNewPosition(prev, dir)
        );
        setAnimationFrame((prev) => (prev + 1) % ANIMATION_FRAMES);
        setIsMoving(true);
      }
    },
    [calculateNewPosition, collisionChecker.collisionMapLoaded]
  );

  const handleJoystickDirectionChange = useCallback(
    (direction: 'up' | 'down' | 'left' | 'right' | null) => {
      // Block movement if collision map isn't loaded yet
      if (!collisionChecker.collisionMapLoaded) {
        return;
      }

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
    },
    [collisionChecker.collisionMapLoaded]
  );

  const handleJoystickDirectionStop = useCallback(() => {
    keysPressed.current.clear();
    setIsMoving(false);
  }, []);

  // Calculate camera offset to center character in viewport
  const getCameraOffset = useCallback(() => {
    // Try to center character in viewport
    let cameraX = worldPosition.x - renderSize.width / 2;
    let cameraY = worldPosition.y - renderSize.height / 2;

    // Clamp camera to map boundaries
    cameraX = Math.max(0, Math.min(cameraX, MAP_WIDTH - renderSize.width));
    cameraY = Math.max(0, Math.min(cameraY, MAP_HEIGHT - renderSize.height));

    return {x: cameraX, y: cameraY};
  }, [worldPosition, renderSize]);

  // Calculate character's screen position relative to camera
  // Position the character so their feet (bottom center) align with worldPosition
  const getCharacterScreenPosition = useCallback(() => {
    const camera = getCameraOffset();
    // The worldPosition represents where the character's feet touch the ground
    // So we need to offset the sprite upward by most of its height
    return {
      x: worldPosition.x - camera.x - SPRITE_WIDTH / 2, // Slight left adjustment for better centering
      y: worldPosition.y - camera.y - SPRITE_HEIGHT + SPRITE_HEIGHT * 0.2, // Feet at bottom with slight offset
    };
  }, [worldPosition, getCameraOffset]);

  // Calculate sprite background position (returns raw sheet positions, TiledMapView will scale)
  const getSpritePosition = useCallback(() => {
    const row = SPRITE_POSITIONS[direction];
    const col = animationFrame;

    // Return raw sheet cell positions (in sheet cell units)
    // TiledMapView will handle the scaling to display size
    const rawPosX = col * SHEET_FRAME_CELL_W;
    const rawPosY = row * SHEET_FRAME_CELL_H;

    return {
      backgroundPositionX: `-${rawPosX}px`,
      backgroundPositionY: `-${rawPosY}px`,
    };
  }, [direction, animationFrame]);

  const camera = getCameraOffset();
  const screenPos = getCharacterScreenPosition();
  const spritePos = getSpritePosition();

  // Reset to home position
  const resetToHome = useCallback(() => {
    const homePosition = getHomePosition();
    const legalHome = findNearestWalkable(homePosition.x, homePosition.y);
    setWorldPosition(legalHome);
    setIsMoving(false);
    keysPressed.current.clear();
  }, [findNearestWalkable]);

  return {
    // State
    worldPosition,
    direction,
    isMoving,
    animationFrame,

    // Actions
    handleJoystickDirectionStart,
    handleJoystickDirectionChange,
    handleJoystickDirectionStop,
    resetToHome,

    // Camera info
    camera,
    screenPos,
    spritePos,
  };
}
