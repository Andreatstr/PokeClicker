import {useQuery} from '@apollo/client';
import {
  POKEMON_BY_ID_QUERY,
  type PokemonByIdData,
  type PokemonByIdVariables,
  type PokemonStats,
  type PokemonById,
} from '@/lib/graphql';

// Re-export types for convenience
export type {PokemonStats, PokemonById};

export function usePokemonById(id: number | null) {
  return useQuery<PokemonByIdData, PokemonByIdVariables>(POKEMON_BY_ID_QUERY, {
    variables: {id: id!},
    skip: id === null,
  });
}
