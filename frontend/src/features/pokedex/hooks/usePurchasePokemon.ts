import {useMutation} from '@apollo/client';
import {
  PURCHASE_POKEMON_MUTATION,
  type PurchasePokemonData,
  type PurchasePokemonVariables,
} from '@/lib/graphql';

export function usePurchasePokemon() {
  return useMutation<PurchasePokemonData, PurchasePokemonVariables>(
    PURCHASE_POKEMON_MUTATION,
    {
      refetchQueries: ['Pokedex'],
      optimisticResponse: (variables) => ({
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
          },
        },
      }),
    }
  );
}
