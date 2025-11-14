/**
 * Complete list of Pokemon types for filtering and validation
 * Covers all 18 types from Pokemon games
 */
export const POKEMON_TYPES = [
  'normal',
  'fire',
  'water',
  'electric',
  'grass',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'dark',
  'steel',
  'fairy',
] as const;

/**
 * Pokemon region options with their Pokedex ID ranges
 * Used for filtering by generation in the Pokedex
 */
export const POKEMON_REGIONS = [
  {value: 'kanto', label: 'Kanto (1-151)'},
  {value: 'johto', label: 'Johto (152-251)'},
  {value: 'hoenn', label: 'Hoenn (252-386)'},
  {value: 'sinnoh', label: 'Sinnoh (387-493)'},
  {value: 'unova', label: 'Unova (494-649)'},
  {value: 'kalos', label: 'Kalos (650-721)'},
  {value: 'alola', label: 'Alola (722-809)'},
  {value: 'galar', label: 'Galar (810-905)'},
  {value: 'paldea', label: 'Paldea (906-1025)'},
] as const;

export type PokemonType = (typeof POKEMON_TYPES)[number];
export type PokemonRegion = (typeof POKEMON_REGIONS)[number]['value'];
