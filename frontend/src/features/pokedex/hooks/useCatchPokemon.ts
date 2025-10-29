import {useMutation, type Reference} from '@apollo/client';
import {
  CATCH_POKEMON_MUTATION,
  type CatchPokemonData,
  type CatchPokemonVariables,
} from '@/lib/graphql';

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

        // Update all cached pokedex queries by iterating through cache and updating
        // the isOwned field for the matching Pokemon
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
                      broadcast: false, // Don't broadcast individual updates
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
