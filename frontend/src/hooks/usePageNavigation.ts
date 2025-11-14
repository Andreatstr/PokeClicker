import {useState, useEffect} from 'react';
import {isTokenExpired} from '@/lib/jwt';

type PageType = 'pokedex' | 'ranks' | 'clicker' | 'map' | 'login' | 'profile';

/**
 * Custom hook for page navigation with localStorage persistence and authentication checks
 *
 * Features:
 * - Validates authentication token on initial load
 * - Restores last visited page for authenticated users
 * - Automatically redirects to login for expired or missing tokens
 * - Persists current page across sessions (except login page)
 *
 * @returns Object with currentPage state and setCurrentPage setter
 *
 * @example
 * const { currentPage, setCurrentPage } = usePageNavigation();
 * setCurrentPage('pokedex');
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

  // Save current page to localStorage (except login to avoid restoring login page on next visit)
  useEffect(() => {
    if (currentPage !== 'login') {
      localStorage.setItem('currentPage', currentPage);
    }
  }, [currentPage]);

  return {currentPage, setCurrentPage};
}
