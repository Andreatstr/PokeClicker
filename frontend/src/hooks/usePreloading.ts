import {useEffect} from 'react';
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
        console.warn('Failed to initialize preloading:', error);
      }
    };

    initializePreloading();
  }, [currentPage]);
}
