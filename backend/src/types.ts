import {ObjectId} from 'mongodb';

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

export interface UserStats {
  rare_candy: number;
  stats: {
    hp: number;
    attack: number;
    defense: number;
    spAttack: number;
    spDefense: number;
    speed: number;
    // New simplified PokeClicker upgrades:
    clickPower?: number;
    passiveIncome?: number;
  };
  owned_pokemon_ids: number[];
  favorite_pokemon_id?: number;
  selected_pokemon_id?: number;
  showInRanks?: boolean;
}

export interface UserDocument extends UserStats {
  _id: ObjectId;
  username: string;
  password_hash: string;
  created_at: Date;
  showInRanks?: boolean;
}

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

export const DEFAULT_USER_STATS = {
  rare_candy: 0,
  stats: {
    hp: 1,
    attack: 1,
    defense: 1,
    spAttack: 1,
    spDefense: 1,
    speed: 1,
    // New simplified PokeClicker upgrades (start at level 1):
    clickPower: 1,
    passiveIncome: 1,
  },
  owned_pokemon_ids: [1], // Start with Bulbasaur (PokéAPI ID: 1)
};

// Per-Pokemon upgrade document
export interface PokemonUpgradeDocument {
  _id?: ObjectId;
  user_id: ObjectId;
  pokemon_id: number; // PokéAPI ID
  level: number; // Upgrade level (starts at 1)
  created_at: Date;
  updated_at: Date;
}
