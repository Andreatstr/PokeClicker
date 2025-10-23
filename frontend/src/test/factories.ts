import type { User } from '@features/auth'
import type { PokedexPokemon } from '@features/pokedex'

export const createMockUser = (overrides = {}): User => ({
  _id: '1',
  username: 'testuser',
  rare_candy: 1000,
  created_at: '2024-01-01T00:00:00Z',
  stats: {
    hp: 100,
    attack: 50,
    defense: 50,
    spAttack: 50,
    spDefense: 50,
    speed: 50,
  },
  owned_pokemon_ids: [1, 2, 3],
  ...overrides,
})

export const createMockPokemon = (overrides = {}): PokedexPokemon => ({
  id: 1,
  name: 'bulbasaur',
  types: ['grass', 'poison'],
  sprite: 'https://example.com/bulbasaur.png',
  pokedexNumber: 1,
  stats: {
    hp: 45,
    attack: 49,
    defense: 49,
    spAttack: 65,
    spDefense: 65,
    speed: 45,
  },
  height: 0.7,
  weight: 6.9,
  abilities: ['overgrow', 'chlorophyll'],
  evolution: [2, 3],
  isOwned: false,
  ...overrides,
})

export const createMockApolloResponse = (data: any) => ({
  data,
  loading: false,
  error: undefined,
})
