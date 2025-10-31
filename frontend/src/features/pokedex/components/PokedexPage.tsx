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

// Lazy load the heavy Pokedex components
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
      window.scrollTo({top: 0, behavior: 'smooth'});
    },
    [setPaginationPage]
  );

  const {loading, error, data} = usePokedexQuery({
    search: debouncedSearchTerm || undefined,
    generation: selectedRegion || undefined,
    types: selectedTypes.length > 0 ? selectedTypes : undefined,
    sortBy,
    sortOrder,
    limit: ITEMS_PER_PAGE,
    offset: (paginationPage - 1) * ITEMS_PER_PAGE,
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
  const totalPokemon = data?.pokedex.total || 0;

  // Apply frontend filtering for "unowned" option
  const displayedPokemon =
    selectedOwnedOnly === 'unowned'
      ? filteredPokemon.filter(
          (pokemon) => !user?.owned_pokemon_ids.includes(pokemon.id)
        )
      : filteredPokemon;
  const totalPages = Math.ceil(totalPokemon / ITEMS_PER_PAGE);

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="pixel-font text-xl text-red-600">Error loading Pokémon</p>
        <p
          className="pixel-font text-sm"
          style={{color: 'var(--muted-foreground)'}}
        >
          {error.message}
        </p>
      </div>
    );
  }

  return (
    <PokedexFilterProvider value={filterState}>
      {/* Search Bar */}
      <Suspense
        fallback={
          <LoadingSpinner message="Loading search..." isDarkMode={isDarkMode} />
        }
      >
        <SearchBar isDarkMode={isDarkMode} />
      </Suspense>

      {/* Filters and Count */}
      <Suspense
        fallback={
          <LoadingSpinner
            message="Loading filters..."
            isDarkMode={isDarkMode}
          />
        }
      >
        <FiltersAndCount
          loading={loading}
          displayedPokemon={displayedPokemon}
          totalPokemon={totalPokemon}
          isMobile={isMobile}
          ownedPokemonIds={user?.owned_pokemon_ids ?? []}
          facets={cachedFacets ?? null}
        />
      </Suspense>

      {/* Pokemon Grid */}
      <section className="max-w-[2000px] mx-auto">
        <Suspense
          fallback={
            <LoadingSpinner
              message="Loading Pokemon..."
              isDarkMode={isDarkMode}
            />
          }
        >
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
        </Suspense>
      </section>
    </PokedexFilterProvider>
  );
}
