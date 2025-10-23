import { Suspense, lazy } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { type PokedexPokemon } from '@features/pokedex';

// Lazy load the heavy Pokedex components
const SearchBar = lazy(() => import('@features/pokedex').then(module => ({ default: module.SearchBar })));
const FiltersAndCount = lazy(() => import('@features/pokedex').then(module => ({ default: module.FiltersAndCount })));
const PokemonCard = lazy(() => import('@features/pokedex').then(module => ({ default: module.PokemonCard })));

interface LazyPokedexProps {
  // SearchBar props
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  handleClearSearch: () => void;
  isMobile: boolean;
  showMobileFilters: boolean;
  setShowMobileFilters: (value: boolean | ((prev: boolean) => boolean)) => void;
  isDarkMode: boolean;

  // FiltersAndCount props
  loading: boolean;
  displayedPokemon: PokedexPokemon[];
  totalPokemon: number;
  selectedTypes: string[];
  selectedRegion: string | null;
  sortBy: 'id' | 'name' | 'type';
  sortOrder: 'asc' | 'desc';
  tempRegion: string | null;
  tempTypes: string[];
  tempSortBy: 'id' | 'name' | 'type';
  tempSortOrder: 'asc' | 'desc';
  setSelectedRegion: (value: string | null) => void;
  setSelectedTypes: (value: string[]) => void;
  setSortBy: (value: 'id' | 'name' | 'type') => void;
  setSortOrder: (value: 'asc' | 'desc') => void;
  setTempRegion: (value: string | null) => void;
  setTempTypes: (value: string[]) => void;
  setTempSortBy: (value: 'id' | 'name' | 'type') => void;
  setTempSortOrder: (value: 'asc' | 'desc') => void;
  handleClearFilters: () => void;

  // PokemonCard props
  handlePokemonClick: (pokemon: PokedexPokemon) => void;
  displayedCount: number;
  ITEMS_PER_PAGE: number;
  hasMore: boolean;
  handleLoadMore: () => void;
}

export function LazyPokedex(props: LazyPokedexProps) {
  return (
    <>
      {/* Search Bar */}
      <Suspense fallback={<LoadingSpinner message="Loading search..." isDarkMode={props.isDarkMode} />}>
        <SearchBar
          searchTerm={props.searchTerm}
          setSearchTerm={props.setSearchTerm}
          handleClearSearch={props.handleClearSearch}
          isMobile={props.isMobile}
          showMobileFilters={props.showMobileFilters}
          setShowMobileFilters={props.setShowMobileFilters}
          isDarkMode={props.isDarkMode}
        />
      </Suspense>

      {/* Filters and Count */}
      <Suspense fallback={<LoadingSpinner message="Loading filters..." isDarkMode={props.isDarkMode} />}>
        <FiltersAndCount
          loading={props.loading}
          displayedPokemon={props.displayedPokemon}
          totalPokemon={props.totalPokemon}
          selectedTypes={props.selectedTypes}
          selectedRegion={props.selectedRegion}
          sortBy={props.sortBy}
          sortOrder={props.sortOrder}
          isMobile={props.isMobile}
          showMobileFilters={props.showMobileFilters}
          tempRegion={props.tempRegion}
          tempTypes={props.tempTypes}
          tempSortBy={props.tempSortBy}
          tempSortOrder={props.tempSortOrder}
          setSelectedRegion={props.setSelectedRegion}
          setSelectedTypes={props.setSelectedTypes}
          setSortBy={props.setSortBy}
          setSortOrder={props.setSortOrder}
          setShowMobileFilters={props.setShowMobileFilters}
          setTempRegion={props.setTempRegion}
          setTempTypes={props.setTempTypes}
          setTempSortBy={props.setTempSortBy}
          setTempSortOrder={props.setTempSortOrder}
          handleClearFilters={props.handleClearFilters}
        />
      </Suspense>

      {/* Pokemon Grid */}
      <section className="max-w-[2000px] mx-auto">
        <Suspense fallback={<LoadingSpinner message="Loading Pokemon..." isDarkMode={props.isDarkMode} />}>
          <PokemonGrid
            displayedPokemon={props.displayedPokemon}
            handlePokemonClick={props.handlePokemonClick}
            isDarkMode={props.isDarkMode}
            ITEMS_PER_PAGE={props.ITEMS_PER_PAGE}
            hasMore={props.hasMore}
            handleLoadMore={props.handleLoadMore}
            loading={props.loading}
          />
        </Suspense>
      </section>
    </>
  );
}

interface PokemonGridProps {
  displayedPokemon: PokedexPokemon[];
  handlePokemonClick: (pokemon: PokedexPokemon) => void;
  isDarkMode: boolean;
  ITEMS_PER_PAGE: number;
  hasMore: boolean;
  handleLoadMore: () => void;
  loading: boolean;
}

function PokemonGrid({ displayedPokemon, handlePokemonClick, isDarkMode, ITEMS_PER_PAGE, hasMore, handleLoadMore, loading }: PokemonGridProps) {
  return (
    <>
      {displayedPokemon.length === 0 && !loading ? (
        <div className="text-center py-16">
          <p className="pixel-font text-xl">No Pokemon found</p>
          <p className="pixel-font text-sm" style={{color: 'var(--muted-foreground)'}}>
            Try a different search term
          </p>
        </div>
      ) : (
        <>
          <ul
            className="grid gap-4 md:gap-6 list-none p-0 m-0"
            style={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 280px))',
              justifyContent: 'center',
            }}
          >
            {displayedPokemon.map((pokemon, index) => (
              <li
                key={pokemon.id}
                className="animate-fade-in"
                style={{
                  animationDelay: `${(index % ITEMS_PER_PAGE) * 50}ms`,
                }}
              >
                <PokemonCard
                  pokemon={pokemon}
                  onClick={handlePokemonClick}
                  isDarkMode={isDarkMode}
                />
              </li>
            ))}
          </ul>

          {/* Load More Button */}
          {hasMore && (
            <footer className="flex flex-col items-center gap-4 mt-8">
              <button
                className="min-w-[200px]"
                onClick={handleLoadMore}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load more'}
              </button>
            </footer>
          )}
        </>
      )}
    </>
  );
}
