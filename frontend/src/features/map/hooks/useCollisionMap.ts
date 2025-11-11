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
}

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

  // Check if a position is walkable (magenta pixel on collision map)
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
      const WALKABLE_COLOR = {r: 255, g: 0, b: 255};
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
          const colorMatch =
            Math.abs(r - WALKABLE_COLOR.r) < COLOR_TOLERANCE &&
            Math.abs(g - WALKABLE_COLOR.g) < COLOR_TOLERANCE &&
            Math.abs(b - WALKABLE_COLOR.b) < COLOR_TOLERANCE;

          if (colorMatch) return true;
        }
      }
      return false;
    },
    [collisionMapLoaded]
  );

  return {
    collisionMapLoaded,
    isPositionWalkable,
  };
}
