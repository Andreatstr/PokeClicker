import {useEffect} from 'react';
import {logger} from '@/lib/logger';
import {preloadService} from '@/lib/preloadService';

type PageType = 'clicker' | 'ranks' | 'pokedex' | 'map' | 'login' | 'profile';

/**
 * Custom hook for intelligent page-based asset preloading
 *
 * Performance optimizations:
 * - Uses requestIdleCallback to defer preloading until main thread is idle
 * - Prevents preloading from blocking first paint (improves TBT metrics)
 * - Preloads page-specific assets only (reduces unnecessary network requests)
 * - Falls back to setTimeout for browsers without requestIdleCallback
 *
 * @param currentPage - Current active page to preload assets for
 *
 * @example
 * usePreloading(currentPage);
 */
export function usePreloading(currentPage: PageType) {
  useEffect(() => {
    const initializePreloading = async () => {
      try {
        // Preload assets specific to the current page
        switch (currentPage) {
          case 'pokedex':
            await preloadService.preloadForPokedex();
            break;
          case 'ranks':
            await preloadService.preloadForRanks();
            break;
          case 'clicker':
            await preloadService.preloadForClicker();
            break;
          case 'map':
            await preloadService.preloadForMap();
            break;
          default:
            // Preload common assets for other pages
            await preloadService.preloadAll({
              preloadCommonPokemon: true,
              preloadCommonTypes: true,
              preloadGameAssets: true,
              preloadMapAssets: false,
            });
        }
      } catch (error) {
        logger.logError(error, 'PreloadInitialization');
      }
    };

    // Use requestIdleCallback for non-critical preloading to avoid blocking the main thread
    // This prevents preloading from competing with first paint and improves TBT (Total Blocking Time)
    const ric = (
      window as Window & {
        requestIdleCallback?: (cb: () => void) => number;
      }
    ).requestIdleCallback;

    if (typeof ric === 'function') {
      ric(() => {
        initializePreloading();
      });
    } else {
      // Fallback to setTimeout for browsers without requestIdleCallback support
      setTimeout(() => {
        initializePreloading();
      }, 0);
    }
  }, [currentPage]);
}
