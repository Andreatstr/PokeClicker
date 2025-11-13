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
  handlePokemonClick: (
    pokemon: PokedexPokemon,
    allDisplayed: PokedexPokemon[]
  ) => void;
  isDarkMode: boolean;
  ITEMS_PER_PAGE: number;
  paginationPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading: boolean;
  ownedPokemonIds: number[];
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
  ownedPokemonIds,
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
        <section className="text-center py-16" role="status" aria-live="polite">
          <p className="pixel-font text-xl">No Pokemon found</p>
          <p
            className="pixel-font text-sm"
            style={{color: 'var(--muted-foreground)'}}
          >
            Try a different search term
          </p>
        </section>
      ) : (
        <>
          {/* Mobile: Card on Top + List Below */}
          {isMobileView ? (
            <section
              className="flex flex-col gap-4"
              aria-label="Mobile Pokemon view"
            >
              {/* Top: Selected Pokemon Card */}
              <section className="w-full flex justify-center">
                {selectedMobilePokemon && (
                  <Suspense
                    fallback={
                      <LoadingSpinner
                        message="Loading Pokemon..."
                        isDarkMode={isDarkMode}
                      />
                    }
                  >
                    <div
                      data-onboarding={
                        paginationPage === 1 &&
                        displayedPokemon[0]?.id === selectedMobilePokemon.id
                          ? 'pokemon-card'
                          : paginationPage === 1 &&
                              !ownedPokemonIds.includes(
                                selectedMobilePokemon.id
                              ) &&
                              displayedPokemon.findIndex(
                                (p) => p.id === selectedMobilePokemon.id
                              ) > 0 &&
                              displayedPokemon.findIndex(
                                (p) => p.id === selectedMobilePokemon.id
                              ) <= 5 &&
                              displayedPokemon
                                .slice(
                                  0,
                                  displayedPokemon.findIndex(
                                    (p) => p.id === selectedMobilePokemon.id
                                  )
                                )
                                .every((p) => ownedPokemonIds.includes(p.id))
                            ? 'pokemon-card-locked'
                            : undefined
                      }
                    >
                      <PokemonCard
                        pokemon={selectedMobilePokemon}
                        onClick={(poke) =>
                          handlePokemonClick(poke, displayedPokemon)
                        }
                        isDarkMode={isDarkMode}
                        ownedPokemonIds={ownedPokemonIds}
                      />
                    </div>
                  </Suspense>
                )}
              </section>

              {/* Bottom: Horizontal Scrollable Pokemon List */}
              <section
                className="w-full relative"
                aria-label="Pokemon selection list"
              >
                <div className="absolute left-2 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
                  <ArrowLeftIcon size={32} className="animate-pulse" />
                </div>
                <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white dark:from-gray-900 to-transparent pointer-events-none z-10 border-l-4 border-black"></div>

                <div className="absolute right-2 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
                  <ArrowRightIcon size={32} className="animate-pulse" />
                </div>
                <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white dark:from-gray-900 to-transparent pointer-events-none z-10 border-r-4 border-black"></div>

                <nav
                  className="overflow-x-auto border-4 border-black bg-white dark:bg-gray-900 shadow-[4px_4px_0px_rgba(0,0,0,1)]"
                  aria-label="Pokemon scroll list"
                >
                  <ul className="flex list-none p-0 m-0">
                    {displayedPokemon.map((pokemon, index) => {
                      const isOwned = ownedPokemonIds.includes(pokemon.id);

                      // Find first unowned Pokemon for locked card tutorial (on page 1, index 1-5)
                      const isFirstLockedCard =
                        paginationPage === 1 &&
                        index > 0 &&
                        index <= 5 &&
                        !isOwned &&
                        displayedPokemon
                          .slice(0, index)
                          .every((p) => ownedPokemonIds.includes(p.id));

                      return (
                        <li
                          key={pokemon.id}
                          onClick={() => setSelectedMobilePokemon(pokemon)}
                          className={`flex-shrink-0 flex flex-col items-center gap-1 p-2 border-r-2 border-black cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                            selectedMobilePokemon?.id === pokemon.id
                              ? 'bg-blue-100 dark:bg-blue-900'
                              : ''
                          }`}
                          style={{minWidth: '100px'}}
                          data-onboarding={
                            isFirstLockedCard
                              ? 'pokemon-card-locked'
                              : undefined
                          }
                        >
                          <img
                            src={pokemon.sprite}
                            alt={
                              pokemon.isOwned ? pokemon.name : 'Unknown Pokémon'
                            }
                            className="w-16 h-16 pixelated"
                            loading="lazy"
                            decoding="async"
                            style={{
                              imageRendering: 'pixelated',
                              filter: pokemon.isOwned
                                ? 'none'
                                : 'brightness(0)',
                            }}
                          />
                          <p className="text-[10px] font-bold text-center">
                            No. {pokemon.pokedexNumber}
                          </p>
                          <p className="text-xs font-bold capitalize text-center truncate w-full px-1">
                            {pokemon.isOwned ? pokemon.name : '???'}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              </section>

              {/* Mobile Pagination Controls */}
              <PaginationControls
                currentPage={paginationPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
                loading={loading}
                isMobile={true}
                isDarkMode={isDarkMode}
              />
            </section>
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
                {displayedPokemon.map((pokemon, index) => {
                  const isOwned = ownedPokemonIds.includes(pokemon.id);
                  const isFirstCard = index === 0 && paginationPage === 1;

                  // Find first unowned Pokemon for locked card tutorial (on page 1, index 1-5)
                  const isFirstLockedCard =
                    paginationPage === 1 &&
                    index > 0 &&
                    index <= 5 &&
                    !isOwned &&
                    displayedPokemon
                      .slice(0, index)
                      .every((p) => ownedPokemonIds.includes(p.id));

                  let onboardingId: string | undefined;
                  if (isFirstCard) {
                    onboardingId = 'pokemon-card';
                  } else if (isFirstLockedCard) {
                    onboardingId = 'pokemon-card-locked';
                  }

                  return (
                    <li
                      key={pokemon.id}
                      className="animate-fade-in"
                      style={{
                        animationDelay: `${(index % ITEMS_PER_PAGE) * 50}ms`,
                      }}
                      data-onboarding={onboardingId}
                    >
                      <PokemonCard
                        pokemon={pokemon}
                        onClick={(poke) =>
                          handlePokemonClick(poke, displayedPokemon)
                        }
                        isDarkMode={isDarkMode}
                        ownedPokemonIds={ownedPokemonIds}
                      />
                    </li>
                  );
                })}
              </ul>

              {/* Desktop Pagination Controls */}
              <PaginationControls
                currentPage={paginationPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
                loading={loading}
                isMobile={false}
                isDarkMode={isDarkMode}
              />
            </>
          )}
        </>
      )}
    </>
  );
}
