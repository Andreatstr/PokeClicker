import {ObjectId} from 'mongodb';

/**
 * Backend Type Definitions
 * Database models and API types for MongoDB and GraphQL
 */

// NOTE: Legacy User interface - kept for reference during migration
// export interface User {
//   _id?: ObjectId;
//   username: string;
//   password_hash: string;
//   created_at: Date;
//   rare_candy: number;
//   stats: {
//     hp: number;
//     attack: number;
//     defense: number;
//     sp_attack: number;
//     sp_defense: number;
//     speed: number;
//   };
//   owned_pokemon_ids: number[];
// }

/** User statistics and game state (subset of UserDocument) */
export interface UserStats {
  rare_candy: string;
  stats: {
    hp: number;
    attack: number;
    defense: number;
    spAttack: number;
    spDefense: number;
    speed: number;
    // PokeClicker upgrades:
    clickPower?: number;
    autoclicker?: number;
    luckyHitChance?: number;
    luckyHitMultiplier?: number;
    clickMultiplier?: number;
    pokedexBonus?: number;
  };
  owned_pokemon_ids: number[];
  favorite_pokemon_id?: number;
  selected_pokemon_id?: number;
  showInRanks?: boolean;
}

/** Complete user document as stored in MongoDB */
export interface UserDocument extends UserStats {
  _id: ObjectId;
  username: string;
  password_hash: string;
  created_at: Date;
  showInRanks?: boolean;
  isGuestUser?: boolean;
}

/** Authentication response with JWT token and user data */
export interface AuthResponse {
  token: string;
  user: Omit<UserDocument, 'password_hash' | 'created_at'> & {
    created_at: string;
  };
}

export interface PokemonQueryArgs {
  type?: string;
  generation?: string;
  limit?: number;
  offset?: number;
}

/** Initial stats for new users - all stats start at level 1 */
export const DEFAULT_USER_STATS = {
  rare_candy: '0',
  stats: {
    hp: 1,
    attack: 1,
    defense: 1,
    spAttack: 1,
    spDefense: 1,
    speed: 1,
    // PokeClicker upgrades:
    clickPower: 1,
    autoclicker: 1,
    luckyHitChance: 1,
    luckyHitMultiplier: 1,
    clickMultiplier: 1,
    pokedexBonus: 1,
  },
  owned_pokemon_ids: [746], // Start with Wishiwashi (PokéAPI ID: 746)
  favorite_pokemon_id: 746, // Wishiwashi for battles
  selected_pokemon_id: 746, // Wishiwashi for clicker
};

/** Per-Pokemon upgrade document tracking individual Pokemon power-ups */
export interface PokemonUpgradeDocument {
  _id?: ObjectId;
  user_id: ObjectId;
  pokemon_id: number; // PokéAPI ID
  level: number; // Upgrade level (starts at 1)
  created_at: Date;
  updated_at: Date;
}
