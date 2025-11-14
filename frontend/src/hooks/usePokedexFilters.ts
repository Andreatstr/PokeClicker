import {useState, useEffect} from 'react';
import type {PokedexFilterContextValue} from '@features/pokedex/contexts/PokedexFilterContextDefinition';

/**
 * Custom hook for managing Pokedex filter state
 * Handles both desktop and mobile (temporary) filter states
 * Returns a context value object for use with PokedexFilterContext
 */
export function usePokedexFilters(): PokedexFilterContextValue {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'id' | 'name' | 'type' | 'price'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedOwnedOnly, setSelectedOwnedOnly] = useState<
    'all' | 'owned' | 'unowned'
  >('all');
  const [paginationPage, setPaginationPage] = useState(1);

  // Mobile temporary filter states
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [tempRegion, setTempRegion] = useState(selectedRegion);
  const [tempTypes, setTempTypes] = useState(selectedTypes);
  const [tempSortBy, setTempSortBy] = useState(sortBy);
  const [tempSortOrder, setTempSortOrder] = useState(sortOrder);
  const [tempOwnedOnly, setTempOwnedOnly] = useState<
    'all' | 'owned' | 'unowned'
  >('all');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPaginationPage(1);
  }, [selectedRegion, selectedTypes, debouncedSearchTerm, sortBy, sortOrder]);

  const handleClearFilters = () => {
    setSelectedRegion(null);
    setSelectedTypes([]);
    setSortBy('id');
    setSortOrder('asc');
    setSelectedOwnedOnly('all');
    setTempOwnedOnly('all');
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  return {
    // Search state
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    handleClearSearch,

    // Filter state
    selectedRegion,
    setSelectedRegion,
    selectedTypes,
    setSelectedTypes,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    selectedOwnedOnly,
    setSelectedOwnedOnly,
    handleClearFilters,

    // Pagination state
    paginationPage,
    setPaginationPage,

    // Mobile filter state
    showMobileFilters,
    setShowMobileFilters,
    tempRegion,
    setTempRegion,
    tempTypes,
    setTempTypes,
    tempSortBy,
    setTempSortBy,
    tempSortOrder,
    setTempSortOrder,
    tempOwnedOnly,
    setTempOwnedOnly,
  };
}
