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

  // Load collision map
  useEffect(() => {
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
    img.onload = () => {
      try {
        ctx.drawImage(img, 0, 0, MAP_WIDTH, MAP_HEIGHT);
        const imageData = ctx.getImageData(0, 0, MAP_WIDTH, MAP_HEIGHT);
        collisionPixelsRef.current = imageData.data;
        setCollisionMapLoaded(true);
        logger.info('[useCollisionMap] collision map loaded & cached');
      } catch (err) {
        logger.logError(err, 'useCollisionMap.getImageData');
      }
    };
    img.onerror = () => {
      logger.error('[useCollisionMap] Failed to load collision map');
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
    }, [collisionMapLoaded]);

  return {
    collisionMapLoaded,
    isPositionWalkable,
  };
}
