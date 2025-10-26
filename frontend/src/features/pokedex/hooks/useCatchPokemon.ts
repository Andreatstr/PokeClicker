import {useMutation, gql} from '@apollo/client';
import {type User} from '@features/auth';

const CATCH_POKEMON_MUTATION = gql`
  mutation CatchPokemon($pokemonId: Int!) {
    catchPokemon(pokemonId: $pokemonId) {
      _id
      username
      rare_candy
      created_at
      owned_pokemon_ids
      favorite_pokemon_id
      selected_pokemon_id
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
