import {useState, useEffect, useCallback, useRef} from 'react';

// Constants
const TILE_SIZE = 24; // Pixel size of each step (gentle speed increase)
const SPRITE_WIDTH = 68; // Width of one character sprite frame (272 / 4)
const SPRITE_HEIGHT = 72; // Height of one character sprite frame (288 / 4)
const ANIMATION_SPEED = 120; // ms between animation frames (slower for smoother look)
const MOVE_SPEED = 120; // ms for movement transition (faster updates)
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
  handleJoystickDirectionStart: (direction: 'up' | 'down' | 'left' | 'right') => void;
  handleJoystickDirectionChange: (direction: 'up' | 'down' | 'left' | 'right' | null) => void;
  handleJoystickDirectionStop: () => void;
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
      if (!collisionChecker.isPositionWalkable(newPos.x, newPos.y)) {
        return currentPos; // Block movement if collision detected
      }

      return newPos;
    },
    [collisionChecker]
  );

  // Movement interval management
  useEffect(() => {
    // ALWAYS clear any existing interval first
    if (movementIntervalRef.current) {
      clearInterval(movementIntervalRef.current);
      movementIntervalRef.current = null;
    }

    if (isMoving) {
      movementIntervalRef.current = window.setInterval(() => {
        const keys = Array.from(keysPressed.current);
        if (keys.length === 0) return;

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
    }

    return () => {
      if (movementIntervalRef.current) {
        clearInterval(movementIntervalRef.current);
        movementIntervalRef.current = null;
      }
    };
  }, [isMoving]);

  // Handle key down
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      const wasEmpty = keysPressed.current.size === 0;
      keysPressed.current.add(e.key);
      if (wasEmpty) {
        setIsMoving(true);
      }
    }
  }, []);

  // Handle key up
  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
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
  const handleJoystickDirectionStart = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    const keyMap = {
      up: 'ArrowUp',
      down: 'ArrowDown',
      left: 'ArrowLeft',
      right: 'ArrowRight',
    };

    const key = keyMap[direction];
    const wasEmpty = keysPressed.current.size === 0;
    keysPressed.current.add(key);
    if (wasEmpty) {
      setIsMoving(true);
    }
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

    // Camera info
    camera,
    screenPos,
    spritePos,
  };
}