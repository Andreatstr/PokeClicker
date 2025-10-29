import {useMutation, type Reference} from '@apollo/client';
import {useAuth} from '@features/auth';
import {
  PURCHASE_POKEMON_MUTATION,
  type PurchasePokemonData,
  type PurchasePokemonVariables,
} from '@/lib/graphql';
import {getPokemonCost} from '../utils/pokemonCost';

export function usePurchasePokemon() {
  const {user} = useAuth();

  return useMutation<PurchasePokemonData, PurchasePokemonVariables>(
    PURCHASE_POKEMON_MUTATION,
    {
      update(cache, {data}) {
        if (!data?.purchasePokemon) return;

        // Get the ID of the purchased Pokemon (last item in owned_pokemon_ids array)
        const purchasedPokemonId =
          data.purchasePokemon.owned_pokemon_ids[
            data.purchasePokemon.owned_pokemon_ids.length - 1
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

              // Update each Pokemon reference that matches the purchased ID
              pokemonArray.forEach((pokemonRef) => {
                const pokemonId = readField<number>('id', pokemonRef);
                if (pokemonId === purchasedPokemonId) {
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
      optimisticResponse: (variables) => {
        // Use actual user data from context instead of placeholder values
        if (!user) {
          // Fallback to placeholder if no user (shouldn't happen in normal flow)
          return {
            purchasePokemon: {
              __typename: 'User',
              _id: '',
              username: '',
              rare_candy: 0,
              created_at: new Date().toISOString(),
              owned_pokemon_ids: [variables.pokemonId],
              favorite_pokemon_id: null,
              selected_pokemon_id: null,
              stats: {
                __typename: 'UserStats',
                hp: 1,
                attack: 1,
                defense: 1,
                spAttack: 1,
                spDefense: 1,
                speed: 1,
                clickPower: 1,
                passiveIncome: 0,
              },
            },
          };
        }

        // Calculate optimistic rare_candy after purchase
        const pokemonCost = getPokemonCost(variables.pokemonId);
        const optimisticRareCandy = user.rare_candy - pokemonCost;

        // Return optimistic response with actual user data
        return {
          purchasePokemon: {
            __typename: 'User',
            _id: user._id,
            username: user.username,
            rare_candy: optimisticRareCandy,
            created_at: user.created_at,
            owned_pokemon_ids: [...user.owned_pokemon_ids, variables.pokemonId],
            favorite_pokemon_id: user.favorite_pokemon_id ?? null,
            selected_pokemon_id: user.selected_pokemon_id ?? null,
            stats: user.stats
              ? {
                  __typename: 'UserStats',
                  hp: user.stats.hp,
                  attack: user.stats.attack,
                  defense: user.stats.defense,
                  spAttack: user.stats.spAttack,
                  spDefense: user.stats.spDefense,
                  speed: user.stats.speed,
                  clickPower: user.stats.clickPower ?? 1,
                  passiveIncome: user.stats.passiveIncome ?? 0,
                }
              : {
                  __typename: 'UserStats',
                  hp: 1,
                  attack: 1,
                  defense: 1,
                  spAttack: 1,
                  spDefense: 1,
                  speed: 1,
                  clickPower: 1,
                  passiveIncome: 0,
                },
          },
        };
      },
    }
  );
}
