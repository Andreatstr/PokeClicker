/**
 * Centralized GraphQL exports
 * Import all GraphQL operations and types from this file
 */

// Fragments
export {USER_FRAGMENT, POKEMON_STATS_FRAGMENT} from './fragments';

// Queries
export {
  POKEDEX_QUERY,
  POKEMON_BY_ID_QUERY,
  POKEMON_BY_ID_BASIC,
  POKEMON_BY_IDS,
  POKEMON_UPGRADE_QUERY,
  HEALTH_QUERY,
  GET_RANKS,
} from './queries';

// Mutations
export {
  LOGIN_MUTATION,
  SIGNUP_MUTATION,
  UPDATE_RARE_CANDY_MUTATION,
  UPGRADE_STAT_MUTATION,
  PURCHASE_POKEMON_MUTATION,
  CATCH_POKEMON_MUTATION,
  UPGRADE_POKEMON_MUTATION,
  DELETE_USER_MUTATION,
  SET_FAVORITE_POKEMON_MUTATION,
  SET_SELECTED_POKEMON_MUTATION,
  UPDATE_RANKS_PREFERENCE,
} from './mutations';

// Types
export type {
  PokemonStats,
  PokedexPokemon,
  PokedexData,
  PokedexVariables,
  FilterFacets,
  PokemonById,
  PokemonByIdData,
  PokemonByIdVariables,
  PokemonBasic,
  PokemonByIdBasicData,
  PokemonByIdsData,
  PokemonByIdsVariables,
  PokemonUpgrade,
  PokemonUpgradeData,
  PokemonUpgradeVariables,
  UpgradePokemonData,
  AuthResponse,
  LoginData,
  SignupData,
  AuthVariables,
  User,
  UpdateRareCandyData,
  UpdateRareCandyVariables,
  UpgradeStatData,
  UpgradeStatVariables,
  PurchasePokemonData,
  PurchasePokemonVariables,
  CatchPokemonData,
  CatchPokemonVariables,
  SetFavoritePokemonData,
  SetSelectedPokemonData,
  PokemonIdVariables,
  DeleteUserData,
} from './types';
