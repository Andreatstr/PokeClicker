/**
 * Main Pokedex page component with browsing and filtering.
 *
 * Features:
 * - Search Pokemon by name
 * - Filter by region, type, owned status
 * - Sort by ID, name, or type
 * - Pagination (20 items per page)
 * - Lazy-loaded filter UI for performance
 * - Click Pokemon to view details/purchase/upgrade
 *
 * State management:
 * - usePokedexFilters: centralized filter state
 * - usePokedexQuery: GraphQL data fetching with filters
 * - Debounced search (300ms delay)
 * - Auto-scroll to top on page change
 *
 * Performance optimizations:
 * - Lazy load SearchBar and FiltersAndCount
 * - Memoized page change handler
 * - Suspense boundaries for smooth loading
 * - Server-side pagination (except unowned filter)
 *
 * Special handling:
 * - "Unowned" filter fetches all Pokemon then filters client-side
 *   (necessary because backend paginates before applying ownership filter)
 */
import {useEffect, Suspense, lazy, useCallback, useState} from 'react';
import {useAuth} from '@features/auth';
import {
  usePokedexQuery,
  type PokedexPokemon,
  PokedexFilterProvider,
} from '@features/pokedex';
import {usePokedexFilters, useMobileDetection} from '@/hooks';
import {LoadingSpinner} from '@/components/LoadingSpinner';
import {PokemonGrid} from './grid/PokemonGrid';
import {useQuery, gql} from '@apollo/client';

const ME_QUERY = gql`
  query Me {
    me {
      _id
      owned_pokemon_ids
    }
  }
`;

// Lazy load the heavy Pokedex components to reduce initial bundle
const SearchBar = lazy(() =>
  import('@features/pokedex').then((module) => ({default: module.SearchBar}))
);
const FiltersAndCount = lazy(() =>
  import('@features/pokedex').then((module) => ({
    default: module.FiltersAndCount,
  }))
);

interface PokedexPageProps {
  isDarkMode: boolean;
  onPokemonClick: (
    pokemon: PokedexPokemon,
    allDisplayed: PokedexPokemon[]
  ) => void;
}

export function PokedexPage({isDarkMode, onPokemonClick}: PokedexPageProps) {
  const {user} = useAuth();
  const {data: meData} = useQuery(ME_QUERY);

  // Use centralized mobile detection hook
  const isMobile = useMobileDetection(768);

  // Get filter state from custom hook
  const filterState = usePokedexFilters();
  const {
    debouncedSearchTerm,
    selectedRegion,
    selectedTypes,
    sortBy,
    sortOrder,
    selectedOwnedOnly,
    paginationPage,
    setShowMobileFilters,
    setPaginationPage,
  } = filterState;

  const ITEMS_PER_PAGE = 20;

  // Memoize page change handler to prevent unnecessary re-renders
  const handlePageChange = useCallback(
    (page: number) => {
      setPaginationPage(page);
      // Scroll to top immediately for consistent behavior
      window.scrollTo({top: 0, behavior: 'instant'});
    },
    [setPaginationPage]
  );

  // When filtering by "unowned", we need to fetch all Pokemon and filter on frontend
  // Otherwise pagination won't work correctly (backend paginates, then frontend filters)
  const needsFullFetch = selectedOwnedOnly === 'unowned';

  const {loading, error, data} = usePokedexQuery({
    search: debouncedSearchTerm || undefined,
    generation: selectedRegion || undefined,
    types: selectedTypes.length > 0 ? selectedTypes : undefined,
    sortBy,
    sortOrder,
    limit: needsFullFetch ? 10000 : ITEMS_PER_PAGE, // Fetch all if filtering unowned
    offset: needsFullFetch ? 0 : (paginationPage - 1) * ITEMS_PER_PAGE,
    ownedOnly: selectedOwnedOnly === 'owned',
  });

  // Separate query for dynamic filter counts when mobile modal is open
  // Uses temp values so counts update as user changes filters
  const {showMobileFilters, tempRegion, tempTypes} = filterState;

  const {data: tempFacetsData} = usePokedexQuery(
    {
      search: debouncedSearchTerm || undefined,
      generation: tempRegion || undefined,
      types: tempTypes.length > 0 ? tempTypes : undefined,
      sortBy,
      sortOrder,
      limit: 1, // Only need facets, not actual Pokemon data
      offset: 0,
      ownedOnly: false, // Always false to get accurate total counts for facets
    },
    {
      skip: !showMobileFilters, // Only run when modal is open
    }
  );

  // Keep track of last valid facets to prevent flashing during transitions
  // When modal closes, keep using temp facets until main query updates
  const [cachedFacets, setCachedFacets] = useState<
    | {
        byGeneration: Array<{generation: string; count: number}>;
        byType: Array<{type: string; count: number}>;
        isDynamic: boolean;
        ownedCount: number;
        totalCount: number;
      }
    | null
    | undefined
  >(null);

  useEffect(() => {
    // Update cached facets when we have valid data
    if (showMobileFilters && tempFacetsData?.pokedex.facets) {
      setCachedFacets(tempFacetsData.pokedex.facets);
    } else if (!showMobileFilters && data?.pokedex.facets && !loading) {
      // Only update when main query is done loading with new filters
      setCachedFacets(data.pokedex.facets);
    }
  }, [showMobileFilters, tempFacetsData, data, loading]);

  // Close mobile filters when switching to desktop view
  useEffect(() => {
    if (!isMobile) {
      setShowMobileFilters(false);
    }
  }, [isMobile, setShowMobileFilters]);

  const filteredPokemon = data?.pokedex.pokemon || [];

  // Apply frontend filtering for "unowned" option
  const unownedFiltered =
    selectedOwnedOnly === 'unowned'
      ? filteredPokemon.filter(
          (pokemon) => !user?.owned_pokemon_ids.includes(pokemon.id)
        )
      : filteredPokemon;

  // When filtering unowned, we need to paginate on frontend after filtering
  const displayedPokemon = needsFullFetch
    ? unownedFiltered.slice(
        (paginationPage - 1) * ITEMS_PER_PAGE,
        paginationPage * ITEMS_PER_PAGE
      )
    : unownedFiltered;

  // Calculate total based on whether we're doing frontend filtering
  const totalPokemon = needsFullFetch
    ? unownedFiltered.length
    : data?.pokedex.total || 0;
  const totalPages = Math.ceil(totalPokemon / ITEMS_PER_PAGE);

  if (error) {
    return (
      <section className="text-center py-16" role="alert" aria-live="assertive">
        <p className="pixel-font text-xl text-red-600">Error loading Pokémon</p>
        <p
          className="pixel-font text-sm"
          style={{color: 'var(--muted-foreground)'}}
        >
          {error.message}
        </p>
      </section>
    );
  }

  return (
    <PokedexFilterProvider value={filterState}>
      <Suspense
        fallback={
          <LoadingSpinner
            message="Loading Pokédex..."
            isDarkMode={isDarkMode}
          />
        }
      >
        {/* Search Bar */}
        <SearchBar isDarkMode={isDarkMode} />

        {/* Filters and Count */}
        <FiltersAndCount
          loading={loading}
          displayedPokemon={displayedPokemon}
          totalPokemon={totalPokemon}
          isMobile={isMobile}
          ownedPokemonIds={user?.owned_pokemon_ids ?? []}
          facets={cachedFacets ?? null}
          isDarkMode={isDarkMode}
        />

        {/* Pokemon Grid */}
        <section className="max-w-[2000px] mx-auto">
          <PokemonGrid
            displayedPokemon={displayedPokemon}
            handlePokemonClick={onPokemonClick}
            isDarkMode={isDarkMode}
            ITEMS_PER_PAGE={ITEMS_PER_PAGE}
            paginationPage={paginationPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            loading={loading}
            ownedPokemonIds={meData?.me?.owned_pokemon_ids ?? []}
          />
        </section>
      </Suspense>
    </PokedexFilterProvider>
  );
}
