import {useQuery} from '@apollo/client';
import {
  POKEDEX_QUERY,
  type PokedexData,
  type PokedexVariables,
  type PokedexPokemon,
} from '@/lib/graphql';

// Re-export the PokedexPokemon type for convenience
export type {PokedexPokemon};

export function usePokedexQuery(variables: PokedexVariables) {
  const {data, loading, error, refetch} = useQuery<
    PokedexData,
    PokedexVariables
  >(POKEDEX_QUERY, {
    variables,
    fetchPolicy: 'cache-and-network',
  });

  return {data, loading, error, refetch};
}
