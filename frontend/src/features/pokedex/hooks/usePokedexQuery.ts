import {useQuery, type QueryHookOptions} from '@apollo/client';
import {
  POKEDEX_QUERY,
  type PokedexData,
  type PokedexVariables,
  type PokedexPokemon,
} from '@/lib/graphql';

// Re-export the PokedexPokemon type for convenience
export type {PokedexPokemon};

/**
 * Hook for querying Pokedex data with pagination and filtering
 *
 * Uses Apollo Client's cache-and-network fetch policy for:
 * - Immediate display of cached data (instant UI)
 * - Background refresh from server (data freshness)
 *
 * @param variables - Query parameters (limit, offset for pagination)
 * @param options - Additional Apollo query options
 * @returns Query data, loading state, error, and refetch function
 */
export function usePokedexQuery(
  variables: PokedexVariables,
  options?: QueryHookOptions<PokedexData, PokedexVariables>
) {
  const {data, loading, error, refetch} = useQuery<
    PokedexData,
    PokedexVariables
  >(POKEDEX_QUERY, {
    variables,
    fetchPolicy: 'cache-and-network',
    ...options,
  });

  return {data, loading, error, refetch};
}
