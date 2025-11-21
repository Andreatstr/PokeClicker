import {Dialog, DialogBody} from '@ui/pixelact';
import {useEffect, useState} from 'react';
import {usePokemonBasicBulk} from '../hooks/usePokemonBasic';
import {useOwnedPokemonIdsSortedByBST} from '../hooks/useOwnedPokemonIdsSortedByBST';

/**
 * Modal dialog for selecting a Pokemon from the user's owned collection
 *
 * Features:
 * - Efficient bulk query: fetches only owned Pokemon IDs from backend, sorted by BST (descending)
 * - Paginated grid: displays a page of Pokemon at a time for performance
 * - Grid layout with responsive columns
 * - Loading state handling for both ID and data fetches
 * - Dark mode support
 */
interface FavoritePokemonSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (pokemonId: number) => void;
  userId: string;
  isDarkMode?: boolean;
}

/**
 * Number of Pokemon to show per page in the selector dialog
 * Used for paginated display of owned Pokemon
 */
const PAGE_SIZE = 20;

export function FavoritePokemonSelector({
  isOpen,
  onClose,
  onSelect,
  userId,
  isDarkMode = false,
}: FavoritePokemonSelectorProps) {
  // Current page index for pagination (reset when dialog opens)
  const [page, setPage] = useState(0);

  // Fetch owned Pokemon IDs sorted by BST (descending) from backend
  // Only fetches IDs, not full Pokemon data, for performance
  const {
    data: idsData,
    loading: loadingIds,
    refetch,
  } = useOwnedPokemonIdsSortedByBST(userId);
  const sortedIds = idsData?.ownedPokemonIdsSortedByBST ?? [];

  // Paginate the sorted IDs for current page
  const startIdx = page * PAGE_SIZE;
  const endIdx = startIdx + PAGE_SIZE;
  const pageIds = sortedIds.slice(startIdx, endIdx);

  // Fetch basic data for only the current page's Pokemon
  // Uses bulk query for efficiency
  const {data: pageData, loading: loadingPage} = usePokemonBasicBulk(
    isOpen ? pageIds : []
  );
  const pagePokemon = pageData?.pokemonByIds ?? [];
  // Total number of pages for pagination controls
  const totalPages = Math.ceil(sortedIds.length / PAGE_SIZE);

  // Reset to first page whenever dialog is opened or owned Pokemon count changes
  useEffect(() => {
    if (isOpen) setPage(0);
  }, [isOpen, sortedIds.length]);

  // Refetch owned Pokemon IDs from backend every time the modal opens
  // Ensures the selector always shows the latest collection without page refresh
  useEffect(() => {
    if (isOpen) {
      refetch();
    }
  }, [isOpen, refetch]);

  /**
   * Helper to calculate total base stats (BST) for a Pokemon
   * Used for display purposes if needed
   */
  const calculateTotalStat = (stats?: {
    hp: number;
    attack: number;
    defense: number;
    spAttack: number;
    spDefense: number;
    speed: number;
  }) => {
    if (!stats) return 0;
    return (
      stats.hp +
      stats.attack +
      stats.defense +
      stats.spAttack +
      stats.spDefense +
      stats.speed
    );
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogBody>
        <section
          className="pixel-font p-4 sm:p-6 max-w-2xl mx-auto max-h-[80vh] overflow-auto"
          style={{
            backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f1e8',
            border: `4px solid ${isDarkMode ? '#333333' : 'black'}`,
            scrollbarWidth: 'none', // Firefox
            msOverflowStyle: 'none', // IE/Edge
            boxShadow: isDarkMode
              ? '8px 8px 0px rgba(51,51,51,1)'
              : '8px 8px 0px rgba(0,0,0,1)',
          }}
          aria-labelledby="pokemon-selector-heading"
        >
          <header>
            <h2
              id="pokemon-selector-heading"
              className="text-lg sm:text-xl font-bold mb-4"
            >
              SELECT YOUR POKEMON
            </h2>
          </header>

          {loadingIds ? (
            <p className="text-center py-8">Loading Pokémon list...</p>
          ) : loadingPage ? (
            <p className="text-center py-8">Loading Pokémon...</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {pagePokemon.map((pokemon) => {
                const totalStat = calculateTotalStat(pokemon.stats);
                return (
                  <button
                    key={pokemon.id}
                    onClick={() => onSelect(pokemon.id)}
                    className="p-3 border-2"
                    aria-label={`Select ${pokemon.name} (Total stat: ${totalStat})`}
                    style={{
                      borderColor: isDarkMode ? '#333333' : 'black',
                      backgroundColor: isDarkMode ? '#2a2a2a' : '#f5f1e8',
                      boxShadow: isDarkMode
                        ? '4px 4px 0px rgba(51,51,51,1)'
                        : '4px 4px 0px rgba(0,0,0,1)',
                      transform: 'translate(0, 0)',
                      transition: 'all 0.15s ease-in-out',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translate(-2px, -2px)';
                      e.currentTarget.style.boxShadow = isDarkMode
                        ? '6px 6px 0px rgba(51,51,51,1)'
                        : '6px 6px 0px rgba(0,0,0,1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translate(0, 0)';
                      e.currentTarget.style.boxShadow = isDarkMode
                        ? '4px 4px 0px rgba(51,51,51,1)'
                        : '4px 4px 0px rgba(0,0,0,1)';
                    }}
                  >
                    <img
                      src={pokemon.sprite}
                      alt=""
                      className="w-full h-16 sm:h-20 object-contain mx-auto"
                      loading="lazy"
                      decoding="async"
                      style={{imageRendering: 'pixelated'}}
                    />
                    <p className="text-xs sm:text-sm mt-2 capitalize text-center truncate">
                      {pokemon.name}
                    </p>
                    <p
                      className="text-xs text-center"
                      style={{color: isDarkMode ? '#a0a0a0' : '#666'}}
                    >
                      #{pokemon.id}
                    </p>
                    <p
                      className="text-[8px] sm:text-[9px] text-center font-bold mt-1"
                      style={{color: isDarkMode ? '#4ade80' : '#16a34a'}}
                      title="Total Stat"
                    >
                      Total base stat: {totalStat}
                    </p>
                  </button>
                );
              })}
            </div>
          )}

          {/* Pagination controls */}
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-4 py-2 border-2 font-bold"
              style={{
                borderColor: isDarkMode ? '#333333' : 'black',
                backgroundColor: isDarkMode ? '#2a2a2a' : '#e5e5e5',
                color: isDarkMode ? '#e5e5e5' : '#000',
                opacity: page === 0 ? 0.5 : 1,
                cursor: page === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              Previous
            </button>
            <span className="text-xs sm:text-sm">
              Page {page + 1} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-4 py-2 border-2 font-bold"
              style={{
                borderColor: isDarkMode ? '#333333' : 'black',
                backgroundColor: isDarkMode ? '#2a2a2a' : '#e5e5e5',
                color: isDarkMode ? '#e5e5e5' : '#000',
                opacity: page >= totalPages - 1 ? 0.5 : 1,
                cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
              }}
            >
              Next
            </button>
          </div>

          <button
            onClick={onClose}
            className="mt-4 w-full px-4 py-2 font-bold border-4 text-sm sm:text-base"
            aria-label="Cancel"
            style={{
              borderColor: isDarkMode ? '#333333' : 'black',
              backgroundColor: isDarkMode ? '#2a2a2a' : '#d4d4d4',
              color: isDarkMode ? '#e5e5e5' : '#000',
              boxShadow: isDarkMode
                ? '4px 4px 0px rgba(51,51,51,1)'
                : '4px 4px 0px rgba(0,0,0,1)',
              transform: 'translate(0, 0)',
              transition: 'all 0.15s ease-in-out',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translate(-2px, -2px)';
              e.currentTarget.style.boxShadow = isDarkMode
                ? '6px 6px 0px rgba(51,51,51,1)'
                : '6px 6px 0px rgba(0,0,0,1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translate(0, 0)';
              e.currentTarget.style.boxShadow = isDarkMode
                ? '4px 4px 0px rgba(51,51,51,1)'
                : '4px 4px 0px rgba(0,0,0,1)';
            }}
          >
            CANCEL
          </button>
        </section>
        <style>
          {`
          section.pixel-font::-webkit-scrollbar {
            display: none;
          }
        `}
        </style>
      </DialogBody>
    </Dialog>
  );
}
