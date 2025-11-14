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
 * Hook to fetch lightweight Pokemon data by ID
 *
 * Fetches only essential fields (id, name, sprite, types) for profile displays.
 * More efficient than full Pokemon query when detailed stats are not needed.
 *
 * @param id - Pokemon ID to fetch, or null/undefined to skip query
 * @returns Apollo query result with pokemon data
 *
 * @example
 * const { data, loading, error } = usePokemonBasic(favoriteId);
 */
export function usePokemonBasic(id: number | null | undefined) {
  return useQuery<PokemonByIdBasicData, PokemonByIdVariables>(
    POKEMON_BY_ID_BASIC,
    {
      variables: {id: id!},
      skip: !id, // Skip query if no ID provided
    }
  );
}

/**
 * Hook to fetch multiple Pokemon basic data in a single request
 *
 * Efficiently fetches multiple Pokemon at once for selector dialogs.
 * Reduces network requests compared to fetching individually.
 *
 * @param ids - Array of Pokemon IDs to fetch
 * @returns Apollo query result with array of pokemon data
 *
 * @example
 * const { data, loading } = usePokemonBasicBulk(ownedPokemonIds);
 * const pokemon = data?.pokemonByIds || [];
 */
export function usePokemonBasicBulk(ids: number[]) {
  return useQuery<PokemonByIdsData, PokemonByIdsVariables>(POKEMON_BY_IDS, {
    variables: {ids},
    skip: !ids || ids.length === 0, // Skip if no IDs provided
  });
}
