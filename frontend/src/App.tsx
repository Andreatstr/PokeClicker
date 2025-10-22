import {useState, useEffect} from 'react';
import {
  PokemonCard,
  PokemonDetailModal,
  SearchBar,
  FiltersAndCount,
  usePokedexQuery,
  type PokedexPokemon,
} from '@features/pokedex';
import {Button} from '@ui/pixelact';
import {PokeClicker} from '@features/clicker';
import {LoginScreen} from '@features/auth';
import {Navbar, BackgroundMusic} from '@/components';

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
    'clicker' | 'pokedex' | 'login'
  >('login');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'id' | 'name' | 'type'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [displayedCount, setDisplayedCount] = useState(20);

  const ITEMS_PER_PAGE = 20;

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
        <LoginScreen onNavigate={setCurrentPage} />
      ) : (
        <>
          <main
            className="min-h-screen px-4 sm:px-6 md:px-8 pb-8 pt-0"
            style={{backgroundColor: 'var(--background)'}}
          >
            {currentPage === 'clicker' ? (
              <section className="py-8">
                <PokeClicker isDarkMode={isDarkMode} />
              </section>
            ) : (
              <>
                {/* Search Bar */}
                <SearchBar
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  handleClearSearch={handleClearSearch}
                  isMobile={isMobile}
                  showMobileFilters={showMobileFilters}
                  setShowMobileFilters={setShowMobileFilters}
                  isDarkMode={isDarkMode}
                />

                {/* Filters and Count */}
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
                  setSelectedRegion={setSelectedRegion}
                  setSelectedTypes={setSelectedTypes}
                  setSortBy={setSortBy}
                  setSortOrder={setSortOrder}
                  setShowMobileFilters={setShowMobileFilters}
                  setTempRegion={setTempRegion}
                  isDarkMode={isDarkMode}
                  setTempTypes={setTempTypes}
                  setTempSortBy={setTempSortBy}
                  setTempSortOrder={setTempSortOrder}
                  handleClearFilters={handleClearFilters}
                />

                {/* Pokemon Grid */}
                <section className="max-w-[2000px] mx-auto">
                  {error ? (
                    <div className="text-center py-16">
                      <p className="pixel-font text-xl text-red-600">
                        Error loading Pokémon
                      </p>
                      <p className="pixel-font text-sm style={{color: 'var(--muted-foreground)'}} mt-2">
                        {error.message}
                      </p>
                    </div>
                  ) : filteredPokemon.length === 0 && !loading ? (
                    <div className="text-center py-16">
                      <p className="pixel-font text-xl ">No Pokemon found</p>
                      <p className="pixel-font text-sm style={{color: 'var(--muted-foreground)'}} mt-2">
                        Try a different search term
                      </p>
                    </div>
                  ) : (
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

                      {/* Load More Button */}
                      {hasMore && (
                        <footer className="flex flex-col items-center gap-4 mt-8">
                          <Button
                            variant="default"
                            size="lg"
                            onClick={handleLoadMore}
                            disabled={loading}
                            className="min-w-[200px]"
                          >
                            {loading ? 'Loading...' : 'Load more'}
                          </Button>
                        </footer>
                      )}
                    </>
                  )}
                </section>
              </>
            )}
          </main>

          <PokemonDetailModal
            pokemon={selectedPokemon}
            isOpen={isModalOpen}
            onClose={() => setModalOpen(false)}
            onSelectPokemon={(id) => {
              const next = filteredPokemon.find((p) => p.id === id);
              if (next) setSelectedPokemon(next);
            }}
            onPurchase={(id) => {
              if (selectedPokemon && selectedPokemon.id === id) {
                setSelectedPokemon({...selectedPokemon, isOwned: true});
              }
              refetch();
            }}
            isDarkMode={isDarkMode}
          />
        </>
      )}
      <BackgroundMusic />
    </>
  );
}

export default App;
