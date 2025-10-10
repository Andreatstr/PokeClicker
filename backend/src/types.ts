import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;
  username: string;
  password_hash: string;
  created_at: Date;
  rare_candy: number;
  stats: {
    hp: number;
    attack: number;
    defense: number;
    sp_attack: number;
    sp_defense: number;
    speed: number;
  };
  owned_pokemon_ids: number[];
}

export const DEFAULT_USER_STATS = {
  rare_candy: 0,
  stats: {
    hp: 1,
    attack: 1,
    defense: 1,
    sp_attack: 1,
    sp_defense: 1,
    speed: 1,
  },
  owned_pokemon_ids: [],
};
