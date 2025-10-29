import {useState, useEffect, Suspense, lazy} from 'react';
import {useMobileDetection} from '@/hooks';
import type {PokedexPokemon} from '@features/pokedex';
import {LoadingSpinner} from '@/components/LoadingSpinner';
import {PaginationControls} from '@/components/PaginationControls';
import {ArrowLeftIcon, ArrowRightIcon} from '@ui/pixelact';

const PokemonCard = lazy(() =>
  import('@features/pokedex').then((module) => ({default: module.PokemonCard}))
);

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

export function PokemonGrid({
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

  // Use centralized mobile detection hook
  const isMobileView = useMobileDetection(768);

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
