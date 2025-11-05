import {useState, useEffect} from 'react';
import {isTokenExpired} from '@/lib/jwt';

type PageType = 'pokedex' | 'ranks' | 'clicker' | 'map' | 'login' | 'profile';

/**
 * Custom hook for page navigation with localStorage persistence
 * Handles initial page detection based on auth status and restores last visited page
 */
export function usePageNavigation() {
  const [currentPage, setCurrentPage] = useState<PageType>(() => {
    const hasAuth = localStorage.getItem('authToken');

    // Check if token exists and is not expired
    if (!hasAuth || isTokenExpired(hasAuth)) {
      return 'login';
    }

    // If authenticated with valid token, restore last page or default to pokedex
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
