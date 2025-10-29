import {useMutation} from '@apollo/client';
import {
  CATCH_POKEMON_MUTATION,
  type CatchPokemonData,
  type CatchPokemonVariables,
} from '@/lib/graphql';

export function useCatchPokemon() {
  return useMutation<CatchPokemonData, CatchPokemonVariables>(
    CATCH_POKEMON_MUTATION,
    {
      refetchQueries: ['Pokedex'],
    }
  );
}
