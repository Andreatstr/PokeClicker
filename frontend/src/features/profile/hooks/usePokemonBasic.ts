import {useQuery, gql} from '@apollo/client';

/**
 * Lightweight query for basic Pokemon info (profile display, selectors)
 */
const POKEMON_BY_ID_BASIC = gql`
  query PokemonByIdBasic($id: Int!) {
    pokemonById(id: $id) {
      id
      name
      sprite
      types
    }
  }
`;

/**
 * Bulk query for multiple Pokemon (selector dialogs)
 */
const POKEMON_BY_IDS = gql`
  query PokemonByIds($ids: [Int!]!) {
    pokemonByIds(ids: $ids) {
      id
      name
      sprite
      types
    }
  }
`;

export interface PokemonBasic {
  id: number;
  name: string;
  sprite: string;
  types: string[];
}

/**
 * Hook to fetch basic Pokemon data by ID for Profile displays
 */
export function usePokemonBasic(id: number | null | undefined) {
  return useQuery<{pokemonById: PokemonBasic | null}>(POKEMON_BY_ID_BASIC, {
    variables: {id},
    skip: !id,
  });
}

/**
 * Hook to fetch multiple Pokemon basic data by IDs for Profile selectors
 */
export function usePokemonBasicBulk(ids: number[]) {
  return useQuery<{pokemonByIds: PokemonBasic[]}>(POKEMON_BY_IDS, {
    variables: {ids},
    skip: !ids || ids.length === 0,
  });
}
