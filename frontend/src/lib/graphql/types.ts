/**
 * Centralized GraphQL TypeScript Types
 * All types for queries, mutations, and their variables are defined here
 */

// ============================================================================
// SHARED TYPES
// ============================================================================

export interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  spAttack: number;
  spDefense: number;
  speed: number;
}

// ============================================================================
// POKEDEX TYPES
// ============================================================================

export interface PokedexPokemon {
  id: number;
  name: string;
  types: string[];
  sprite: string;
  pokedexNumber: number;
  stats?: PokemonStats | null;
  height?: number | null;
  weight?: number | null;
  abilities?: string[] | null;
  evolution?: number[] | null;
  isOwned?: boolean;
}

export interface FilterFacets {
  byGeneration: Array<{generation: string; count: number}>;
  byType: Array<{type: string; count: number}>;
  isDynamic: boolean;
  ownedCount: number;
  totalCount: number;
}

export interface PokedexData {
  pokedex: {
    pokemon: PokedexPokemon[];
    total: number;
    facets?: FilterFacets | null;
  };
}

export interface PokedexVariables {
  search?: string;
  generation?: string;
  types?: string[];
  sortBy?: string;
  sortOrder?: string;
  limit?: number;
  offset?: number;
  userId?: string;
  ownedOnly?: boolean;
}

// ============================================================================
// POKEMON BY ID TYPES
// ============================================================================

export interface PokemonById {
  id: number;
  name: string;
  types: string[];
  sprite: string;
  stats: PokemonStats;
  height: number;
  weight: number;
  abilities: string[];
  evolution: number[];
  isOwned: boolean;
  pokedexNumber: number;
}

export interface PokemonByIdData {
  pokemonById: PokemonById | null;
}

export interface PokemonByIdVariables {
  id: number;
}

// ============================================================================
// POKEMON BASIC TYPES (for profile)
// ============================================================================

export interface PokemonBasic {
  id: number;
  name: string;
  sprite: string;
  types: string[];
}

export interface PokemonByIdBasicData {
  pokemonById: PokemonBasic | null;
}

export interface PokemonByIdsData {
  pokemonByIds: PokemonBasic[];
}

export interface PokemonByIdsVariables {
  ids: number[];
}

// ============================================================================
// POKEMON UPGRADE TYPES
// ============================================================================

export interface PokemonUpgrade {
  pokemon_id: number;
  level: number;
  cost: number;
  user?: {
    _id: string;
    rare_candy: number;
  };
}

export interface PokemonUpgradeData {
  pokemonUpgrade: PokemonUpgrade;
}

export interface PokemonUpgradeVariables {
  pokemonId: number;
}

export interface UpgradePokemonData {
  upgradePokemon: PokemonUpgrade;
}

// ============================================================================
// AUTH TYPES
// ============================================================================

export interface AuthResponse {
  token: string;
  user: {
    _id: string;
    username: string;
    rare_candy: number;
    created_at: string;
    stats: {
      hp: number;
      attack: number;
      defense: number;
      spAttack: number;
      spDefense: number;
      speed: number;
      clickPower: number;
      passiveIncome: number;
    };
    owned_pokemon_ids: number[];
    favorite_pokemon_id: number | null;
    selected_pokemon_id: number | null;
    showInLeaderboard?: boolean;
  };
}

export interface LoginData {
  login: AuthResponse;
}

export interface SignupData {
  signup: AuthResponse;
}

export interface AuthVariables {
  username: string;
  password: string;
}

// ============================================================================
// USER MUTATION TYPES
// ============================================================================

export interface User {
  _id: string;
  username: string;
  rare_candy: number;
  created_at: string;
  stats: {
    hp: number;
    attack: number;
    defense: number;
    spAttack: number;
    spDefense: number;
    speed: number;
    clickPower: number;
    passiveIncome: number;
  };
  owned_pokemon_ids: number[];
  favorite_pokemon_id: number | null;
  selected_pokemon_id: number | null;
  showInLeaderboard?: boolean;
}

export interface UpdateRareCandyData {
  updateRareCandy: User;
}

export interface UpdateRareCandyVariables {
  amount: number;
}

export interface UpgradeStatData {
  upgradeStat: User;
}

export interface UpgradeStatVariables {
  stat: string;
}

// ============================================================================
// POKEMON PURCHASE/CATCH TYPES
// ============================================================================

export interface PurchasePokemonData {
  purchasePokemon: User;
}

export interface PurchasePokemonVariables {
  pokemonId: number;
}

export interface CatchPokemonData {
  catchPokemon: User;
}

export interface CatchPokemonVariables {
  pokemonId: number;
}

// ============================================================================
// PROFILE MUTATION TYPES
// ============================================================================

export interface SetFavoritePokemonData {
  setFavoritePokemon: User;
}

export interface SetSelectedPokemonData {
  setSelectedPokemon: User;
}

export interface PokemonIdVariables {
  pokemonId: number | null;
}

export interface DeleteUserData {
  deleteUser: boolean;
}
