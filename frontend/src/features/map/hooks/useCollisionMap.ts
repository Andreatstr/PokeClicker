import {useState, useEffect, useRef, useCallback} from 'react';
import {logger} from '@/lib/logger';

// Map dimensions
const MAP_WIDTH = 10560;
const MAP_HEIGHT = 6080;

interface CollisionMapState {
  collisionMapLoaded: boolean;
  isPositionWalkable: (x: number, y: number) => boolean;
}

export function useCollisionMap(): CollisionMapState {
  const collisionPixelsRef = useRef<Uint8ClampedArray | null>(null);
  const [collisionMapLoaded, setCollisionMapLoaded] = useState(false);
  const loadStartedRef = useRef(false);

  // Defer collision map loading until user interaction to avoid blocking initial render
  useEffect(() => {
    const startLoading = () => {
      if (loadStartedRef.current) return;
      loadStartedRef.current = true;

      // Remove event listeners to prevent leaks
      window.removeEventListener('mousedown', startLoading);
      window.removeEventListener('touchstart', startLoading);
      window.removeEventListener('keydown', startLoading);

      const canvas = document.createElement('canvas');
      canvas.width = MAP_WIDTH;
      canvas.height = MAP_HEIGHT;
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

          if (bitmap) {
            ctx.drawImage(bitmap, 0, 0, MAP_WIDTH, MAP_HEIGHT);
          } else {
            ctx.drawImage(img, 0, 0, MAP_WIDTH, MAP_HEIGHT);
          }

          // Defer expensive pixel extraction to idle time to avoid blocking main thread
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
              const imageData = ctx.getImageData(0, 0, MAP_WIDTH, MAP_HEIGHT);
              collisionPixelsRef.current = imageData.data;
              setCollisionMapLoaded(true);
              logger.info('[useCollisionMap] collision map loaded & cached');
            } catch (err) {
              logger.logError(err, 'useCollisionMap.getImageData');
            }
          };

          if (typeof ric === 'function') {
            ric(() => {
              // Process in idle time to avoid blocking main thread
              doExtract();
            });
          } else {
            // Fallback: defer by one frame
            setTimeout(doExtract, 16);
          }
        } catch (err) {
          logger.logError(err, 'useCollisionMap.decode');
        }
      };
      img.onerror = () => {
        logger.error('[useCollisionMap] Failed to load collision map');
      };
    };

    // Start loading on any user interaction (map is only needed when user moves)
    window.addEventListener('mousedown', startLoading, {once: true});
    window.addEventListener('touchstart', startLoading, {once: true});
    window.addEventListener('keydown', startLoading, {once: true});

    // Fallback: start loading after 3 seconds if user doesn't interact
    const timeoutId = setTimeout(() => {
      startLoading();
    }, 3000);

    return () => {
      window.removeEventListener('mousedown', startLoading);
      window.removeEventListener('touchstart', startLoading);
      window.removeEventListener('keydown', startLoading);
      clearTimeout(timeoutId);
    };
  }, []);

  // Check if a position is walkable (white pixel on collision map)
  const isPositionWalkable = useCallback(
    (x: number, y: number): boolean => {
      if (!collisionPixelsRef.current || !collisionMapLoaded) {
        return true; // Allow movement if collision map not loaded yet
      }

      // Clamp coordinates to map bounds
      const checkX = Math.floor(Math.max(0, Math.min(x, MAP_WIDTH - 1)));
      const checkY = Math.floor(Math.max(0, Math.min(y, MAP_HEIGHT - 1)));

      const pixels = collisionPixelsRef.current;
      const idx = (checkY * MAP_WIDTH + checkX) * 4;

      if (idx < 0 || idx + 2 >= pixels.length) return true;

      const r = pixels[idx];
      const g = pixels[idx + 1];
      const b = pixels[idx + 2];

      const brightness = (r + g + b) / 3;
      return brightness > 200;
    },
    [collisionMapLoaded]
  );

  return {
    collisionMapLoaded,
    isPositionWalkable,
  };
}
