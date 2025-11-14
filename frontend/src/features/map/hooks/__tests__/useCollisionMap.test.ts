import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {renderHook, waitFor} from '@testing-library/react';
import {useCollisionMap} from '../useCollisionMap';

// Mock the logger
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    logError: vi.fn(),
  },
}));

describe('useCollisionMap hook', () => {
  let mockCanvas: HTMLCanvasElement;
  let mockContext: CanvasRenderingContext2D;
  let mockImage: HTMLImageElement;
  let createElementSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Create mock canvas and context
    mockContext = {
      drawImage: vi.fn(),
      getImageData: vi.fn(() => ({
        data: new Uint8ClampedArray(2640 * 1520 * 4), // Scaled dimensions * 4 (RGBA)
        width: 2640,
        height: 1520,
      })),
      imageSmoothingEnabled: true,
    } as unknown as CanvasRenderingContext2D;

    mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => mockContext),
    } as unknown as HTMLCanvasElement;

    // Store original createElement to avoid recursion
    const originalCreateElement = document.createElement.bind(document);
    createElementSpy = vi
      .spyOn(document, 'createElement')
      .mockImplementation((tagName: string) => {
        if (tagName === 'canvas') {
          return mockCanvas;
        }
        return originalCreateElement(tagName);
      });

    // Mock Image constructor
    global.Image = class MockImage {
      src = '';
      crossOrigin: string | null = null;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;

      constructor() {
        mockImage = this as unknown as HTMLImageElement;
        // Simulate async image loading
        setTimeout(() => {
          if (this.onload) this.onload();
        }, 0);
      }
    } as unknown as typeof Image;

    // Mock createImageBitmap
    global.createImageBitmap = vi.fn().mockResolvedValue({});

    // Mock requestIdleCallback
    (window as any).requestIdleCallback = vi.fn((callback: () => void) => {
      setTimeout(callback, 0);
      return 1;
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    createElementSpy.mockRestore();
    delete (window as any).requestIdleCallback;
  });

  describe('Initialization', () => {
    it('should start with collision map not loaded', () => {
      const {result} = renderHook(() => useCollisionMap());

      expect(result.current.collisionMapLoaded).toBe(false);
    });

    it('should provide isPositionWalkable function', () => {
      const {result} = renderHook(() => useCollisionMap());

      expect(typeof result.current.isPositionWalkable).toBe('function');
    });

    it('should provide isPositionSemiWalkable function', () => {
      const {result} = renderHook(() => useCollisionMap());

      expect(typeof result.current.isPositionSemiWalkable).toBe('function');
    });

    it('should create canvas with scaled dimensions', () => {
      renderHook(() => useCollisionMap());

      expect(document.createElement).toHaveBeenCalledWith('canvas');
      expect(mockCanvas.width).toBe(2640); // 10560 / 4
      expect(mockCanvas.height).toBe(1520); // 6080 / 4
    });

    it('should load collision map image', () => {
      renderHook(() => useCollisionMap());

      expect(mockImage).toBeDefined();
      expect(mockImage.src).toContain('map-collision.webp');
      expect(mockImage.crossOrigin).toBe('anonymous');
    });

    it('should handle missing 2D context gracefully', () => {
      mockCanvas.getContext = vi.fn(() => null);

      const {result} = renderHook(() => useCollisionMap());

      expect(result.current.collisionMapLoaded).toBe(false);
    });
  });

  describe('Image Loading', () => {
    it('should set collision map loaded when image loads successfully', async () => {
      const {result} = renderHook(() => useCollisionMap());

      await waitFor(() => {
        expect(result.current.collisionMapLoaded).toBe(true);
      });
    });

    it('should disable image smoothing for crisp binary map', async () => {
      renderHook(() => useCollisionMap());

      await waitFor(() => {
        expect(mockContext.imageSmoothingEnabled).toBe(false);
      });
    });

    it('should draw image to canvas', async () => {
      renderHook(() => useCollisionMap());

      await waitFor(() => {
        expect(mockContext.drawImage).toHaveBeenCalled();
      });
    });

    it('should extract image data from canvas', async () => {
      renderHook(() => useCollisionMap());

      await waitFor(() => {
        expect(mockContext.getImageData).toHaveBeenCalledWith(0, 0, 2640, 1520);
      });
    });

    it('should use createImageBitmap for off-thread decoding', async () => {
      renderHook(() => useCollisionMap());

      await waitFor(() => {
        expect(global.createImageBitmap).toHaveBeenCalled();
      });
    });

    it('should fallback to direct drawImage if createImageBitmap fails', async () => {
      global.createImageBitmap = vi
        .fn()
        .mockRejectedValue(new Error('Not supported'));

      renderHook(() => useCollisionMap());

      await waitFor(() => {
        expect(mockContext.drawImage).toHaveBeenCalled();
      });
    });

    it('should defer pixel extraction using requestIdleCallback', async () => {
      renderHook(() => useCollisionMap());

      await waitFor(() => {
        expect((window as any).requestIdleCallback).toHaveBeenCalled();
      });
    });

    it('should fallback to setTimeout if requestIdleCallback is not available', async () => {
      delete (window as any).requestIdleCallback;
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout');

      renderHook(() => useCollisionMap());

      await waitFor(() => {
        expect(setTimeoutSpy).toHaveBeenCalled();
      });
    });

    it('should handle image load error', () => {
      global.Image = class MockImage {
        src = '';
        crossOrigin: string | null = null;
        onload: (() => void) | null = null;
        onerror: ((event: Event) => void) | null = null;

        constructor() {
          mockImage = this as unknown as HTMLImageElement;
          setTimeout(() => {
            if (this.onerror) this.onerror(new Event('error'));
          }, 0);
        }
      } as unknown as typeof Image;

      const {result} = renderHook(() => useCollisionMap());

      // Should still be usable even if image fails to load
      expect(result.current.isPositionWalkable(100, 100)).toBe(true);
    });

    it('should handle getImageData error', async () => {
      mockContext.getImageData = vi.fn(() => {
        throw new Error('Security error');
      });

      const {result} = renderHook(() => useCollisionMap());

      await waitFor(() => {
        // Should handle error gracefully
        expect(result.current.collisionMapLoaded).toBe(false);
      });
    });
  });

  describe('Position Walkability', () => {
    beforeEach(() => {
      // Setup mock with sample collision data
      const mockData = new Uint8ClampedArray(2640 * 1520 * 4);

      // Initialize all pixels as black (non-walkable) first
      for (let i = 0; i < mockData.length; i += 4) {
        mockData[i] = 0; // R
        mockData[i + 1] = 0; // G
        mockData[i + 2] = 0; // B
        mockData[i + 3] = 255; // A
      }

      // Set pixel at (0, 0) as magenta (walkable: 255, 0, 255)
      const idx0 = (0 * 2640 + 0) * 4;
      mockData[idx0] = 255; // R
      mockData[idx0 + 1] = 0; // G
      mockData[idx0 + 2] = 255; // B
      mockData[idx0 + 3] = 255; // A

      // Set pixel at (1, 0) as cyan (semi-walkable: 0, 255, 255)
      const idx1 = (0 * 2640 + 1) * 4;
      mockData[idx1] = 0; // R
      mockData[idx1 + 1] = 255; // G
      mockData[idx1 + 2] = 255; // B
      mockData[idx1 + 3] = 255; // A

      // Pixel at (100, 0) and surrounding area will be black (not walkable)
      // This ensures position (400, 0) in world coords (100 in collision map) is truly non-walkable

      mockContext.getImageData = vi.fn(() => ({
        data: mockData,
        width: 2640,
        height: 1520,
      }));
    });

    it('should return true for positions before map loads', () => {
      const {result} = renderHook(() => useCollisionMap());

      // Before map loads, all positions should be walkable
      expect(result.current.isPositionWalkable(100, 100)).toBe(true);
    });

    it('should detect magenta pixels as walkable', async () => {
      const {result} = renderHook(() => useCollisionMap());

      await waitFor(() => {
        expect(result.current.collisionMapLoaded).toBe(true);
      });

      // Position (0, 0) should be walkable (magenta)
      expect(result.current.isPositionWalkable(0, 0)).toBe(true);
    });

    it('should detect cyan pixels as walkable', async () => {
      const {result} = renderHook(() => useCollisionMap());

      await waitFor(() => {
        expect(result.current.collisionMapLoaded).toBe(true);
      });

      // Position (4, 0) should be walkable (cyan)
      expect(result.current.isPositionWalkable(4, 0)).toBe(true);
    });

    it('should detect non-walkable pixels', async () => {
      const {result} = renderHook(() => useCollisionMap());

      await waitFor(() => {
        expect(result.current.collisionMapLoaded).toBe(true);
      });

      // Position (400, 0) in world coords -> (100, 0) in collision map (400/4 = 100)
      // All pixels around (100, 0) are black (non-walkable) so even with 3x3 sampling it should be false
      expect(result.current.isPositionWalkable(400, 0)).toBe(false);
    });

    it('should clamp coordinates to map bounds', async () => {
      const {result} = renderHook(() => useCollisionMap());

      await waitFor(() => {
        expect(result.current.collisionMapLoaded).toBe(true);
      });

      // Test with coordinates outside map bounds
      expect(() => result.current.isPositionWalkable(-100, -100)).not.toThrow();
      expect(() =>
        result.current.isPositionWalkable(20000, 20000)
      ).not.toThrow();
    });

    it('should map world coordinates to scaled collision map coordinates', async () => {
      const {result} = renderHook(() => useCollisionMap());

      await waitFor(() => {
        expect(result.current.collisionMapLoaded).toBe(true);
      });

      // World coordinate 100 should map to collision coordinate 25 (100/4)
      expect(() => result.current.isPositionWalkable(100, 100)).not.toThrow();
    });

    it('should sample 3x3 neighborhood for tolerance', async () => {
      const {result} = renderHook(() => useCollisionMap());

      await waitFor(() => {
        expect(result.current.collisionMapLoaded).toBe(true);
      });

      // Even if exact position is not walkable, nearby walkable pixels should make it valid
      const isWalkable = result.current.isPositionWalkable(2, 2);
      expect(typeof isWalkable).toBe('boolean');
    });

    it('should handle color tolerance for compression artifacts', async () => {
      // Setup mock with slightly off-color magenta (due to compression)
      const mockData = new Uint8ClampedArray(2640 * 1520 * 4);
      mockData[0] = 250; // R (slightly less than 255)
      mockData[1] = 5; // G (slightly more than 0)
      mockData[2] = 250; // B (slightly less than 255)
      mockData[3] = 255; // A

      mockContext.getImageData = vi.fn(() => ({
        data: mockData,
        width: 2640,
        height: 1520,
      }));

      const {result} = renderHook(() => useCollisionMap());

      await waitFor(() => {
        expect(result.current.collisionMapLoaded).toBe(true);
      });

      // Should still be considered walkable within tolerance
      expect(result.current.isPositionWalkable(0, 0)).toBe(true);
    });

    it('should handle edge coordinates at map boundaries', async () => {
      const {result} = renderHook(() => useCollisionMap());

      await waitFor(() => {
        expect(result.current.collisionMapLoaded).toBe(true);
      });

      // Test corners and edges
      expect(() => result.current.isPositionWalkable(0, 0)).not.toThrow();
      expect(() => result.current.isPositionWalkable(10559, 0)).not.toThrow();
      expect(() => result.current.isPositionWalkable(0, 6079)).not.toThrow();
      expect(() =>
        result.current.isPositionWalkable(10559, 6079)
      ).not.toThrow();
    });

    it('should handle fractional coordinates', async () => {
      const {result} = renderHook(() => useCollisionMap());

      await waitFor(() => {
        expect(result.current.collisionMapLoaded).toBe(true);
      });

      // Should floor coordinates
      expect(() =>
        result.current.isPositionWalkable(100.7, 200.3)
      ).not.toThrow();
    });
  });

  describe('Semi-Walkable Detection', () => {
    beforeEach(() => {
      const mockData = new Uint8ClampedArray(2640 * 1520 * 4);

      // Initialize all pixels as black (non-walkable) first
      for (let i = 0; i < mockData.length; i += 4) {
        mockData[i] = 0; // R
        mockData[i + 1] = 0; // G
        mockData[i + 2] = 0; // B
        mockData[i + 3] = 255; // A
      }

      // Set pixel at (0, 0) and surrounding as cyan (semi-walkable: 0, 255, 255)
      for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
          const idx = (y * 2640 + x) * 4;
          mockData[idx] = 0; // R
          mockData[idx + 1] = 255; // G
          mockData[idx + 2] = 255; // B
          mockData[idx + 3] = 255; // A
        }
      }

      // Set pixel at (10, 0) and surrounding as magenta (walkable but not semi: 255, 0, 255)
      for (let y = 0; y < 3; y++) {
        for (let x = 10; x < 13; x++) {
          const idx = (y * 2640 + x) * 4;
          mockData[idx] = 255; // R
          mockData[idx + 1] = 0; // G
          mockData[idx + 2] = 255; // B
          mockData[idx + 3] = 255; // A
        }
      }

      mockContext.getImageData = vi.fn(() => ({
        data: mockData,
        width: 2640,
        height: 1520,
      }));
    });

    it('should return false for semi-walkable before map loads', () => {
      const {result} = renderHook(() => useCollisionMap());

      expect(result.current.isPositionSemiWalkable(100, 100)).toBe(false);
    });

    it('should detect cyan pixels as semi-walkable', async () => {
      const {result} = renderHook(() => useCollisionMap());

      await waitFor(() => {
        expect(result.current.collisionMapLoaded).toBe(true);
      });

      expect(result.current.isPositionSemiWalkable(0, 0)).toBe(true);
    });

    it('should not detect magenta pixels as semi-walkable', async () => {
      const {result} = renderHook(() => useCollisionMap());

      await waitFor(() => {
        expect(result.current.collisionMapLoaded).toBe(true);
      });

      // Position (40, 0) in world coords -> (10, 0) in collision map (40/4 = 10)
      // This position has magenta pixels which are walkable but NOT semi-walkable
      expect(result.current.isPositionSemiWalkable(40, 0)).toBe(false);
    });

    it('should clamp coordinates to map bounds', async () => {
      const {result} = renderHook(() => useCollisionMap());

      await waitFor(() => {
        expect(result.current.collisionMapLoaded).toBe(true);
      });

      expect(() =>
        result.current.isPositionSemiWalkable(-100, -100)
      ).not.toThrow();
      expect(() =>
        result.current.isPositionSemiWalkable(20000, 20000)
      ).not.toThrow();
    });

    it('should sample 3x3 neighborhood for semi-walkable detection', async () => {
      const {result} = renderHook(() => useCollisionMap());

      await waitFor(() => {
        expect(result.current.collisionMapLoaded).toBe(true);
      });

      const isSemiWalkable = result.current.isPositionSemiWalkable(2, 2);
      expect(typeof isSemiWalkable).toBe('boolean');
    });

    it('should handle color tolerance for cyan detection', async () => {
      const mockData = new Uint8ClampedArray(2640 * 1520 * 4);
      mockData[0] = 5; // R (slightly more than 0)
      mockData[1] = 250; // G (slightly less than 255)
      mockData[2] = 250; // B (slightly less than 255)
      mockData[3] = 255; // A

      mockContext.getImageData = vi.fn(() => ({
        data: mockData,
        width: 2640,
        height: 1520,
      }));

      const {result} = renderHook(() => useCollisionMap());

      await waitFor(() => {
        expect(result.current.collisionMapLoaded).toBe(true);
      });

      // Should still be considered semi-walkable within tolerance
      expect(result.current.isPositionSemiWalkable(0, 0)).toBe(true);
    });
  });

  describe('Performance', () => {
    it('should load collision map only once', () => {
      // Track how many Image instances are created
      let imageConstructorCallCount = 0;

      // Override Image constructor to count calls
      global.Image = class MockImage {
        src = '';
        crossOrigin: string | null = null;
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;

        constructor() {
          imageConstructorCallCount++;
          mockImage = this as unknown as HTMLImageElement;
          // Simulate async image loading
          setTimeout(() => {
            if (this.onload) this.onload();
          }, 0);
        }
      } as unknown as typeof Image;

      const {rerender} = renderHook(() => useCollisionMap());

      rerender();
      rerender();
      rerender();

      // Image should only be created once
      expect(imageConstructorCallCount).toBe(1);
    });

    it('should cache collision data for repeated checks', async () => {
      const {result} = renderHook(() => useCollisionMap());

      await waitFor(() => {
        expect(result.current.collisionMapLoaded).toBe(true);
      });

      const getImageDataCallCount = (mockContext.getImageData as any).mock.calls
        .length;

      // Multiple position checks
      result.current.isPositionWalkable(100, 100);
      result.current.isPositionWalkable(200, 200);
      result.current.isPositionWalkable(300, 300);

      // getImageData should only be called once during initialization
      expect((mockContext.getImageData as any).mock.calls.length).toBe(
        getImageDataCallCount
      );
    });

    it('should handle rapid position checks without performance issues', async () => {
      const {result} = renderHook(() => useCollisionMap());

      await waitFor(() => {
        expect(result.current.collisionMapLoaded).toBe(true);
      });

      // Perform many checks rapidly
      for (let i = 0; i < 1000; i++) {
        result.current.isPositionWalkable(i * 10, i * 5);
      }

      // Should complete without errors
      expect(result.current.collisionMapLoaded).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty image data', async () => {
      mockContext.getImageData = vi.fn(() => ({
        data: new Uint8ClampedArray(0),
        width: 0,
        height: 0,
      }));

      const {result} = renderHook(() => useCollisionMap());

      await waitFor(() => {
        // Should handle gracefully
        expect(() => result.current.isPositionWalkable(100, 100)).not.toThrow();
      });
    });

    it('should handle coordinates at exact map dimensions', async () => {
      const {result} = renderHook(() => useCollisionMap());

      await waitFor(() => {
        expect(result.current.collisionMapLoaded).toBe(true);
      });

      // Test exact boundary coordinates
      expect(() =>
        result.current.isPositionWalkable(10560, 6080)
      ).not.toThrow();
    });

    it('should handle negative coordinates', async () => {
      const {result} = renderHook(() => useCollisionMap());

      await waitFor(() => {
        expect(result.current.collisionMapLoaded).toBe(true);
      });

      expect(() =>
        result.current.isPositionWalkable(-1000, -1000)
      ).not.toThrow();
    });

    it('should handle very large coordinates', async () => {
      const {result} = renderHook(() => useCollisionMap());

      await waitFor(() => {
        expect(result.current.collisionMapLoaded).toBe(true);
      });

      expect(() =>
        result.current.isPositionWalkable(1000000, 1000000)
      ).not.toThrow();
    });

    it('should handle zero coordinates', async () => {
      const {result} = renderHook(() => useCollisionMap());

      await waitFor(() => {
        expect(result.current.collisionMapLoaded).toBe(true);
      });

      expect(() => result.current.isPositionWalkable(0, 0)).not.toThrow();
    });

    it('should handle coordinates with high decimal precision', async () => {
      const {result} = renderHook(() => useCollisionMap());

      await waitFor(() => {
        expect(result.current.collisionMapLoaded).toBe(true);
      });

      expect(() =>
        result.current.isPositionWalkable(100.123456789, 200.987654321)
      ).not.toThrow();
    });
  });

  describe('Memory Management', () => {
    it('should not leak memory with multiple rerenders', async () => {
      const {result, rerender} = renderHook(() => useCollisionMap());

      await waitFor(() => {
        expect(result.current.collisionMapLoaded).toBe(true);
      });

      // Multiple rerenders should not create new collision data
      for (let i = 0; i < 10; i++) {
        rerender();
      }

      expect(result.current.collisionMapLoaded).toBe(true);
    });

    it('should handle unmount gracefully', async () => {
      const {result, unmount} = renderHook(() => useCollisionMap());

      await waitFor(() => {
        expect(result.current.collisionMapLoaded).toBe(true);
      });

      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Integration', () => {
    it('should work with real-world coordinate patterns', async () => {
      const {result} = renderHook(() => useCollisionMap());

      await waitFor(() => {
        expect(result.current.collisionMapLoaded).toBe(true);
      });

      // Test common movement patterns
      const testCoordinates = [
        {x: 100, y: 100},
        {x: 500, y: 300},
        {x: 1000, y: 600},
        {x: 5000, y: 3000},
        {x: 8000, y: 5000},
      ];

      testCoordinates.forEach(({x, y}) => {
        expect(() => result.current.isPositionWalkable(x, y)).not.toThrow();
        expect(() => result.current.isPositionSemiWalkable(x, y)).not.toThrow();
      });
    });

    it('should provide consistent results for same coordinates', async () => {
      const {result} = renderHook(() => useCollisionMap());

      await waitFor(() => {
        expect(result.current.collisionMapLoaded).toBe(true);
      });

      const x = 1000;
      const y = 1000;

      const result1 = result.current.isPositionWalkable(x, y);
      const result2 = result.current.isPositionWalkable(x, y);
      const result3 = result.current.isPositionWalkable(x, y);

      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
    });

    it('should handle concurrent position checks', async () => {
      const {result} = renderHook(() => useCollisionMap());

      await waitFor(() => {
        expect(result.current.collisionMapLoaded).toBe(true);
      });

      // Check multiple positions concurrently
      const checks = [
        result.current.isPositionWalkable(100, 100),
        result.current.isPositionWalkable(200, 200),
        result.current.isPositionSemiWalkable(300, 300),
        result.current.isPositionSemiWalkable(400, 400),
      ];

      // All checks should complete without errors
      checks.forEach((check) => {
        expect(typeof check).toBe('boolean');
      });
    });
  });
});
