import {useEffect} from 'react';
import {logger} from '@/lib/logger';
import {preloadService} from '@/lib/preloadService';

type PageType = 'clicker' | 'pokedex' | 'map' | 'login' | 'profile';

/**
 * Custom hook for preloading assets based on current page
 */
export function usePreloading(currentPage: PageType) {
  useEffect(() => {
    const initializePreloading = async () => {
      try {
        switch (currentPage) {
          case 'pokedex':
            await preloadService.preloadForPokedex();
            break;
          case 'clicker':
            await preloadService.preloadForClicker();
            break;
          case 'map':
            await preloadService.preloadForMap();
            break;
          default:
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
    // This prevents preloading from competing with first paint and improves TBT
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
      // Fallback to setTimeout if requestIdleCallback is not available
      setTimeout(() => {
        initializePreloading();
      }, 0);
    }
  }, [currentPage]);
}
