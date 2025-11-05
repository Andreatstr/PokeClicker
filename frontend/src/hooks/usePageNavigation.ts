import {useState, useEffect} from 'react';

type PageType = 'pokedex' | 'ranks' | 'clicker' | 'map' | 'login' | 'profile';

/**
 * Custom hook for page navigation with localStorage persistence
 * Handles initial page detection based on auth status and restores last visited page
 */
export function usePageNavigation() {
  const [currentPage, setCurrentPage] = useState<PageType>(() => {
    const hasAuth = localStorage.getItem('authToken');
    if (!hasAuth) return 'login';

    // If authenticated, restore last page or default to pokedex
    const savedPage = localStorage.getItem('currentPage') as
      | 'pokedex'
      | 'ranks'
      | 'clicker'
      | 'profile'
      | null;
    return savedPage || 'pokedex';
  });

  // Save current page to localStorage
  useEffect(() => {
    if (currentPage !== 'login') {
      localStorage.setItem('currentPage', currentPage);
    }
  }, [currentPage]);

  return {currentPage, setCurrentPage};
}
