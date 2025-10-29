import {useMutation, gql} from '@apollo/client';
import {type User} from '@features/auth';

const CATCH_POKEMON_MUTATION = gql`
  mutation CatchPokemon($pokemonId: Int!) {
    catchPokemon(pokemonId: $pokemonId) {
      _id
      owned_pokemon_ids
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
      refetchQueries: ['Pokedex'],
    }
  );
}
