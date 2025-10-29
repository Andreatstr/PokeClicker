import {useState, useEffect, useRef, useCallback} from 'react';

// Map dimensions
const MAP_WIDTH = 10560;
const MAP_HEIGHT = 6080;

interface CollisionMapState {
  collisionMapLoaded: boolean;
  isPositionWalkable: (x: number, y: number) => boolean;
}

export function useCollisionMap(): CollisionMapState {
  const collisionCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const collisionCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [collisionMapLoaded, setCollisionMapLoaded] = useState(false);

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
    };
    img.onerror = () => {
      console.error('Failed to load collision map');
    };
  }, []);

  // Check if a position is walkable (white pixel on collision map)
  const isPositionWalkable = useCallback(
    (x: number, y: number): boolean => {
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
    },
    [collisionMapLoaded]
  );

  return {
    collisionMapLoaded,
    isPositionWalkable,
  };
}
