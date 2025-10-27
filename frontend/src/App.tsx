import {useState, useEffect, Suspense, lazy} from 'react';
import {usePokedexQuery, type PokedexPokemon, usePokemonById} from '@features/pokedex';
import {Navbar, LoadingSpinner, LazyPokedex} from '@/components';
import {preloadService} from '@/lib/preloadService';

// Lazy load heavy components
const PokeClicker = lazy(() =>
  import('@features/clicker').then((module) => ({default: module.PokeClicker}))
);
const LoginScreen = lazy(() =>
  import('@features/auth').then((module) => ({default: module.LoginScreen}))
);
const PokemonDetailModal = lazy(() =>
  import('@features/pokedex').then((module) => ({
    default: module.PokemonDetailModal,
  }))
);
const ProfileDashboard = lazy(() =>
  import('@features/profile').then((module) => ({
    default: module.ProfileDashboard,
  }))
);
import {PokemonMap} from '@features/map';
import {BackgroundMusic} from '@components/BackgroundMusic';

function App() {
  const [selectedPokemon, setSelectedPokemon] = useState<PokedexPokemon | null>(
    null
  );
  const [isModalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage first, then system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [currentPage, setCurrentPage] = useState<
    'clicker' | 'pokedex' | 'map' | 'login' | 'profile'
  >(() => {
    const hasAuth = localStorage.getItem('authToken');
    if (!hasAuth) return 'login';

    // If authenticated, restore last page or default to pokedex
    const savedPage = localStorage.getItem('currentPage') as
      | 'clicker'
      | 'pokedex'
      | 'profile'
      | null;
    return savedPage || 'pokedex';
  });
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'id' | 'name' | 'type'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // State for cross-region Pokemon navigation
  const [crossRegionPokemonId, setCrossRegionPokemonId] = useState<number | null>(null);
  const {data: crossRegionData} = usePokemonById(crossRegionPokemonId);

  // Initialize preloading service
  useEffect(() => {
    const initializePreloading = async () => {
      try {
        // Preload based on current page
        switch (currentPage) {
          case 'pokedex':
            await preloadService.preloadForPokedex();
            break;
          case 'clicker':
            await preloadService.preloadForClicker();
            break;
          case 'map':
            await preloadService.preloadForMap();
            break;
          default:
            // Preload common assets for login screen
            await preloadService.preloadAll({
              preloadCommonPokemon: true,
              preloadCommonTypes: true,
              preloadGameAssets: true,
              preloadMapAssets: false,
            });
        }
      } catch (error) {
        console.warn('Failed to initialize preloading:', error);
      }
    };

    initializePreloading();
  }, [currentPage]);

  const [displayedCount, setDisplayedCount] = useState(20);

  const ITEMS_PER_PAGE = 20;

  // Reset displayedCount when filters change
  useEffect(() => {
    setDisplayedCount(ITEMS_PER_PAGE);
  }, [selectedRegion, selectedTypes, debouncedSearchTerm, sortBy, sortOrder]);

  // Mobile
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [tempRegion, setTempRegion] = useState(selectedRegion);
  const [tempTypes, setTempTypes] = useState(selectedTypes);
  const [tempSortBy, setTempSortBy] = useState(sortBy);
  const [tempSortOrder, setTempSortOrder] = useState(sortOrder);

  // Apply initial theme on mount
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Save current page to localStorage
  useEffect(() => {
    if (currentPage !== 'login') {
      localStorage.setItem('currentPage', currentPage);
    }
  }, [currentPage]);

  const {loading, error, data, refetch} = usePokedexQuery({
    search: debouncedSearchTerm || undefined,
    generation: selectedRegion || undefined,
    type: selectedTypes.length === 1 ? selectedTypes[0] : undefined,
    sortBy,
    sortOrder,
    limit: displayedCount,
    offset: 0,
  });

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
  }, []);

  const handlePokemonClick = (pokemon: PokedexPokemon) => {
    setSelectedPokemon(pokemon);
    setModalOpen(true);
  };

  // Update selectedPokemon when cross-region data loads
  useEffect(() => {
    if (crossRegionData?.pokemonById) {
      const crossRegionPokemon: PokedexPokemon = {
        id: crossRegionData.pokemonById.id,
        name: crossRegionData.pokemonById.name,
        types: crossRegionData.pokemonById.types,
        sprite: crossRegionData.pokemonById.sprite,
        stats: crossRegionData.pokemonById.stats,
        evolution: crossRegionData.pokemonById.evolution,
        isOwned: crossRegionData.pokemonById.isOwned,
        pokedexNumber: crossRegionData.pokemonById.pokedexNumber,
      };
      setSelectedPokemon(crossRegionPokemon);
      setCrossRegionPokemonId(null); // Reset after loading
    }
  }, [crossRegionData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredPokemon = data?.pokedex.pokemon || [];
  const totalPokemon = data?.pokedex.total || 0;

  const handleClearFilters = () => {
    setSelectedRegion(null);
    setSelectedTypes([]);
    setSortBy('id');
    setSortOrder('asc');
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);

    // Save to localStorage
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');

    // Apply CSS class to document
    if (newTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLoadMore = () => {
    setDisplayedCount((prev) => prev + ITEMS_PER_PAGE);
  };

  const displayedPokemon = filteredPokemon;
  const hasMore = displayedCount < totalPokemon;

  return (
    <>
      <Navbar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
      />
      {currentPage === 'login' ? (
        <Suspense
          fallback={
            <LoadingSpinner
              message="Loading login..."
              isDarkMode={isDarkMode}
            />
          }
        >
          <LoginScreen onNavigate={setCurrentPage} />
        </Suspense>
      ) : (
        <>
          <main
            className="min-h-screen px-4 sm:px-6 md:px-8 pb-8 pt-0"
            style={{backgroundColor: 'var(--background)'}}
          >
            {currentPage === 'clicker' ? (
              <section className="py-8">
                <Suspense
                  fallback={
                    <LoadingSpinner
                      message="Loading clicker game..."
                      isDarkMode={isDarkMode}
                    />
                  }
                >
                  <PokeClicker isDarkMode={isDarkMode} />
                </Suspense>
              </section>
            ) : currentPage === 'profile' ? (
              <section className="py-8">
                <Suspense
                  fallback={
                    <LoadingSpinner
                      message="Loading profile..."
                      isDarkMode={isDarkMode}
                    />
                  }
                >
                  <ProfileDashboard
                    isDarkMode={isDarkMode}
                    onNavigate={setCurrentPage}
                  />
                </Suspense>
              </section>
            ) : currentPage === 'map' ? (
              <section className="py-8">
                <PokemonMap isDarkMode={isDarkMode} />
              </section>
            ) : (
              <>
                {error ? (
                  <div className="text-center py-16">
                    <p className="pixel-font text-xl text-red-600">
                      Error loading Pokémon
                    </p>
                    <p
                      className="pixel-font text-sm"
                      style={{color: 'var(--muted-foreground)'}}
                    >
                      {error.message}
                    </p>
                  </div>
                ) : (
                  <LazyPokedex
                    // SearchBar props
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    handleClearSearch={handleClearSearch}
                    isMobile={isMobile}
                    showMobileFilters={showMobileFilters}
                    setShowMobileFilters={setShowMobileFilters}
                    isDarkMode={isDarkMode}
                    // FiltersAndCount props
                    loading={loading}
                    displayedPokemon={displayedPokemon}
                    totalPokemon={totalPokemon}
                    selectedTypes={selectedTypes}
                    selectedRegion={selectedRegion}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    tempRegion={tempRegion}
                    tempTypes={tempTypes}
                    tempSortBy={tempSortBy}
                    tempSortOrder={tempSortOrder}
                    setSelectedRegion={setSelectedRegion}
                    setSelectedTypes={setSelectedTypes}
                    setSortBy={setSortBy}
                    setSortOrder={setSortOrder}
                    setTempRegion={setTempRegion}
                    setTempTypes={setTempTypes}
                    setTempSortBy={setTempSortBy}
                    setTempSortOrder={setTempSortOrder}
                    handleClearFilters={handleClearFilters}
                    // PokemonCard props
                    handlePokemonClick={handlePokemonClick}
                    displayedCount={displayedCount}
                    ITEMS_PER_PAGE={ITEMS_PER_PAGE}
                    hasMore={hasMore}
                    handleLoadMore={handleLoadMore}
                  />
                )}
              </>
            )}
          </main>

          {isModalOpen && (
            <Suspense
              fallback={
                <LoadingSpinner
                  message="Loading Pokemon details..."
                  isDarkMode={isDarkMode}
                />
              }
            >
              <PokemonDetailModal
                pokemon={selectedPokemon}
                allPokemon={filteredPokemon}
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onSelectPokemon={(id) => {
                  // First, try to find Pokemon in filtered list
                  const next = filteredPokemon.find((p) => p.id === id);
                  if (next) {
                    setSelectedPokemon(next);
                  } else {
                    // If not found (cross-region), fetch using pokemonById query
                    setCrossRegionPokemonId(id);
                  }
                }}
                onPurchase={(id) => {
                  if (selectedPokemon && selectedPokemon.id === id) {
                    setSelectedPokemon({...selectedPokemon, isOwned: true});
                  }
                  refetch();
                }}
                isDarkMode={isDarkMode}
              />
            </Suspense>
          )}
        </>
      )}
      <div className="relative">
        <BackgroundMusic isDarkMode={isDarkMode} />
      </div>
    </>
  );
}

export default App;
