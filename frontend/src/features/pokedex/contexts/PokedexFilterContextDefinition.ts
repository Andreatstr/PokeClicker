import {createContext} from 'react';

/**
 * Context for Pokedex filter state
 * Reduces prop drilling by providing filter state and handlers to all filter components
 */

export interface PokedexFilterContextValue {
  // Search state
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  debouncedSearchTerm: string;
  handleClearSearch: () => void;

  // Filter state
  selectedRegion: string | null;
  setSelectedRegion: (value: string | null) => void;
  selectedTypes: string[];
  setSelectedTypes: (value: string[]) => void;
  sortBy: 'id' | 'name' | 'type';
  setSortBy: (value: 'id' | 'name' | 'type') => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (value: 'asc' | 'desc') => void;
  selectedOwnedOnly: 'all' | 'owned' | 'unowned';
  setSelectedOwnedOnly: (value: 'all' | 'owned' | 'unowned') => void;
  handleClearFilters: () => void;

  // Pagination state
  paginationPage: number;
  setPaginationPage: (value: number) => void;

  // Mobile filter state
  showMobileFilters: boolean;
  setShowMobileFilters: (value: boolean | ((prev: boolean) => boolean)) => void;
  tempRegion: string | null;
  setTempRegion: (value: string | null) => void;
  tempTypes: string[];
  setTempTypes: (value: string[]) => void;
  tempSortBy: 'id' | 'name' | 'type';
  setTempSortBy: (value: 'id' | 'name' | 'type') => void;
  tempSortOrder: 'asc' | 'desc';
  setTempSortOrder: (value: 'asc' | 'desc') => void;
  tempOwnedOnly: 'all' | 'owned' | 'unowned';
  setTempOwnedOnly: (value: 'all' | 'owned' | 'unowned') => void;
}

export const PokedexFilterContext =
  createContext<PokedexFilterContextValue | null>(null);
