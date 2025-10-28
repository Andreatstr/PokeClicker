import {useMutation, gql} from '@apollo/client';
import {type User} from '@features/auth';
import {USER_FRAGMENT} from '@/lib/graphql/fragments';

const PURCHASE_POKEMON_MUTATION = gql`
  ${USER_FRAGMENT}
  mutation PurchasePokemon($pokemonId: Int!) {
    purchasePokemon(pokemonId: $pokemonId) {
      ...UserFields
    }
  }
`;

interface PurchasePokemonData {
  purchasePokemon: User;
}

interface PurchasePokemonVariables {
  pokemonId: number;
}

export function usePurchasePokemon() {
  return useMutation<PurchasePokemonData, PurchasePokemonVariables>(
    PURCHASE_POKEMON_MUTATION,
    {
      // Refetch pokedex and me queries to update UI
      refetchQueries: ['Pokedex', 'Me'],
      // Show optimistic response
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
