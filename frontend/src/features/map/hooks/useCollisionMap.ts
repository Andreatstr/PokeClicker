import {useState, useEffect, useRef, useCallback} from 'react';
import {logger} from '@/lib/logger';

// Map dimensions
const MAP_WIDTH = 10560;
const MAP_HEIGHT = 6080;
// Downscale factor to make collision map feasible on mobile (memory)
const COLLISION_SCALE = 4; // 1 pixel here represents 4x4 world pixels
const SCALED_WIDTH = Math.floor(MAP_WIDTH / COLLISION_SCALE);
const SCALED_HEIGHT = Math.floor(MAP_HEIGHT / COLLISION_SCALE);

interface CollisionMapState {
  collisionMapLoaded: boolean;
  isPositionWalkable: (x: number, y: number) => boolean;
  isPositionSemiWalkable: (x: number, y: number) => boolean;
}

/**
 * Hook managing collision detection system for map walkability
 *
 * Features:
 * - Loads collision map image (webp) and extracts pixel data
 * - Downscales by 4x for mobile memory efficiency (2640x1520 instead of 10560x6080)
 * - Color-coded collision system:
 *   - Magenta (255,0,255): Walkable areas
 *   - Cyan (0,255,255): Semi-walkable (caves/houses with transparency)
 *   - Other colors: Non-walkable obstacles
 * - 3x3 neighborhood sampling for robust collision detection after scaling
 * - Off-main-thread image decoding for better performance
 * - Idle callback for pixel extraction to avoid blocking UI
 *
 * Performance optimizations:
 * - Nearest-neighbor scaling to preserve crisp binary collision data
 * - Ref-based storage for collision data to avoid re-renders
 * - Color tolerance (±30) to handle compression artifacts
 *
 * @returns Collision state and position checking functions
 */
export function useCollisionMap(): CollisionMapState {
  const collisionPixelsRef = useRef<Uint8ClampedArray | null>(null);
  const [collisionMapLoaded, setCollisionMapLoaded] = useState(false);
  const loadStartedRef = useRef(false);

  // Load collision map immediately on mount (no user interaction delay)
  useEffect(() => {
    if (loadStartedRef.current) return;
    loadStartedRef.current = true;

    const canvas = document.createElement('canvas');
    canvas.width = SCALED_WIDTH;
    canvas.height = SCALED_HEIGHT;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      logger.error('[useCollisionMap] 2D context not available');
      return;
    }

    const img = new Image();
    img.src = `${import.meta.env.BASE_URL}map-collision.webp`;
    img.crossOrigin = 'anonymous';
    img.onload = async () => {
      try {
        // Try off-main-thread decoding when available
        let bitmap: ImageBitmap | null = null;
        try {
          bitmap = await createImageBitmap(img);
        } catch {
          bitmap = null;
        }

        // Use nearest-neighbor to preserve crisp binary map when downscaling
        (ctx as CanvasRenderingContext2D).imageSmoothingEnabled = false;
        if (bitmap) {
          ctx.drawImage(bitmap, 0, 0, SCALED_WIDTH, SCALED_HEIGHT);
        } else {
          ctx.drawImage(img, 0, 0, SCALED_WIDTH, SCALED_HEIGHT);
        }

        // Defer pixel extraction to idle time to avoid blocking main thread
        const ric = (
          window as Window & {
            requestIdleCallback?: (
              callback: (deadline?: IdleDeadline) => void,
              options?: {timeout?: number}
            ) => number;
          }
        ).requestIdleCallback;

        const doExtract = () => {
          try {
            const imageData = ctx.getImageData(
              0,
              0,
              SCALED_WIDTH,
              SCALED_HEIGHT
            );
            collisionPixelsRef.current = imageData.data;
            setCollisionMapLoaded(true);
            logger.info('[useCollisionMap] collision map loaded & cached');
          } catch (err) {
            logger.logError(err, 'useCollisionMap.getImageData');
          }
        };

        if (typeof ric === 'function') {
          ric(() => doExtract());
        } else {
          setTimeout(doExtract, 16);
        }
      } catch (err) {
        logger.logError(err, 'useCollisionMap.decode');
      }
    };
    img.onerror = () => {
      logger.error('[useCollisionMap] Failed to load collision map');
    };
  }, []);

  /**
   * Check if a world position is walkable
   * Returns true for magenta or cyan pixels (with tolerance for compression)
   * Uses 3x3 neighborhood sampling for robust detection after downscaling
   */
  const isPositionWalkable = useCallback(
    (x: number, y: number): boolean => {
      if (!collisionPixelsRef.current || !collisionMapLoaded) {
        return true; // Allow movement if collision map not loaded yet
      }

      // Clamp coordinates to map bounds
      const checkX = Math.floor(Math.max(0, Math.min(x, MAP_WIDTH - 1)));
      const checkY = Math.floor(Math.max(0, Math.min(y, MAP_HEIGHT - 1)));

      // Map to scaled collision map coordinates
      const sx = Math.floor(checkX / COLLISION_SCALE);
      const sy = Math.floor(checkY / COLLISION_SCALE);

      const pixels = collisionPixelsRef.current;

      // Magenta (255, 0, 255) = walkable
      // Cyan (0, 255, 255) = semi-walkable (caves/houses with transparency)
      const WALKABLE_COLOR = {r: 255, g: 0, b: 255};
      const SEMI_WALKABLE_COLOR = {r: 0, g: 255, b: 255};
      const COLOR_TOLERANCE = 30; // Allow slight variations due to compression

      // Sample a small 3x3 neighborhood to tolerate boundaries after scaling
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = Math.max(0, Math.min(SCALED_WIDTH - 1, sx + dx));
          const ny = Math.max(0, Math.min(SCALED_HEIGHT - 1, sy + dy));
          const idx = (ny * SCALED_WIDTH + nx) * 4;
          if (idx < 0 || idx + 2 >= pixels.length) continue;

          const r = pixels[idx];
          const g = pixels[idx + 1];
          const b = pixels[idx + 2];

          // Check if color matches magenta (within tolerance)
          const magentaMatch =
            Math.abs(r - WALKABLE_COLOR.r) < COLOR_TOLERANCE &&
            Math.abs(g - WALKABLE_COLOR.g) < COLOR_TOLERANCE &&
            Math.abs(b - WALKABLE_COLOR.b) < COLOR_TOLERANCE;

          // Check if color matches cyan (within tolerance)
          const cyanMatch =
            Math.abs(r - SEMI_WALKABLE_COLOR.r) < COLOR_TOLERANCE &&
            Math.abs(g - SEMI_WALKABLE_COLOR.g) < COLOR_TOLERANCE &&
            Math.abs(b - SEMI_WALKABLE_COLOR.b) < COLOR_TOLERANCE;

          if (magentaMatch || cyanMatch) return true;
        }
      }
      return false;
    },
    [collisionMapLoaded]
  );

  // Check if a position is in a semi-walkable area (caves/houses)
  const isPositionSemiWalkable = useCallback(
    (x: number, y: number): boolean => {
      if (!collisionPixelsRef.current || !collisionMapLoaded) {
        return false;
      }

      // Clamp coordinates to map bounds
      const checkX = Math.floor(Math.max(0, Math.min(x, MAP_WIDTH - 1)));
      const checkY = Math.floor(Math.max(0, Math.min(y, MAP_HEIGHT - 1)));

      // Map to scaled collision map coordinates
      const sx = Math.floor(checkX / COLLISION_SCALE);
      const sy = Math.floor(checkY / COLLISION_SCALE);

      const pixels = collisionPixelsRef.current;

      // Cyan (0, 255, 255) = semi-walkable (caves/houses with transparency)
      const SEMI_WALKABLE_COLOR = {r: 0, g: 255, b: 255};
      const COLOR_TOLERANCE = 30;

      // Sample a small 3x3 neighborhood to tolerate boundaries after scaling
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = Math.max(0, Math.min(SCALED_WIDTH - 1, sx + dx));
          const ny = Math.max(0, Math.min(SCALED_HEIGHT - 1, sy + dy));
          const idx = (ny * SCALED_WIDTH + nx) * 4;
          if (idx < 0 || idx + 2 >= pixels.length) continue;

          const r = pixels[idx];
          const g = pixels[idx + 1];
          const b = pixels[idx + 2];

          // Check if color matches cyan (within tolerance)
          const cyanMatch =
            Math.abs(r - SEMI_WALKABLE_COLOR.r) < COLOR_TOLERANCE &&
            Math.abs(g - SEMI_WALKABLE_COLOR.g) < COLOR_TOLERANCE &&
            Math.abs(b - SEMI_WALKABLE_COLOR.b) < COLOR_TOLERANCE;

          if (cyanMatch) return true;
        }
      }
      return false;
    },
    [collisionMapLoaded]
  );

  return {
    collisionMapLoaded,
    isPositionWalkable,
    isPositionSemiWalkable,
  };
}
