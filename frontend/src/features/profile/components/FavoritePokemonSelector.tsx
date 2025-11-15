import {Dialog, DialogBody} from '@ui/pixelact';
import {usePokemonBasicBulk} from '../hooks/usePokemonBasic';

/**
 * Modal dialog for selecting a Pokemon from owned collection
 *
 * Features:
 * - Efficient bulk query (fetches all owned Pokemon in single request)
 * - Sorted by total stats (BST) in descending order (strongest first)
 * - Grid layout with responsive columns
 * - Loading state handling
 * - Dark mode support
 */
interface FavoritePokemonSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (pokemonId: number) => void;
  ownedPokemonIds: number[];
  isDarkMode?: boolean;
}

export function FavoritePokemonSelector({
  isOpen,
  onClose,
  onSelect,
  ownedPokemonIds,
  isDarkMode = false,
}: FavoritePokemonSelectorProps) {
  // Fetch all owned Pokemon in a single query (only when dialog is open)
  const {data, loading} = usePokemonBasicBulk(isOpen ? ownedPokemonIds : []);

  // Sort Pokemon by total stats (BST) in descending order
  const ownedPokemon = (data?.pokemonByIds || []).slice().sort((a, b) => {
    // Calculate BST from stats
    const bstA = a.stats
      ? a.stats.hp +
        a.stats.attack +
        a.stats.defense +
        a.stats.spAttack +
        a.stats.spDefense +
        a.stats.speed
      : 0;
    const bstB = b.stats
      ? b.stats.hp +
        b.stats.attack +
        b.stats.defense +
        b.stats.spAttack +
        b.stats.spDefense +
        b.stats.speed
      : 0;
    return bstB - bstA; // Descending order (highest stats first)
  });

  // Helper to calculate total stats for display
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

          {loading ? (
            <p className="text-center py-8">Loading Pokemon...</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {ownedPokemon?.map((pokemon) => {
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
                      className="text-[9px] sm:text-[10px] text-center font-bold mt-1"
                      style={{color: isDarkMode ? '#4ade80' : '#16a34a'}}
                      title="Total Stat"
                    >
                      Total stat: {totalStat}
                    </p>
                  </button>
                );
              })}
            </div>
          )}

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
      </DialogBody>
    </Dialog>
  );
}
