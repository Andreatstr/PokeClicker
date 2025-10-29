import {useState, useEffect, useCallback, useRef} from 'react';
import {logger} from '@/lib/logger';
import {useAuth} from '@features/auth/hooks/useAuth';

// Constants
const TILE_SIZE = 24; // Pixel size of each step (gentle speed increase)
const SPRITE_WIDTH = 68; // Width of one character sprite frame (272 / 4)
const SPRITE_HEIGHT = 72; // Height of one character sprite frame (288 / 4)
const ANIMATION_SPEED = 120; // ms between animation frames (slower for smoother look)
const MOVE_SPEED = 150; // ms for movement transition
const ANIMATION_FRAMES = 4; // Number of frames per direction

// Map dimensions
const MAP_WIDTH = 10560;
const MAP_HEIGHT = 6080;

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

  // Character position in world coordinates - restore from user-specific localStorage
  const [worldPosition, setWorldPosition] = useState(() => {
    if (!user?._id) {
      // Not logged in - use default center
      return {x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2};
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

    // First time for this user - start at center
    logger.info(`[MapMovement] New user ${user._id}, starting at map center`);
    return {x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2};
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
          logger.info(`[MapMovement] Failed to restore, resetting to center`);
          setWorldPosition({x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2});
        }
      } else {
        // New user - start at center
        logger.info(
          `[MapMovement] No saved position for user ${user._id}, starting at center`
        );
        setWorldPosition({x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2});
      }
    }
  }, [user?._id, userPositionKey]);

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

      // Check if the new position is walkable (check character center)
      if (!collisionChecker.isPositionWalkable(newPos.x, newPos.y)) {
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
    [calculateNewPosition]
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
    [calculateNewPosition]
  );

  const handleJoystickDirectionChange = useCallback(
    (direction: 'up' | 'down' | 'left' | 'right' | null) => {
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
    []
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
  const getCharacterScreenPosition = useCallback(() => {
    const camera = getCameraOffset();
    return {
      x: worldPosition.x - camera.x - SPRITE_WIDTH / 2,
      y: worldPosition.y - camera.y - SPRITE_HEIGHT / 2,
    };
  }, [worldPosition, getCameraOffset]);

  // Calculate sprite background position
  const getSpritePosition = useCallback(() => {
    const row = SPRITE_POSITIONS[direction];
    const col = animationFrame;
    return {
      backgroundPositionX: `-${col * SPRITE_WIDTH}px`,
      backgroundPositionY: `-${row * SPRITE_HEIGHT}px`,
    };
  }, [direction, animationFrame]);

  const camera = getCameraOffset();
  const screenPos = getCharacterScreenPosition();
  const spritePos = getSpritePosition();

  // Reset to home position
  const resetToHome = useCallback(() => {
    const homePosition = {x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2};
    setWorldPosition(homePosition);
    setIsMoving(false);
    keysPressed.current.clear();
  }, []);

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
