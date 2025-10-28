import {useMutation, gql} from '@apollo/client';
import {type User} from '@features/auth';
import {USER_FRAGMENT} from '@/lib/graphql/fragments';

const CATCH_POKEMON_MUTATION = gql`
  ${USER_FRAGMENT}
  mutation CatchPokemon($pokemonId: Int!) {
    catchPokemon(pokemonId: $pokemonId) {
      ...UserFields
    }
  }
`;

interface CatchPokemonData {
  catchPokemon: User;
}

interface CatchPokemonVariables {
  pokemonId: number;
}

export function useCatchPokemon() {
  return useMutation<CatchPokemonData, CatchPokemonVariables>(
    CATCH_POKEMON_MUTATION,
    {
      // Refetch pokedex and me queries to update UI
      refetchQueries: ['Pokedex', 'Me'],
    }
  );
}
