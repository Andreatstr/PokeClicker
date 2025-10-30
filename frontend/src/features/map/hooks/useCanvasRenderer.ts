// src/features/map/hooks/useCanvasRenderer.tsx
import {useEffect, useRef} from 'react';

const TILE_SIZE = 512; // must match useTileRenderer's TILE_SIZE constant

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

export function useCanvasRenderer(params: {
  containerRef: React.RefObject<HTMLDivElement | null>;
  visibleTiles: VisibleTile[];
  tileCacheRef: React.RefObject<TileCache>;
  viewportSize: { width: number; height: number };
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

  // keep refs up-to-date without re-registering RAF
  useEffect(() => {
    visibleTilesRef.current = visibleTiles;
  }, [visibleTiles]);

  useEffect(() => {
    tileCacheRefLocal.current = tileCacheRef;
  }, [tileCacheRef]);

  useEffect(() => {
    // create or attach canvas into the container
    const container = containerRef.current;
    if (!container) return;

    let canvas = canvasRef.current;
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvasRef.current = canvas;
      // Make canvas fill the container
      canvas.style.position = 'absolute';
      canvas.style.left = '0';
      canvas.style.top = '0';
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.pointerEvents = 'none'; // don't capture pointer events; pokemon imgs still interactive
      container.prepend(canvas);
    }

    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const width = Math.max(1, Math.floor(viewportSize.width));
    const height = Math.max(1, Math.floor(viewportSize.height));

    // set backing store size for crispness
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
    if (!ctx) {
      // fallback
      return;
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;

    let rafId = 0;
    let mounted = true;

    const render = () => {
      if (!mounted) return;
      // clear and draw background
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);

      const tiles = visibleTilesRef.current;
      const cache = tileCacheRefLocal.current?.current ?? {};

      // Draw tiles from cache
      for (let i = 0; i < tiles.length; i++) {
        const t = tiles[i];
        const key = `${t.x}_${t.y}`;
        const entry = cache[key];
        if (entry && entry.image && entry.image.complete && entry.image.naturalWidth > 0) {
          // draw cached tile image (tile size in world pixels)
          ctx.drawImage(entry.image, t.screenX, t.screenY, tileSize, tileSize);
          // update lastUsed (optional)
          entry.lastUsed = Date.now();
        } else {
          // fallback: draw a placeholder tile (cheap)
          ctx.fillStyle = '#0f1720';
          ctx.fillRect(t.screenX, t.screenY, tileSize, tileSize);
          // optional: subtle grid for debug
          // ctx.strokeStyle = 'rgba(0,0,0,0.12)';
          // ctx.strokeRect(t.screenX, t.screenY, tileSize, tileSize);
        }
      }

      rafId = window.requestAnimationFrame(render);
    };

    rafId = window.requestAnimationFrame(render);

    return () => {
      mounted = false;
      if (rafId) cancelAnimationFrame(rafId);
      // do not remove the canvas here — keeping it between mounts can be faster,
      // but if you prefer cleanup, you can remove it:
      // if (canvas && canvas.parentElement === container) container.removeChild(canvas);
    };
    // We intentionally omit visibleTiles/tileCacheRef from effect deps because we
    // keep up-to-date refs and want the RAF loop to remain stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, viewportSize.width, viewportSize.height, tileSize, backgroundColor]);

  return {
    canvasRef,
  };
}
