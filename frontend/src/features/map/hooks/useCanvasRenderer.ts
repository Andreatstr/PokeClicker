import {useEffect, useRef} from 'react';
import {TILE_SIZE} from '@/config/gameConfig';

interface VisibleTile {
  x: number;
  y: number;
  src: string;
  loaded: boolean;
  screenX: number;
  screenY: number;
}

interface TileCache {
  [key: string]: {
    image: HTMLImageElement;
    lastUsed: number;
  };
}

/**
 * Hook managing canvas-based rendering for map tiles
 *
 * Features:
 * - Hardware-accelerated canvas rendering with requestAnimationFrame loop
 * - Device pixel ratio handling for sharp rendering on high-DPI displays
 * - Tile cache integration for optimized image rendering
 * - Desynchronized canvas context for better performance
 * - Small overlap between tiles (0.5px) to prevent visual gaps
 * - Fallback background color for unloaded tiles
 *
 * Performance optimizations:
 * - Disabled image smoothing for crisp pixel art
 * - Alpha disabled for faster compositing
 * - Continuous render loop for smooth updates as tiles load
 * - Refs for tile data to avoid unnecessary effect re-runs
 *
 * @param params - Configuration including container, tiles, cache, and viewport
 * @returns Canvas reference for external access if needed
 */
export function useCanvasRenderer(params: {
  containerRef: React.RefObject<HTMLDivElement | null>;
  visibleTiles: VisibleTile[];
  tileCacheRef: React.RefObject<TileCache>;
  viewportSize: {width: number; height: number};
  tileSize?: number;
  backgroundColor?: string;
}) {
  const {
    containerRef,
    visibleTiles,
    tileCacheRef,
    viewportSize,
    tileSize = TILE_SIZE,
    backgroundColor = '#0f1720',
  } = params;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const visibleTilesRef = useRef(visibleTiles);
  const tileCacheRefLocal = useRef(tileCacheRef);

  useEffect(() => {
    visibleTilesRef.current = visibleTiles;
  }, [visibleTiles]);

  useEffect(() => {
    tileCacheRefLocal.current = tileCacheRef;
  }, [tileCacheRef]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let canvas = canvasRef.current;
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvasRef.current = canvas;
      canvas.style.position = 'absolute';
      canvas.style.left = '0';
      canvas.style.top = '0';
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.pointerEvents = 'none';
      container.prepend(canvas);
    }

    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const width = Math.max(1, Math.floor(viewportSize.width));
    const height = Math.max(1, Math.floor(viewportSize.height));

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d', {alpha: false, desynchronized: true});
    if (!ctx) {
      return;
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;

    let rafId = 0;
    let mounted = true;

    const render = () => {
      if (!mounted) return;
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);

      const tiles = visibleTilesRef.current;
      const cache = tileCacheRefLocal.current?.current ?? {};

      // Small overlap to prevent gaps between tiles
      const overlap = 0.5;

      for (let i = 0; i < tiles.length; i++) {
        const t = tiles[i];
        const key = `${t.x}_${t.y}`;
        const entry = cache[key];
        if (
          entry &&
          entry.image &&
          entry.image.complete &&
          entry.image.naturalWidth > 0
        ) {
          ctx.drawImage(
            entry.image,
            Math.round(t.screenX),
            Math.round(t.screenY),
            tileSize + overlap,
            tileSize + overlap
          );
          entry.lastUsed = Date.now();
        } else {
          ctx.fillStyle = '#0f1720';
          ctx.fillRect(
            Math.round(t.screenX),
            Math.round(t.screenY),
            tileSize + overlap,
            tileSize + overlap
          );
        }
      }

      rafId = window.requestAnimationFrame(render);
    };

    rafId = window.requestAnimationFrame(render);

    return () => {
      mounted = false;
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [
    containerRef,
    viewportSize.width,
    viewportSize.height,
    tileSize,
    backgroundColor,
  ]);

  return {
    canvasRef,
  };
}
