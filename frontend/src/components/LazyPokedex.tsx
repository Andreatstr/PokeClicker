import {Suspense, lazy, useState, useEffect} from 'react';
import {LoadingSpinner} from './LoadingSpinner';
import {type PokedexPokemon} from '@features/pokedex';

// Lazy load the heavy Pokedex components
const SearchBar = lazy(() =>
  import('@features/pokedex').then((module) => ({default: module.SearchBar}))
);
const FiltersAndCount = lazy(() =>
  import('@features/pokedex').then((module) => ({
    default: module.FiltersAndCount,
  }))
);
const PokemonCard = lazy(() =>
  import('@features/pokedex').then((module) => ({default: module.PokemonCard}))
);

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
      <Suspense
        fallback={
          <LoadingSpinner
            message="Loading search..."
            isDarkMode={props.isDarkMode}
          />
        }
      >
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
      <Suspense
        fallback={
          <LoadingSpinner
            message="Loading filters..."
            isDarkMode={props.isDarkMode}
          />
        }
      >
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
        <Suspense
          fallback={
            <LoadingSpinner
              message="Loading Pokemon..."
              isDarkMode={props.isDarkMode}
            />
          }
        >
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

function PokemonGrid({
  displayedPokemon,
  handlePokemonClick,
  isDarkMode,
  ITEMS_PER_PAGE,
  hasMore,
  handleLoadMore,
  loading,
}: PokemonGridProps) {
  const [selectedMobilePokemon, setSelectedMobilePokemon] = useState<PokedexPokemon | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);

  // Detect mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Set first Pokemon as selected on mobile by default (only when no selection exists)
  useEffect(() => {
    if (isMobileView && displayedPokemon.length > 0 && !selectedMobilePokemon) {
      setSelectedMobilePokemon(displayedPokemon[0]);
    }
    // If selected Pokemon is no longer in the list (e.g., after filtering), reset to first
    if (isMobileView && selectedMobilePokemon && displayedPokemon.length > 0) {
      const stillExists = displayedPokemon.some(p => p.id === selectedMobilePokemon.id);
      if (!stillExists) {
        setSelectedMobilePokemon(displayedPokemon[0]);
      }
    }
  }, [isMobileView, displayedPokemon, selectedMobilePokemon]);

  return (
    <>
      {displayedPokemon.length === 0 && !loading ? (
        <div className="text-center py-16">
          <p className="pixel-font text-xl">No Pokemon found</p>
          <p
            className="pixel-font text-sm"
            style={{color: 'var(--muted-foreground)'}}
          >
            Try a different search term
          </p>
        </div>
      ) : (
        <>
          {/* Mobile: Card on Top + List Below */}
          {isMobileView ? (
            <div className="flex flex-col gap-4">
              {/* Top: Selected Pokemon Card */}
              <div className="w-full flex justify-center">
                {selectedMobilePokemon && (
                  <Suspense
                    fallback={
                      <LoadingSpinner
                        message="Loading Pokemon..."
                        isDarkMode={isDarkMode}
                      />
                    }
                  >
                    <PokemonCard
                      pokemon={selectedMobilePokemon}
                      onClick={handlePokemonClick}
                      isDarkMode={isDarkMode}
                    />
                  </Suspense>
                )}
              </div>

              {/* Bottom: Horizontal Scrollable Pokemon List */}
              <div className="w-full relative">
                {/* Left Scroll Hint - shown when scrolled right */}
                <div className="absolute left-2 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
                  <div className="animate-pulse text-4xl font-bold">←</div>
                </div>
                {/* Gradient fade on left edge */}
                <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white dark:from-gray-900 to-transparent pointer-events-none z-10 border-l-4 border-black"></div>

                {/* Right Scroll Hint - shown when more content to the right */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
                  <div className="animate-pulse text-4xl font-bold">→</div>
                </div>
                {/* Gradient fade on right edge to indicate more content */}
                <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white dark:from-gray-900 to-transparent pointer-events-none z-10 border-r-4 border-black"></div>

                <div className="overflow-x-auto border-4 border-black bg-white dark:bg-gray-900 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                  <ul className="flex list-none p-0 m-0">
                    {displayedPokemon.map((pokemon) => (
                      <li
                        key={pokemon.id}
                        onClick={() => setSelectedMobilePokemon(pokemon)}
                        className={`flex-shrink-0 flex flex-col items-center gap-1 p-2 border-r-2 border-black cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                          selectedMobilePokemon?.id === pokemon.id
                            ? 'bg-blue-100 dark:bg-blue-900'
                            : ''
                        }`}
                        style={{minWidth: '100px'}}
                      >
                        <img
                          src={pokemon.sprite}
                          alt={pokemon.name}
                          className="w-16 h-16 pixelated"
                          style={{imageRendering: 'pixelated'}}
                        />
                        <p className="text-[10px] font-bold text-center">
                          No. {pokemon.pokedexNumber}
                        </p>
                        <p className="text-xs font-bold capitalize text-center truncate w-full px-1">
                          {pokemon.isOwned ? pokemon.name : '???'}
                        </p>
                      </li>
                    ))}
                    {hasMore && (
                      <li className="flex-shrink-0 flex items-center justify-center p-4" style={{minWidth: '100px'}}>
                        <button
                          className="text-xs py-2 px-4 whitespace-nowrap"
                          onClick={handleLoadMore}
                          disabled={loading}
                        >
                          {loading ? '...' : 'More'}
                        </button>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            /* Desktop: Grid View */
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
      )}
    </>
  );
}
