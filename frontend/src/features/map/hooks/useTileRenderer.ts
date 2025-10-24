import {useState, useEffect, useRef, useCallback, useMemo} from 'react';

// Tile configuration
const TILE_SIZE = 256; // Size of each tile in pixels
const CACHE_SIZE = 100; // Maximum number of tiles to keep in cache (increased for better performance)

// Map dimensions
const MAP_WIDTH = 10560;
const MAP_HEIGHT = 6080;

// Calculate how many tiles we need
const TILES_X = Math.ceil(MAP_WIDTH / TILE_SIZE);
const TILES_Y = Math.ceil(MAP_HEIGHT / TILE_SIZE);

interface TileInfo {
  x: number;
  y: number;
  src: string;
  loaded: boolean;
}

interface VisibleTile extends TileInfo {
  screenX: number;
  screenY: number;
}

interface TileCache {
  [key: string]: {
    image: HTMLImageElement;
    lastUsed: number;
  };
}

interface TileRendererState {
  visibleTiles: VisibleTile[];
  isLoading: boolean;
}

export function useTileRenderer(
  camera: {x: number; y: number},
  viewportSize: {width: number; height: number}
): TileRendererState {
  const [visibleTiles, setVisibleTiles] = useState<VisibleTile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const loadingQueueRef = useRef<Set<string>>(new Set());
  const cacheRef = useRef<TileCache>({});
  const loadingTilesRef = useRef<Set<string>>(new Set());

  // Generate tile key for caching
  const getTileKey = useCallback((tileX: number, tileY: number) => {
    return `${tileX}_${tileY}`;
  }, []);

  // Get tile source URL
  const getTileSrc = useCallback((tileX: number, tileY: number) => {
    return `${import.meta.env.BASE_URL}map/tiles/map_${tileX}_${tileY}.webp`;
  }, []);

  // Clean up old cache entries
  const cleanupCache = useCallback(() => {
    const now = Date.now();
    const entries = Object.entries(cacheRef.current);

    if (entries.length <= CACHE_SIZE) return;

    // Sort by last used time and remove oldest entries
    entries.sort((a, b) => a[1].lastUsed - b[1].lastUsed);
    const toRemove = entries.slice(0, entries.length - CACHE_SIZE);

    toRemove.forEach(([key]) => {
      delete cacheRef.current[key];
    });
  }, []);

  // Load a tile image
  const loadTile = useCallback(async (tileX: number, tileY: number): Promise<HTMLImageElement | null> => {
    const key = getTileKey(tileX, tileY);

    // Check cache first
    if (cacheRef.current[key]) {
      cacheRef.current[key].lastUsed = Date.now();
      return cacheRef.current[key].image;
    }

    // Prevent duplicate loading
    if (loadingTilesRef.current.has(key)) {
      return null;
    }

    loadingTilesRef.current.add(key);

    try {
      const img = new Image();
      const src = getTileSrc(tileX, tileY);

      return new Promise((resolve, reject) => {
        img.onload = () => {
          // Cache the loaded image
          cacheRef.current[key] = {
            image: img,
            lastUsed: Date.now()
          };
          loadingTilesRef.current.delete(key);
          cleanupCache();
          resolve(img);
        };

        img.onerror = () => {
          loadingTilesRef.current.delete(key);
          reject(new Error(`Failed to load tile ${key}`));
        };

        img.src = src;
      });
    } catch (error) {
      loadingTilesRef.current.delete(key);
      return null;
    }
  }, [getTileKey, getTileSrc, cleanupCache]);

  // Calculate which tiles are visible
  const calculateVisibleTiles = useCallback(() => {
    // Add larger buffer around viewport to prevent pop-in and unloading
    const buffer = TILE_SIZE * 2; // Use 2 tile sizes as buffer
    const startX = Math.max(0, Math.floor((camera.x - buffer) / TILE_SIZE));
    const endX = Math.min(TILES_X - 1, Math.floor((camera.x + viewportSize.width + buffer) / TILE_SIZE));
    const startY = Math.max(0, Math.floor((camera.y - buffer) / TILE_SIZE));
    const endY = Math.min(TILES_Y - 1, Math.floor((camera.y + viewportSize.height + buffer) / TILE_SIZE));

    const tiles: VisibleTile[] = [];

    for (let tileY = startY; tileY <= endY; tileY++) {
      for (let tileX = startX; tileX <= endX; tileX++) {
        const worldX = tileX * TILE_SIZE;
        const worldY = tileY * TILE_SIZE;
        const screenX = worldX - camera.x;
        const screenY = worldY - camera.y;

        tiles.push({
          x: tileX,
          y: tileY,
          src: getTileSrc(tileX, tileY),
          loaded: !!cacheRef.current[getTileKey(tileX, tileY)],
          screenX,
          screenY
        });
      }
    }

    return tiles;
  }, [camera.x, camera.y, viewportSize.width, viewportSize.height, getTileSrc, getTileKey]);

  // Update visible tiles when camera moves (with debouncing)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Inline tile calculation to avoid dependency issues
      const buffer = TILE_SIZE * 2.5; // Increased buffer for mobile
      const startX = Math.max(0, Math.floor((camera.x - buffer) / TILE_SIZE));
      const endX = Math.min(TILES_X - 1, Math.floor((camera.x + viewportSize.width + buffer) / TILE_SIZE));
      const startY = Math.max(0, Math.floor((camera.y - buffer) / TILE_SIZE));
      const endY = Math.min(TILES_Y - 1, Math.floor((camera.y + viewportSize.height + buffer) / TILE_SIZE));

      const newTiles: VisibleTile[] = [];

      for (let tileY = startY; tileY <= endY; tileY++) {
        for (let tileX = startX; tileX <= endX; tileX++) {
          const worldX = tileX * TILE_SIZE;
          const worldY = tileY * TILE_SIZE;
          const screenX = worldX - camera.x;
          const screenY = worldY - camera.y;
          const key = `${tileX}_${tileY}`;

          newTiles.push({
            x: tileX,
            y: tileY,
            src: `${import.meta.env.BASE_URL}map/tiles/map_${tileX}_${tileY}.webp`,
            loaded: !!cacheRef.current[key],
            screenX,
            screenY
          });
        }
      }

      setVisibleTiles(newTiles);

      // Load tiles that aren't cached (non-blocking)
      const tilesToLoad = newTiles.filter(tile => !tile.loaded);

      if (tilesToLoad.length > 0) {
        // Sort tiles by distance from center for priority loading
        const centerX = camera.x + viewportSize.width / 2;
        const centerY = camera.y + viewportSize.height / 2;

        tilesToLoad.sort((a, b) => {
          const aCenterX = a.x * TILE_SIZE + TILE_SIZE / 2;
          const aCenterY = a.y * TILE_SIZE + TILE_SIZE / 2;
          const bCenterX = b.x * TILE_SIZE + TILE_SIZE / 2;
          const bCenterY = b.y * TILE_SIZE + TILE_SIZE / 2;

          const aDist = Math.hypot(aCenterX - centerX, aCenterY - centerY);
          const bDist = Math.hypot(bCenterX - centerX, bCenterY - centerY);

          return aDist - bDist;
        });

        // Load tiles with limited concurrency (better for mobile)
        const loadTilesBatch = async (tiles: VisibleTile[], batchSize = 4) => {
          for (let i = 0; i < tiles.length; i += batchSize) {
            const batch = tiles.slice(i, i + batchSize);
            await Promise.allSettled(
              batch.map(async tile => {
                const key = `${tile.x}_${tile.y}`;

                if (cacheRef.current[key] || loadingTilesRef.current.has(key)) {
                  return;
                }

                loadingTilesRef.current.add(key);

                try {
                  const img = new Image();
                  return new Promise<void>((resolve, reject) => {
                    img.onload = () => {
                      cacheRef.current[key] = {
                        image: img,
                        lastUsed: Date.now()
                      };
                      loadingTilesRef.current.delete(key);

                      // Update tiles immediately when loaded
                      setVisibleTiles(currentTiles =>
                        currentTiles.map(t =>
                          t.x === tile.x && t.y === tile.y
                            ? { ...t, loaded: true }
                            : t
                        )
                      );

                      // Cleanup cache if needed
                      const entries = Object.entries(cacheRef.current);
                      if (entries.length > CACHE_SIZE) {
                        entries.sort((a, b) => a[1].lastUsed - b[1].lastUsed);
                        const toRemove = entries.slice(0, entries.length - CACHE_SIZE);
                        toRemove.forEach(([k]) => {
                          delete cacheRef.current[k];
                        });
                      }

                      resolve();
                    };
                    img.onerror = () => {
                      loadingTilesRef.current.delete(key);
                      reject();
                    };
                    img.src = tile.src;
                  });
                } catch (error) {
                  loadingTilesRef.current.delete(key);
                }
              })
            );
          }
        };

        // Start background loading (non-blocking)
        loadTilesBatch(tilesToLoad);
      }
    }, 16); // ~60fps updates for smooth map movement

    return () => clearTimeout(timeoutId);
  }, [camera.x, camera.y, viewportSize.width, viewportSize.height]);

  return {
    visibleTiles,
    isLoading
  };
}