import {useQuery, gql} from '@apollo/client';
import {Dialog, DialogBody} from '@ui/pixelact';

const GET_POKEDEX = gql`
  query GetPokedex($limit: Int, $offset: Int) {
    pokedex(limit: $limit, offset: $offset) {
      pokemon {
        id
        name
        sprite
        isOwned
      }
    }
  }
`;

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
  const {data, loading} = useQuery(GET_POKEDEX, {
    variables: {limit: 1000, offset: 0},
    skip: !isOpen,
  });

  const ownedPokemon = data?.pokedex.pokemon.filter((p: any) =>
    ownedPokemonIds.includes(p.id)
  );

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogBody>
        <div
          className="pixel-font p-4 sm:p-6 max-w-2xl mx-auto max-h-[80vh] overflow-auto"
          style={{
            backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f1e8',
            border: `4px solid ${isDarkMode ? '#333333' : 'black'}`,
            boxShadow: isDarkMode
              ? '8px 8px 0px rgba(51,51,51,1)'
              : '8px 8px 0px rgba(0,0,0,1)',
          }}
        >
          <h2 className="text-lg sm:text-xl font-bold mb-4">SELECT FAVORITE POKEMON</h2>

          {loading ? (
            <p className="text-center py-8">Loading Pokemon...</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {ownedPokemon?.map((pokemon: any) => (
                <button
                  key={pokemon.id}
                  onClick={() => onSelect(pokemon.id)}
                  className="p-3 border-2 transition-all hover:scale-105"
                  style={{
                    borderColor: isDarkMode ? '#333333' : 'black',
                    backgroundColor: isDarkMode ? '#2a2a2a' : '#f5f1e8',
                  }}
                >
                  <img
                    src={pokemon.sprite}
                    alt={pokemon.name}
                    className="w-full h-16 sm:h-20 object-contain mx-auto"
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
                </button>
              ))}
            </div>
          )}

          <button
            onClick={onClose}
            className="mt-4 w-full px-4 py-2 font-bold border-4 transition-all text-sm sm:text-base"
            style={{
              borderColor: isDarkMode ? '#333333' : 'black',
              backgroundColor: isDarkMode ? '#2a2a2a' : '#d4d4d4',
              color: isDarkMode ? '#e5e5e5' : '#000',
              boxShadow: isDarkMode
                ? '4px 4px 0px rgba(51,51,51,1)'
                : '4px 4px 0px rgba(0,0,0,1)',
            }}
          >
            CANCEL
          </button>
        </div>
      </DialogBody>
    </Dialog>
  );
}
