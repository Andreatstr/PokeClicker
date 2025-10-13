import {useState, useEffect} from 'react';
import {PokemonCard} from './components/PokemonCard';
import {PokemonDetailModal} from './components/ui/pixelact-ui/PokemonDetailModal';
import {Button} from '@/components/ui/pixelact-ui/button';
import {Input} from '@/components/ui/pixelact-ui/input';
import {Label} from '@/components/ui/pixelact-ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/pixelact-ui/select';
import {SearchIcon, CloseIcon} from '@/components/ui/pixelact-ui/icons';
import {PokeClicker} from './components/PokeClicker';
import {LoginScreen} from '@/components/LogInScreen';
import {Navbar} from './components/Navbar';
import {MultiSelect} from './components/ui/pixelact-ui/MultiSelect';
import {usePokedexQuery, type PokedexPokemon} from './hooks/usePokedexQuery';

function App() {
  const [selectedPokemon, setSelectedPokemon] = useState<PokedexPokemon | null>(
    null
  );
  const [isModalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
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

  const {loading, error, data} = usePokedexQuery({
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
    setIsDarkMode(!isDarkMode);
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
            style={{backgroundColor: 'var(--retro-secondary)'}}
          >
            {currentPage === 'clicker' ? (
              <section className="py-8">
                <PokeClicker />
              </section>
            ) : (
              <>
                {/* Search Bar */}
                <section className="mb-6 mt-6 sm:mt-4 max-w-4xl mx-auto">
                  <form
                    className="p-4"
                    style={{
                      backgroundColor: 'var(--retro-primary)',
                      border: '4px solid var(--retro-border)',
                      boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)',
                    }}
                    role="search"
                    onSubmit={(e) => e.preventDefault()}
                  >
                    <Label htmlFor="pokemon-search" className="sr-only">
                      Search Pokemon
                    </Label>
                    <div className="flex flex-col gap-3">
                      <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <Input
                          id="pokemon-search"
                          type="search"
                          placeholder="search"
                          className="w-full border-0 text-xl pl-12 pr-12 [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                          <div
                            onClick={handleClearSearch}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 cursor-pointer"
                            role="button"
                            tabIndex={0}
                            aria-label="Clear search"
                            onKeyDown={(e) =>
                              e.key === 'Enter' && handleClearSearch()
                            }
                          >
                            <CloseIcon className="w-5 h-5 text-gray-600 hover:text-black" />
                          </div>
                        )}
                      </div>
                      {isMobile && (
                        <Button
                          className="w-full mt-2 text-sm"
                          aria-haspopup="dialog"
                          aria-expanded={showMobileFilters}
                          aria-controls="mobile-filter-dialog"
                          aria-label="Open filter options"
                          onClick={() => setShowMobileFilters((prev) => !prev)}
                        >
                          Filters
                        </Button>
                      )}
                    </div>
                  </form>
                </section>

                {/* Filters and Count */}
                <section className="mb-6">
                  {showMobileFilters && (
                    <div
                      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
                      role="dialog"
                      aria-modal="true"
                      aria-labelledby="filter-dialog-title"
                      id="mobile-filter-dialog"
                      onClick={() => setShowMobileFilters(false)}
                    >
                      <div
                        className="w-full max-w-md bg-[var(--retro-surface)] p-4 rounded-md shadow-[var(--pixel-box-shadow)] max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="w-full bg-[var(--retro-surface)] p-4">
                          <div className="flex justify-between items-center mb-4">
                            <h2
                              id="filter-dialog-title"
                              className="pixel-font text-lg text-black"
                            >
                              Filter
                            </h2>
                            <button
                              onClick={() => setShowMobileFilters(false)}
                              aria-label="Close filter dialog"
                            >
                              <span className="text-xl">×</span>
                            </button>
                          </div>

                          <div className="flex flex-col gap-4">
                            {/* REGION */}
                            <div>
                              <Label className="text-xs font-bold text-black">
                                Region
                              </Label>
                              <Select
                                value={tempRegion ?? ''}
                                onValueChange={setTempRegion}
                              >
                                <SelectTrigger className="w-full text-sm">
                                  <SelectValue placeholder="All regions" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="kanto">
                                    Kanto (1-151)
                                  </SelectItem>
                                  <SelectItem value="johto">
                                    Johto (152-251)
                                  </SelectItem>
                                  <SelectItem value="hoenn">
                                    Hoenn (252-386)
                                  </SelectItem>
                                  <SelectItem value="sinnoh">
                                    Sinnoh (387-493)
                                  </SelectItem>
                                  <SelectItem value="unova">
                                    Unova (494-649)
                                  </SelectItem>
                                  <SelectItem value="kalos">
                                    Kalos (650-721)
                                  </SelectItem>
                                  <SelectItem value="alola">
                                    Alola (722-809)
                                  </SelectItem>
                                  <SelectItem value="galar">
                                    Galar (810-905)
                                  </SelectItem>
                                  <SelectItem value="paldea">
                                    Paldea (906-1025)
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* TYPE */}
                            <div>
                              <Label className="text-xs font-bold text-black">
                                Type
                              </Label>
                              <MultiSelect
                                options={[
                                  'normal',
                                  'fire',
                                  'water',
                                  'electric',
                                  'grass',
                                  'ice',
                                  'fighting',
                                  'poison',
                                  'ground',
                                  'flying',
                                  'psychic',
                                  'bug',
                                  'rock',
                                  'ghost',
                                  'dragon',
                                  'dark',
                                  'steel',
                                  'fairy',
                                ]}
                                selected={tempTypes}
                                onChange={setTempTypes}
                                className="w-full"
                              />
                            </div>

                            {/* SORT BY */}
                            <div>
                              <Label className="text-xs font-bold text-black">
                                Sort by
                              </Label>
                              <Select
                                value={tempSortBy}
                                onValueChange={(v) =>
                                  setTempSortBy(v as 'id' | 'name' | 'type')
                                }
                              >
                                <SelectTrigger className="w-full text-sm">
                                  <SelectValue placeholder="ID" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="id">ID</SelectItem>
                                  <SelectItem value="name">Name</SelectItem>
                                  <SelectItem value="type">Type</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* ORDER */}
                            <div>
                              <Label className="text-xs font-bold text-black">
                                Order
                              </Label>
                              <Select
                                value={tempSortOrder}
                                onValueChange={(v) =>
                                  setTempSortOrder(v as 'asc' | 'desc')
                                }
                              >
                                <SelectTrigger className="w-full text-sm">
                                  <SelectValue placeholder="Asc" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="asc">Asc</SelectItem>
                                  <SelectItem value="desc">Desc</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Footer Buttons */}
                          <div className="flex justify-between mt-6">
                            <Button
                              variant="default"
                              aria-label="Clear all filters"
                              onClick={() => {
                                setTempRegion(null);
                                setTempTypes([]);
                                setTempSortBy('id');
                                setTempSortOrder('asc');

                                setSelectedRegion(null);
                                setSelectedTypes([]);
                                setSortBy('id');
                                setSortOrder('asc');
                                setShowMobileFilters(false);
                              }}
                            >
                              Clear
                            </Button>
                            <Button
                              variant="default"
                              aria-label="Cancel filter changes"
                              onClick={() => setShowMobileFilters(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="default"
                              aria-label="Apply selected filters"
                              onClick={() => {
                                setSelectedRegion(tempRegion);
                                setSelectedTypes(tempTypes);
                                setSortBy(tempSortBy);
                                setSortOrder(tempSortOrder);
                                setShowMobileFilters(false);
                              }}
                            >
                              Apply
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {!isMobile && (
                    <div className="flex flex-col gap-4">
                      <p className="text-sm pixel-font text-black">
                        {loading
                          ? 'Loading...'
                          : `Showing ${displayedPokemon.length} of ${totalPokemon} Pokémon`}
                      </p>
                      <div>
                        {selectedTypes.length > 0 ? (
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs pixel-font text-black">
                              {selectedTypes.length === 18
                                ? 'Showing types: All types selected'
                                : `Showing types: ${selectedTypes.map((type) => type.charAt(0).toUpperCase() + type.slice(1)).join(', ')}`}
                            </p>
                            <Button
                              type="button"
                              variant="default"
                              className="text-xs w-fit px-2 py-1 mt-1"
                              onClick={() => setSelectedTypes([])}
                            >
                              Clear Type
                            </Button>
                          </div>
                        ) : (
                          <p className="text-xs pixel-font text-black">
                            Showing types: All types
                          </p>
                        )}
                      </div>

                      <div
                        className="grid gap-4"
                        style={{
                          gridTemplateColumns:
                            'repeat(auto-fit, minmax(220px, 1fr))',
                        }}
                      >
                        <div className="flex flex-col gap-1">
                          <Label className="text-xs font-bold text-black">
                            REGION
                          </Label>
                          <Select
                            value={selectedRegion ?? ''}
                            onValueChange={setSelectedRegion}
                          >
                            <SelectTrigger className="w-full text-sm">
                              <SelectValue placeholder="All regions" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="kanto">
                                Kanto (1-151)
                              </SelectItem>
                              <SelectItem value="johto">
                                Johto (152-251)
                              </SelectItem>
                              <SelectItem value="hoenn">
                                Hoenn (252-386)
                              </SelectItem>
                              <SelectItem value="sinnoh">
                                Sinnoh (387-493)
                              </SelectItem>
                              <SelectItem value="unova">
                                Unova (494-649)
                              </SelectItem>
                              <SelectItem value="kalos">
                                Kalos (650-721)
                              </SelectItem>
                              <SelectItem value="alola">
                                Alola (722-809)
                              </SelectItem>
                              <SelectItem value="galar">
                                Galar (810-905)
                              </SelectItem>
                              <SelectItem value="paldea">
                                Paldea (906-1025)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex flex-col gap-1">
                          <Label className="text-xs font-bold text-black">
                            TYPE
                          </Label>
                          <MultiSelect
                            options={[
                              'normal',
                              'fire',
                              'water',
                              'electric',
                              'grass',
                              'ice',
                              'fighting',
                              'poison',
                              'ground',
                              'flying',
                              'psychic',
                              'bug',
                              'rock',
                              'ghost',
                              'dragon',
                              'dark',
                              'steel',
                              'fairy',
                            ]}
                            selected={selectedTypes}
                            onChange={setSelectedTypes}
                            className="w-full"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <Label className="text-xs font-bold text-black">
                            SORT BY
                          </Label>
                          <Select
                            value={sortBy}
                            onValueChange={(value) =>
                              setSortBy(value as 'id' | 'name' | 'type')
                            }
                          >
                            <SelectTrigger className="w-full text-sm">
                              <SelectValue placeholder="ID" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="id">ID</SelectItem>
                              <SelectItem value="name">Name</SelectItem>
                              <SelectItem value="type">Type</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex flex-col gap-1">
                          <Label className="text-xs font-bold text-black">
                            ORDER
                          </Label>
                          <Select
                            value={sortOrder}
                            onValueChange={(value) =>
                              setSortOrder(value as 'asc' | 'desc')
                            }
                          >
                            <SelectTrigger className="w-full text-sm">
                              <SelectValue placeholder="Asc" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="asc">Asc</SelectItem>
                              <SelectItem value="desc">Desc</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex flex-col gap-1">
                          <Label className="text-xs font-bold text-black invisible">
                            ACTIONS
                          </Label>
                          <Button
                            type="button"
                            className="w-full text-sm"
                            onClick={handleClearFilters}
                          >
                            Clear Filters
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </section>

                {/* Pokemon Grid */}
                <section className="max-w-[2000px] mx-auto">
                  {error ? (
                    <div className="text-center py-16">
                      <p className="pixel-font text-xl text-red-600">
                        Error loading Pokémon
                      </p>
                      <p className="pixel-font text-sm text-[var(--retro-border)] mt-2">
                        {error.message}
                      </p>
                    </div>
                  ) : filteredPokemon.length === 0 && !loading ? (
                    <div className="text-center py-16">
                      <p className="pixel-font text-xl ">No Pokemon found</p>
                      <p className="pixel-font text-sm text-[var(--retro-border)] mt-2">
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
          />
        </>
      )}
    </>
  );
}

export default App;
