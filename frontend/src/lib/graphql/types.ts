/**
 * GraphQL Type Definitions
 * Type-safe interfaces for all GraphQL queries and mutations
 */

// ============================================================================
// CORE TYPES
// ============================================================================

/** Pokemon base stat structure */
export interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  spAttack: number;
  spDefense: number;
  speed: number;
}

/** User stat structure with clicker game stats */
export interface UserStats {
  hp: number;
  attack: number;
  defense: number;
  spAttack: number;
  spDefense: number;
  speed: number;
  clickPower?: number;
  autoclicker?: number;
  luckyHitChance?: number;
  luckyHitMultiplier?: number;
  clickMultiplier?: number;
  pokedexBonus?: number;
}

/** Floating candy animation data */
export interface Candy {
  id: number;
  x: number;
  amount: string;
}

/** Complete user profile structure */
export interface User {
  _id: string;
  username: string;
  rare_candy: string;
  created_at: string;
  stats: UserStats;
  owned_pokemon_ids: number[];
  favorite_pokemon_id?: number | null;
  selected_pokemon_id?: number | null;
  showInRanks?: boolean;
  isGuestUser?: boolean;
}

// ============================================================================
// POKEDEX TYPES
// ============================================================================

/** Pokemon data as returned from Pokedex query */
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
  bst?: number | null;
  price?: string | null;
}

/** Faceted search metadata for filter counts */
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
  stats?: PokemonStats;
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
  cost: string;
  user?: {
    _id: string;
    rare_candy: string;
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
    rare_candy: string;
    created_at: string;
    stats: UserStats;
    owned_pokemon_ids: number[];
    favorite_pokemon_id: number | null;
    selected_pokemon_id: number | null;
    showInRanks?: boolean;
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
  isGuestUser?: boolean;
}

// ============================================================================
// USER MUTATION TYPES
// ============================================================================

export interface UpdateRareCandyData {
  updateRareCandy: User;
}

export interface UpdateRareCandyVariables {
  amount: string;
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
  price?: string; // Optional price for optimistic response (not sent to backend)
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
