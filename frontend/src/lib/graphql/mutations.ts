import {gql} from '@apollo/client';
import {USER_FRAGMENT} from './fragments';

/**
 * Centralized GraphQL Mutations
 * All mutations used across the application are defined here for better organization and reusability
 */

// ============================================================================
// AUTH MUTATIONS
// ============================================================================

/**
 * Mutation to log in a user with username and password
 */
export const LOGIN_MUTATION = gql`
  ${USER_FRAGMENT}
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
      user {
        ...UserFields
      }
    }
  }
`;

export const SIGNUP_MUTATION = gql`
  ${USER_FRAGMENT}
  mutation Signup(
    $username: String!
    $password: String!
    $isGuestUser: Boolean
  ) {
    signup(
      username: $username
      password: $password
      isGuestUser: $isGuestUser
    ) {
      token
      user {
        ...UserFields
      }
    }
  }
`;

// ============================================================================
// CLICKER GAME MUTATIONS
// ============================================================================

/**
 * Mutation to update user's rare candy count
 */
export const UPDATE_RARE_CANDY_MUTATION = gql`
  ${USER_FRAGMENT}
  mutation UpdateRareCandy($amount: String!) {
    updateRareCandy(amount: $amount) {
      ...UserFields
    }
  }
`;

/**
 * Mutation to upgrade a user stat (hp, attack, defense, etc.)
 */
export const UPGRADE_STAT_MUTATION = gql`
  ${USER_FRAGMENT}
  mutation UpgradeStat($stat: String!) {
    upgradeStat(stat: $stat) {
      ...UserFields
    }
  }
`;

// ============================================================================
// POKEDEX MUTATIONS
// ============================================================================

/**
 * Mutation to purchase a Pokemon with rare candy
 */
export const PURCHASE_POKEMON_MUTATION = gql`
  ${USER_FRAGMENT}
  mutation PurchasePokemon($pokemonId: Int!) {
    purchasePokemon(pokemonId: $pokemonId) {
      ...UserFields
    }
  }
`;

/**
 * Mutation to catch a Pokemon (from map/battle)
 */
export const CATCH_POKEMON_MUTATION = gql`
  ${USER_FRAGMENT}
  mutation CatchPokemon($pokemonId: Int!) {
    catchPokemon(pokemonId: $pokemonId) {
      ...UserFields
    }
  }
`;

/**
 * Mutation to upgrade a Pokemon's level
 */
export const UPGRADE_POKEMON_MUTATION = gql`
  mutation UpgradePokemon($pokemonId: Int!) {
    upgradePokemon(pokemonId: $pokemonId) {
      pokemon_id
      level
      cost
      user {
        _id
        rare_candy
      }
    }
  }
`;

// ============================================================================
// PROFILE MUTATIONS
// ============================================================================

/**
 * Mutation to delete user account
 */
export const DELETE_USER_MUTATION = gql`
  mutation DeleteUser {
    deleteUser
  }
`;

/**
 * Mutation to set user's favorite Pokemon
 */
export const SET_FAVORITE_POKEMON_MUTATION = gql`
  ${USER_FRAGMENT}
  mutation SetFavoritePokemon($pokemonId: Int) {
    setFavoritePokemon(pokemonId: $pokemonId) {
      ...UserFields
    }
  }
`;

/**
 * Mutation to set user's selected Pokemon for clicker display
 */
export const SET_SELECTED_POKEMON_MUTATION = gql`
  ${USER_FRAGMENT}
  mutation SetSelectedPokemon($pokemonId: Int) {
    setSelectedPokemon(pokemonId: $pokemonId) {
      ...UserFields
    }
  }
`;

export const UPDATE_RANKS_PREFERENCE = gql`
  ${USER_FRAGMENT}
  mutation UpdateRanksPreference($showInRanks: Boolean!) {
    updateRanksPreference(showInRanks: $showInRanks) {
      ...UserFields
    }
  }
`;
