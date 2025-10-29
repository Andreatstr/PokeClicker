import {createContext, useContext} from 'react';
import type {ReactNode} from 'react';

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
  selectedOwnedOnly: boolean;
  setSelectedOwnedOnly: (value: boolean) => void;
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
  tempOwnedOnly: boolean;
  setTempOwnedOnly: (value: boolean) => void;
}

const PokedexFilterContext = createContext<PokedexFilterContextValue | null>(
  null
);

interface PokedexFilterProviderProps {
  value: PokedexFilterContextValue;
  children: ReactNode;
}

export function PokedexFilterProvider({
  value,
  children,
}: PokedexFilterProviderProps) {
  return (
    <PokedexFilterContext.Provider value={value}>
      {children}
    </PokedexFilterContext.Provider>
  );
}

export function usePokedexFilterContext() {
  const context = useContext(PokedexFilterContext);
  if (!context) {
    throw new Error(
      'usePokedexFilterContext must be used within PokedexFilterProvider'
    );
  }
  return context;
}
