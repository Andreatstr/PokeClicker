import {useQuery} from '@apollo/client';
import {
  POKEMON_BY_ID_BASIC,
  POKEMON_BY_IDS,
  type PokemonBasic,
  type PokemonByIdBasicData,
  type PokemonByIdsData,
  type PokemonByIdsVariables,
  type PokemonByIdVariables,
} from '@/lib/graphql';

// Re-export type for convenience
export type {PokemonBasic};

/**
 * Hook to fetch basic Pokemon data by ID for Profile displays
 */
export function usePokemonBasic(id: number | null | undefined) {
  return useQuery<PokemonByIdBasicData, PokemonByIdVariables>(
    POKEMON_BY_ID_BASIC,
    {
      variables: {id: id!},
      skip: !id,
    }
  );
}

/**
 * Hook to fetch multiple Pokemon basic data by IDs for Profile selectors
 */
export function usePokemonBasicBulk(ids: number[]) {
  return useQuery<PokemonByIdsData, PokemonByIdsVariables>(POKEMON_BY_IDS, {
    variables: {ids},
    skip: !ids || ids.length === 0,
  });
}
