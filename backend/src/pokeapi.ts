import {getCachedPokemon, setCachedPokemon} from './cache.js';
import fetch from 'node-fetch';

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
  species: PokeAPIResource;
}

interface PokemonSpecies {
  evolution_chain: {
    url: string;
  };
}

interface EvolutionChainLink {
  species: PokeAPIResource;
  evolves_to: EvolutionChainLink[];
}

interface EvolutionChain {
  chain: EvolutionChainLink;
}

export interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  spAttack: number;
  spDefense: number;
  speed: number;
}

export interface Pokemon {
  id: number;
  name: string;
  types: string[];
  sprite: string;
  stats: PokemonStats;
  height: number;
  weight: number;
  abilities: string[];
  evolution: number[];
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
  return (await response.json()) as T;
}

function extractPokemonIdFromUrl(url: string): number {
  const matches = url.match(/\/pokemon-species\/(\d+)\//);
  return matches ? parseInt(matches[1], 10) : 0;
}

function parseEvolutionChain(chain: EvolutionChainLink): number[] {
  const ids: number[] = [];

  function traverse(link: EvolutionChainLink) {
    const id = extractPokemonIdFromUrl(link.species.url);
    if (id > 0) {
      ids.push(id);
    }
    link.evolves_to.forEach(traverse);
  }

  traverse(chain);
  return ids;
}

async function fetchEvolutionChain(speciesUrl: string): Promise<number[]> {
  try {
    const cacheKey = `evolution:${speciesUrl}`;
    const cached = getCachedPokemon(cacheKey);

    if (cached) {
      return cached as number[];
    }

    const speciesData = await fetchFromAPI<PokemonSpecies>(speciesUrl);
    const evolutionData = await fetchFromAPI<EvolutionChain>(
      speciesData.evolution_chain.url
    );

    const evolutionIds = parseEvolutionChain(evolutionData.chain);
    setCachedPokemon(cacheKey, evolutionIds);

    return evolutionIds;
  } catch (error) {
    console.error('Error fetching evolution chain:', error);
    return [];
  }
}

function transformPokemon(
  data: PokeAPIPokemon,
  evolution: number[] = []
): Pokemon {
  const sprite = data.sprites.front_default || '';

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
    evolution,
  };
}

export async function fetchPokemonById(id: number): Promise<Pokemon> {
  const cacheKey = `pokemon:v2:${id}`;
  const cached = getCachedPokemon(cacheKey);

  if (cached) {
    return cached as Pokemon;
  }

  const data = await fetchFromAPI<PokeAPIPokemon>(`${BASE_URL}/pokemon/${id}`);
  const evolutionChain = await fetchEvolutionChain(data.species.url);
  // Filter out the current Pokemon from the evolution chain
  const evolution = evolutionChain.filter((evoId) => evoId !== id);
  const pokemon = transformPokemon(data, evolution);

  setCachedPokemon(cacheKey, pokemon);

  return pokemon;
}

export async function fetchPokemonByType(
  type: string,
  limit = 20,
  offset = 0
): Promise<{pokemon: Pokemon[]; total: number}> {
  const typeCacheKey = `type:${type.toLowerCase()}:urls`;
  let allPokemonUrls: string[];

  const cachedUrls = getCachedPokemon(typeCacheKey);
  if (cachedUrls) {
    allPokemonUrls = cachedUrls as string[];
  } else {
    const typeData = await fetchFromAPI<{
      pokemon: {pokemon: PokeAPIResource}[];
    }>(`${BASE_URL}/type/${type.toLowerCase()}`);

    allPokemonUrls = typeData.pokemon.map((p) => p.pokemon.url);
    setCachedPokemon(typeCacheKey, allPokemonUrls);
  }

  const total = allPokemonUrls.length;

  const paginatedUrls = allPokemonUrls.slice(offset, offset + limit);

  const pokemonPromises = paginatedUrls.map(async (url) => {
    const data = await fetchFromAPI<PokeAPIPokemon>(url);
    const evolutionChain = await fetchEvolutionChain(data.species.url);
    // Filter out the current Pokemon from the evolution chain
    const evolution = evolutionChain.filter((evoId) => evoId !== data.id);
    return transformPokemon(data, evolution);
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

  // Default: fetch Kanto generation to avoid non-existent Pokemon IDs
  return fetchPokemonByGeneration('kanto', limit, offset);
}
