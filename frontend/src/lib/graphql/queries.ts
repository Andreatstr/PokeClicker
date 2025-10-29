import {gql} from '@apollo/client';
import {POKEMON_STATS_FRAGMENT} from './fragments';

/**
 * Centralized GraphQL Queries
 * All queries used across the application are defined here for better organization and reusability
 */

// ============================================================================
// POKEDEX QUERIES
// ============================================================================

/**
 * Query to fetch paginated Pokemon list with filtering and sorting
 */
export const POKEDEX_QUERY = gql`
  ${POKEMON_STATS_FRAGMENT}
  query Pokedex(
    $search: String
    $generation: String
    $type: String
    $sortBy: String
    $sortOrder: String
    $limit: Int
    $offset: Int
    $userId: String
    $ownedOnly: Boolean
  ) {
    pokedex(
      search: $search
      generation: $generation
      type: $type
      sortBy: $sortBy
      sortOrder: $sortOrder
      limit: $limit
      offset: $offset
      userId: $userId
      ownedOnly: $ownedOnly
    ) {
      pokemon {
        id
        name
        types
        sprite
        pokedexNumber
        stats {
          ...PokemonStatsFields
        }
        height
        weight
        abilities
        evolution
        isOwned
      }
      total
    }
  }
`;

/**
 * Query to fetch detailed information for a single Pokemon by ID
 */
export const POKEMON_BY_ID_QUERY = gql`
  ${POKEMON_STATS_FRAGMENT}
  query PokemonById($id: Int!) {
    pokemonById(id: $id) {
      id
      name
      types
      sprite
      stats {
        ...PokemonStatsFields
      }
      height
      weight
      abilities
      evolution
      isOwned
      pokedexNumber
    }
  }
`;

/**
 * Lightweight query for basic Pokemon info (profile display, selectors)
 */
export const POKEMON_BY_ID_BASIC = gql`
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
export const POKEMON_BY_IDS = gql`
  query PokemonByIds($ids: [Int!]!) {
    pokemonByIds(ids: $ids) {
      id
      name
      sprite
      types
    }
  }
`;

// ============================================================================
// POKEMON UPGRADE QUERIES
// ============================================================================

/**
 * Query to get Pokemon upgrade information (level and cost)
 */
export const POKEMON_UPGRADE_QUERY = gql`
  query PokemonUpgrade($pokemonId: Int!) {
    pokemonUpgrade(pokemonId: $pokemonId) {
      pokemon_id
      level
      cost
    }
  }
`;

// ============================================================================
// USER QUERIES
// ============================================================================

/**
 * Query to fetch current user health check (used for auth verification)
 */
export const HEALTH_QUERY = gql`
  query Health {
    health {
      status
      timestamp
    }
  }
`;
