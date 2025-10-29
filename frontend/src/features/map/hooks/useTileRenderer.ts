import {useState, useEffect, useRef} from 'react';

// Tile configuration
const TILE_SIZE = 512; // Size of each tile in pixels (larger tiles = fewer requests)
const CACHE_SIZE = 50; // Reduced cache size since we have fewer total tiles

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

interface PokemonSpawn {
  pokemon: {id: number; name: string; sprite: string};
  x: number;
  y: number;
}

interface VisiblePokemon {
  pokemon: {id: number; name: string; sprite: string};
  screenX: number;
  screenY: number;
}

interface TileRendererState {
  visibleTiles: VisibleTile[];
  visiblePokemon: VisiblePokemon[];
  isLoading: boolean;
}

export function useTileRenderer(
  camera: {x: number; y: number},
  viewportSize: {width: number; height: number},
  wildPokemon: PokemonSpawn[] = []
): TileRendererState {
  const [visibleTiles, setVisibleTiles] = useState<VisibleTile[]>([]);
  const [visiblePokemon, setVisiblePokemon] = useState<VisiblePokemon[]>([]);
  const [isLoading] = useState(false);
  const cacheRef = useRef<TileCache>({});
  const loadingTilesRef = useRef<Set<string>>(new Set());

  // Update visible tiles when camera moves (with debouncing)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Inline tile calculation to avoid dependency issues
      const buffer = TILE_SIZE * 1.5; // Smaller buffer since tiles are larger
      const startX = Math.max(0, Math.floor((camera.x - buffer) / TILE_SIZE));
      const endX = Math.min(
        TILES_X - 1,
        Math.floor((camera.x + viewportSize.width + buffer) / TILE_SIZE)
      );
      const startY = Math.max(0, Math.floor((camera.y - buffer) / TILE_SIZE));
      const endY = Math.min(
        TILES_Y - 1,
        Math.floor((camera.y + viewportSize.height + buffer) / TILE_SIZE)
      );

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
            screenY,
          });
        }
      }

      setVisibleTiles(newTiles);

      // Calculate visible Pokemon positions (same render cycle as tiles)
      const newPokemon: VisiblePokemon[] = wildPokemon.map((pokemon) => ({
        pokemon: pokemon.pokemon,
        screenX: pokemon.x - camera.x,
        screenY: pokemon.y - camera.y,
      }));
      setVisiblePokemon(newPokemon);

      // Load tiles that aren't cached (non-blocking)
      const tilesToLoad = newTiles.filter((tile) => !tile.loaded);

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
              batch.map(async (tile) => {
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
                        lastUsed: Date.now(),
                      };
                      loadingTilesRef.current.delete(key);

                      // Update tiles immediately when loaded
                      setVisibleTiles((currentTiles) =>
                        currentTiles.map((t) =>
                          t.x === tile.x && t.y === tile.y
                            ? {...t, loaded: true}
                            : t
                        )
                      );

                      // Cleanup cache if needed
                      const entries = Object.entries(cacheRef.current);
                      if (entries.length > CACHE_SIZE) {
                        entries.sort((a, b) => a[1].lastUsed - b[1].lastUsed);
                        const toRemove = entries.slice(
                          0,
                          entries.length - CACHE_SIZE
                        );
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
                } catch {
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
    // ESLint wants us to add [wildPokemon] as a dependency, but wildPokemon is an array
    // that gets recreated frequently (on spawn/despawn). Since arrays are compared by reference,
    // this would cause the effect to re-run constantly, recalculating ALL visible tiles
    // even when only Pokemon positions changed (not camera/viewport).
    // This is a performance optimization - we only need to recalculate when the view changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera.x, camera.y, viewportSize.width, viewportSize.height]);

  return {
    visibleTiles,
    visiblePokemon,
    isLoading,
  };
}
