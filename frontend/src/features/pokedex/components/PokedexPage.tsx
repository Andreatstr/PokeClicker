import {useState, useEffect, Suspense, lazy} from 'react';
import {useAuth} from '@features/auth';
import {usePokedexQuery, type PokedexPokemon} from '@features/pokedex';
import {usePokedexFilters} from '@/hooks';
import {LoadingSpinner} from '@/components/LoadingSpinner';
import {PaginationControls} from '@/components/PaginationControls';
import {ArrowLeftIcon, ArrowRightIcon} from '@ui/pixelact';

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

interface PokedexPageProps {
  isDarkMode: boolean;
  onPokemonClick: (pokemon: PokedexPokemon) => void;
}

export function PokedexPage({isDarkMode, onPokemonClick}: PokedexPageProps) {
  const {user} = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const {
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
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
    paginationPage,
    setPaginationPage,
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
    handleClearFilters,
    handleClearSearch,
  } = usePokedexFilters();

  const ITEMS_PER_PAGE = 20;

  const {loading, error, data} = usePokedexQuery({
    search: debouncedSearchTerm || undefined,
    generation: selectedRegion || undefined,
    type: selectedTypes.length === 1 ? selectedTypes[0] : undefined,
    sortBy,
    sortOrder,
    limit: ITEMS_PER_PAGE,
    offset: (paginationPage - 1) * ITEMS_PER_PAGE,
    ownedOnly: selectedOwnedOnly,
  });

  // Detect mobile
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setShowMobileFilters(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setShowMobileFilters]);

  const filteredPokemon = data?.pokedex.pokemon || [];
  const totalPokemon = data?.pokedex.total || 0;

  const handlePageChange = (page: number) => {
    setPaginationPage(page);
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  const displayedPokemon = filteredPokemon;
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
    <>
      {/* Search Bar */}
      <Suspense
        fallback={
          <LoadingSpinner message="Loading search..." isDarkMode={isDarkMode} />
        }
      >
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          handleClearSearch={handleClearSearch}
          isMobile={isMobile}
          showMobileFilters={showMobileFilters}
          setShowMobileFilters={setShowMobileFilters}
          isDarkMode={isDarkMode}
        />
      </Suspense>

      {/* Filters and Count */}
      <Suspense
        fallback={
          <LoadingSpinner message="Loading filters..." isDarkMode={isDarkMode} />
        }
      >
        <FiltersAndCount
          loading={loading}
          displayedPokemon={displayedPokemon}
          totalPokemon={totalPokemon}
          selectedTypes={selectedTypes}
          selectedRegion={selectedRegion}
          sortBy={sortBy}
          sortOrder={sortOrder}
          isMobile={isMobile}
          showMobileFilters={showMobileFilters}
          tempRegion={tempRegion}
          tempTypes={tempTypes}
          tempSortBy={tempSortBy}
          tempSortOrder={tempSortOrder}
          selectedOwnedOnly={selectedOwnedOnly}
          tempOwnedOnly={tempOwnedOnly}
          setSelectedRegion={setSelectedRegion}
          setSelectedTypes={setSelectedTypes}
          setSortBy={setSortBy}
          setSortOrder={setSortOrder}
          setShowMobileFilters={setShowMobileFilters}
          setTempRegion={setTempRegion}
          setTempTypes={setTempTypes}
          setTempSortBy={setTempSortBy}
          setTempSortOrder={setTempSortOrder}
          setSelectedOwnedOnly={setSelectedOwnedOnly}
          setTempOwnedOnly={setTempOwnedOnly}
          handleClearFilters={handleClearFilters}
          ownedPokemonIds={user?.owned_pokemon_ids ?? []}
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
            displayedPokemon={
              selectedOwnedOnly
                ? displayedPokemon.filter((p) => p.isOwned)
                : displayedPokemon
            }
            handlePokemonClick={onPokemonClick}
            isDarkMode={isDarkMode}
            ITEMS_PER_PAGE={ITEMS_PER_PAGE}
            paginationPage={paginationPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            loading={loading}
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
  paginationPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading: boolean;
}

function PokemonGrid({
  displayedPokemon,
  handlePokemonClick,
  isDarkMode,
  ITEMS_PER_PAGE,
  paginationPage,
  totalPages,
  onPageChange,
  loading,
}: PokemonGridProps) {
  const [selectedMobilePokemon, setSelectedMobilePokemon] =
    useState<PokedexPokemon | null>(null);
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

  // Set first Pokemon as selected on mobile by default
  useEffect(() => {
    if (isMobileView && displayedPokemon.length > 0 && !selectedMobilePokemon) {
      setSelectedMobilePokemon(displayedPokemon[0]);
    }
    if (isMobileView && selectedMobilePokemon && displayedPokemon.length > 0) {
      const stillExists = displayedPokemon.some(
        (p) => p.id === selectedMobilePokemon.id
      );
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
                <div className="absolute left-2 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
                  <ArrowLeftIcon size={32} className="animate-pulse" />
                </div>
                <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white dark:from-gray-900 to-transparent pointer-events-none z-10 border-l-4 border-black"></div>

                <div className="absolute right-2 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
                  <ArrowRightIcon size={32} className="animate-pulse" />
                </div>
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
                          alt={
                            pokemon.isOwned ? pokemon.name : 'Unknown Pokémon'
                          }
                          className="w-16 h-16 pixelated"
                          style={{
                            imageRendering: 'pixelated',
                            filter: pokemon.isOwned ? 'none' : 'brightness(0)',
                          }}
                        />
                        <p className="text-[10px] font-bold text-center">
                          No. {pokemon.pokedexNumber}
                        </p>
                        <p className="text-xs font-bold capitalize text-center truncate w-full px-1">
                          {pokemon.isOwned ? pokemon.name : '???'}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Mobile Pagination Controls */}
              <PaginationControls
                currentPage={paginationPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
                loading={loading}
                isMobile={true}
              />
            </div>
          ) : (
            /* Desktop: Grid View */
            <>
              <ul
                className="grid gap-4 md:gap-6 list-none p-0 m-0"
                style={{
                  gridTemplateColumns:
                    'repeat(auto-fill, minmax(280px, 280px))',
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

              {/* Desktop Pagination Controls */}
              <PaginationControls
                currentPage={paginationPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
                loading={loading}
                isMobile={false}
              />
            </>
          )}
        </>
      )}
    </>
  );
}
