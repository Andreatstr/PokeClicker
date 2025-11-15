import {createContext} from 'react';

/**
 * Pokedex filter context value shape
 *
 * @remarks
 * Reduces prop drilling by providing filter state and handlers to all filter components.
 *
 * Mobile filter strategy:
 * - Desktop: filters apply immediately
 * - Mobile: uses temporary values until "Apply" is clicked
 * - Allows users to experiment with filters before committing changes
 */
export interface PokedexFilterContextValue {
  // Search state with debouncing to reduce unnecessary re-renders
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  debouncedSearchTerm: string;
  handleClearSearch: () => void;

  // Active filter state (applied to Pokemon list)
  selectedRegion: string | null;
  setSelectedRegion: (value: string | null) => void;
  selectedTypes: string[];
  setSelectedTypes: (value: string[]) => void;
  sortBy: 'id' | 'name' | 'type' | 'price' | 'stats';
  setSortBy: (value: 'id' | 'name' | 'type' | 'price' | 'stats') => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (value: 'asc' | 'desc') => void;
  selectedOwnedOnly: 'all' | 'owned' | 'unowned';
  setSelectedOwnedOnly: (value: 'all' | 'owned' | 'unowned') => void;
  handleClearFilters: () => void;

  // Pagination state
  paginationPage: number;
  setPaginationPage: (value: number) => void;

  // Mobile filter modal state with temporary values
  // Temporary values allow preview without applying changes until user clicks "Apply"
  showMobileFilters: boolean;
  setShowMobileFilters: (value: boolean | ((prev: boolean) => boolean)) => void;
  tempRegion: string | null;
  setTempRegion: (value: string | null) => void;
  tempTypes: string[];
  setTempTypes: (value: string[]) => void;
  tempSortBy: 'id' | 'name' | 'type' | 'price' | 'stats';
  setTempSortBy: (value: 'id' | 'name' | 'type' | 'price' | 'stats') => void;
  tempSortOrder: 'asc' | 'desc';
  setTempSortOrder: (value: 'asc' | 'desc') => void;
  tempOwnedOnly: 'all' | 'owned' | 'unowned';
  setTempOwnedOnly: (value: 'all' | 'owned' | 'unowned') => void;
}

/**
 * Context for Pokedex filtering, sorting, and pagination state
 *
 * @remarks
 * Do not consume directly - use the usePokedexFilterContext hook instead
 */
export const PokedexFilterContext =
  createContext<PokedexFilterContextValue | null>(null);
