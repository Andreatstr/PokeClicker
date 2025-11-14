import {useMutation, type Reference} from '@apollo/client';
import {
  CATCH_POKEMON_MUTATION,
  type CatchPokemonData,
  type CatchPokemonVariables,
} from '@/lib/graphql';

/**
 * Hook for catching Pokemon with Apollo cache updates
 *
 * Features:
 * - Mutation to add Pokemon to user's collection via battle victory
 * - Automatic cache update to reflect ownership across all Pokedex queries
 * - Updates isOwned field for caught Pokemon in all cached query results
 *
 * Cache update strategy:
 * - Identifies newly caught Pokemon from updated owned_pokemon_ids array
 * - Iterates through all cached Pokedex queries
 * - Updates Pokemon's isOwned field to true in cache
 * - Prevents refetch - UI updates instantly from cache modification
 *
 * @returns Mutation function for catching Pokemon
 */
export function useCatchPokemon() {
  return useMutation<CatchPokemonData, CatchPokemonVariables>(
    CATCH_POKEMON_MUTATION,
    {
      update(cache, {data}) {
        if (!data?.catchPokemon) return;

        // Get the ID of the caught Pokemon (last item in owned_pokemon_ids array)
        const caughtPokemonId =
          data.catchPokemon.owned_pokemon_ids[
            data.catchPokemon.owned_pokemon_ids.length - 1
          ];

        // Update all cached pokedex queries by modifying isOwned field
        // This ensures Pokemon appears as owned across entire UI without refetch
        cache.modify({
          fields: {
            pokedex(existingPokedexRef, {readField}) {
              if (!existingPokedexRef) return existingPokedexRef;

              const pokemonArray = readField<readonly Reference[]>(
                'pokemon',
                existingPokedexRef
              );
              if (!pokemonArray) return existingPokedexRef;

              // Update each Pokemon reference that matches the caught ID
              pokemonArray.forEach((pokemonRef) => {
                const pokemonId = readField<number>('id', pokemonRef);
                if (pokemonId === caughtPokemonId) {
                  const pokemonCacheId = cache.identify({
                    __typename: 'Pokemon',
                    id: pokemonId,
                  });
                  if (pokemonCacheId) {
                    cache.modify({
                      id: pokemonCacheId,
                      fields: {
                        isOwned() {
                          return true;
                        },
                      },
                    });
                  }
                }
              });

              return existingPokedexRef;
            },
          },
        });
      },
    }
  );
}
