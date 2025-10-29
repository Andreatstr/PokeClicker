import {gql} from '@apollo/client';

/**
 * Shared GraphQL fragment for user data
 * Used across all mutations and queries that return user information
 */
export const USER_FRAGMENT = gql`
  fragment UserFields on User {
    _id
    username
    rare_candy
    created_at
    stats {
      hp
      attack
      defense
      spAttack
      spDefense
      speed
      clickPower
      passiveIncome
    }
    owned_pokemon_ids
    favorite_pokemon_id
    selected_pokemon_id
  }
`;

/**
 * Shared GraphQL fragment for Pokemon stats
 * Used in Pokemon queries
 */
export const POKEMON_STATS_FRAGMENT = gql`
  fragment PokemonStatsFields on PokemonStats {
    hp
    attack
    defense
    spAttack
    spDefense
    speed
  }
`;
