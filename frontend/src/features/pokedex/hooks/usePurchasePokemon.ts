import {useMutation, gql} from '@apollo/client';
import {type User} from '@features/auth';

const PURCHASE_POKEMON_MUTATION = gql`
  mutation PurchasePokemon($pokemonId: Int!) {
    purchasePokemon(pokemonId: $pokemonId) {
      _id
      username
      rare_candy
      created_at
      owned_pokemon_ids
      stats {
        hp
        attack
        defense
        spAttack
        spDefense
        speed
      }
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
