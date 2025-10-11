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
  };
  owned_pokemon_ids: number[];
}

export interface UserDocument extends UserStats {
  _id: ObjectId;
  username: string;
  password_hash: string;
  created_at: Date;
}

export interface AuthResponse {
  token: string;
  user: Omit<UserDocument, 'password_hash'>;
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
  },
  owned_pokemon_ids: [1], // Start with Bulbasaur (PokéAPI ID: 1)
};
