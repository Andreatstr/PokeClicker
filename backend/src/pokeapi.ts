interface PokeAPIResource {
  name: string;
  url: string;
}

interface PokeAPIPokemon {
  id: number;
  name: string;
  types: {
    slot: number;
    type: PokeAPIResource;
  }[];
  sprites: {
    front_default: string | null;
    other?: {
      'official-artwork'?: {
        front_default: string | null;
      };
    };
  };
  stats: {
    base_stat: number;
    stat: PokeAPIResource;
  }[];
  height: number;
  weight: number;
  abilities: {
    ability: PokeAPIResource;
    is_hidden: boolean;
  }[];
}

interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokeAPIResource[];
}

export interface Pokemon {
  id: number;
  name: string;
  types: string[];
  sprite: string;
  stats: {
    hp: number;
    attack: number;
    defense: number;
    spAttack: number;
    spDefense: number;
    speed: number;
  };
  height: number;
  weight: number;
  abilities: string[];
}

const BASE_URL = 'https://pokeapi.co/api/v2';

const GENERATION_RANGES: Record<string, {start: number; end: number}> = {
  kanto: {start: 1, end: 151},
  johto: {start: 152, end: 251},
  hoenn: {start: 252, end: 386},
  sinnoh: {start: 387, end: 493},
  unova: {start: 494, end: 649},
  kalos: {start: 650, end: 721},
  alola: {start: 722, end: 809},
  galar: {start: 810, end: 905},
  paldea: {start: 906, end: 1025},
};

async function fetchFromAPI<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`PokéAPI request failed: ${response.statusText}`);
  }
  return response.json();
}

function transformPokemon(data: PokeAPIPokemon): Pokemon {
  const sprite =
    data.sprites.other?.['official-artwork']?.front_default ||
    data.sprites.front_default ||
    '';

  const statsMap: Record<string, number> = {};
  data.stats.forEach((s) => {
    statsMap[s.stat.name] = s.base_stat;
  });

  return {
    id: data.id,
    name: data.name,
    types: data.types.map((t) => t.type.name),
    sprite,
    stats: {
      hp: statsMap['hp'] || 0,
      attack: statsMap['attack'] || 0,
      defense: statsMap['defense'] || 0,
      spAttack: statsMap['special-attack'] || 0,
      spDefense: statsMap['special-defense'] || 0,
      speed: statsMap['speed'] || 0,
    },
    height: data.height,
    weight: data.weight,
    abilities: data.abilities.map((a) => a.ability.name),
  };
}

export async function fetchPokemonById(id: number): Promise<Pokemon> {
  const data = await fetchFromAPI<PokeAPIPokemon>(
    `${BASE_URL}/pokemon/${id}`
  );
  return transformPokemon(data);
}

export async function fetchPokemonByType(
  type: string,
  limit = 20,
  offset = 0
): Promise<{pokemon: Pokemon[]; total: number}> {
  const typeData = await fetchFromAPI<{
    pokemon: {pokemon: PokeAPIResource}[];
  }>(`${BASE_URL}/type/${type.toLowerCase()}`);

  const allPokemonUrls = typeData.pokemon.map((p) => p.pokemon.url);
  const total = allPokemonUrls.length;

  // Apply pagination
  const paginatedUrls = allPokemonUrls.slice(offset, offset + limit);

  // Fetch detailed data for each Pokémon
  const pokemonPromises = paginatedUrls.map(async (url) => {
    const data = await fetchFromAPI<PokeAPIPokemon>(url);
    return transformPokemon(data);
  });

  const pokemon = await Promise.all(pokemonPromises);

  return {pokemon, total};
}

export async function fetchPokemonByGeneration(
  generation: string,
  limit = 20,
  offset = 0
): Promise<{pokemon: Pokemon[]; total: number}> {
  const range = GENERATION_RANGES[generation.toLowerCase()];
  if (!range) {
    throw new Error(`Unknown generation: ${generation}`);
  }

  const total = range.end - range.start + 1;
  const startId = range.start + offset;
  const endId = Math.min(startId + limit, range.end + 1);

  const pokemonPromises: Promise<Pokemon>[] = [];
  for (let id = startId; id < endId; id++) {
    pokemonPromises.push(fetchPokemonById(id));
  }

  const pokemon = await Promise.all(pokemonPromises);

  return {pokemon, total};
}

export async function fetchPokemon(
  filters: {
    type?: string;
    generation?: string;
    limit?: number;
    offset?: number;
  } = {}
): Promise<{pokemon: Pokemon[]; total: number}> {
  const {type, generation, limit = 20, offset = 0} = filters;

  if (type) {
    return fetchPokemonByType(type, limit, offset);
  }

  if (generation) {
    return fetchPokemonByGeneration(generation, limit, offset);
  }

  // Default: fetch by range (no filter)
  const startId = 1 + offset;
  const endId = startId + limit;

  const pokemonPromises: Promise<Pokemon>[] = [];
  for (let id = startId; id < endId; id++) {
    pokemonPromises.push(fetchPokemonById(id));
  }

  const pokemon = await Promise.all(pokemonPromises);

  // Total known Pokémon (approximate - could fetch from API if needed)
  return {pokemon, total: 1025};
}
