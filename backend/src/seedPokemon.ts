/**
 * Pokemon metadata seeding script
 *
 * Fetches Pokemon data from PokéAPI and populates the database
 * Also precomputes static filter counts for performance optimization
 *
 * Run with: npm run seed
 *
 * Process:
 * 1. Fetches all Pokemon (1-1025) from PokéAPI in batches
 * 2. Stores name, types, generation, and sprite in database
 * 3. Creates indexes for efficient querying
 * 4. Precomputes static filter counts for type and generation filters
 */
import {connectToDatabase} from './db.js';
import fetch from 'node-fetch';
import {ObjectId} from 'mongodb';

const BASE_URL = 'https://pokeapi.co/api/v2';

/**
 * Pokemon generation ranges
 * Used to classify Pokemon by their region/generation
 */
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

function getGeneration(id: number): string {
  for (const [gen, range] of Object.entries(GENERATION_RANGES)) {
    if (id >= range.start && id <= range.end) {
      return gen;
    }
  }
  return 'unknown';
}

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
}

/**
 * Calculate Base Stat Total from stats array
 */
function calculateBST(
  stats: {base_stat: number; stat: PokeAPIResource}[]
): number {
  return stats.reduce((total, stat) => total + stat.base_stat, 0);
}

/**
 * Calculate Pokemon purchase cost (matches backend formula in resolvers.ts)
 */
function calculatePokemonCost(bst: number): string {
  const baseCost = 150;
  let cost: number;

  if (bst < 600) {
    const exponent = (bst - 200) / 33;
    cost = Math.floor(baseCost * Math.exp(exponent));
  } else {
    const baseExponent = (600 - 200) / 33;
    const costAt600 = baseCost * Math.exp(baseExponent);
    const legendaryExponent = (bst - 600) / 3.8;
    const legendaryMultiplier = Math.exp(legendaryExponent);
    cost = Math.floor(costAt600 * legendaryMultiplier);
  }

  return cost.toString();
}

/**
 * Fetches Pokemon metadata from PokéAPI
 * Extracts fields needed for the Pokedex browser including BST and price
 */
async function fetchPokemonMetadata(id: number) {
  try {
    const response = await fetch(`${BASE_URL}/pokemon/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch Pokemon ${id}: ${response.statusText}`);
    }
    const data = (await response.json()) as PokeAPIPokemon;

    const sprite = data.sprites.front_default || '';
    const bst = calculateBST(data.stats);
    const price = calculatePokemonCost(bst);

    return {
      id: data.id,
      name: data.name,
      types: data.types.map((t) => t.type.name),
      generation: getGeneration(data.id),
      sprite,
      bst,
      price,
    };
  } catch (error) {
    console.error(`Error fetching Pokemon ${id}:`, error);
    return null;
  }
}

async function seedPokemon() {
  console.log('Starting Pokemon metadata seed...');

  const db = await connectToDatabase();
  const collection = db.collection('pokemon_metadata');

  const count = await collection.countDocuments();
  if (count > 0) {
    console.log(
      `Database already contains ${count} Pokemon. Dropping collection to re-seed...`
    );
    await collection.drop();
    console.log('Collection dropped successfully.');
  }

  console.log('Fetching Pokemon metadata from PokéAPI...');

  const pokemonMetadata = [];
  const totalPokemon = 1025;
  const batchSize = 50;

  // Fetch in batches to avoid overwhelming the API
  for (let i = 1; i <= totalPokemon; i += batchSize) {
    const endBatch = Math.min(i + batchSize - 1, totalPokemon);
    console.log(`Fetching Pokemon ${i}-${endBatch}...`);

    const promises = [];
    for (let id = i; id <= endBatch; id++) {
      promises.push(fetchPokemonMetadata(id));
    }

    const batch = await Promise.all(promises);
    const validPokemon = batch.filter((p) => p !== null);
    pokemonMetadata.push(...validPokemon);

    // Rate limiting: small delay between batches
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log(`Inserting ${pokemonMetadata.length} Pokemon into database...`);
  await collection.insertMany(pokemonMetadata);

  console.log('Creating indexes...');
  await collection.createIndex({name: 1});
  await collection.createIndex({generation: 1});
  await collection.createIndex({types: 1});
  await collection.createIndex({id: 1}, {unique: true});
  await collection.createIndex({bst: 1});
  await collection.createIndex({price: 1});

  /**
   * Precompute static filter counts
   * These are used as a fallback when dynamic aggregation is too slow
   * See config.ts for when static vs dynamic counts are used
   */
  console.log('Computing static filter counts...');

  const generationCounts = await collection
    .aggregate([{$group: {_id: '$generation', count: {$sum: 1}}}])
    .toArray();

  const typeCounts = await collection
    .aggregate([
      {$unwind: '$types'},
      {$group: {_id: '$types', count: {$sum: 1}}},
    ])
    .toArray();

  const countsCollection = db.collection('filter_counts');

  const existingCounts = await countsCollection.countDocuments();
  if (existingCounts > 0) {
    console.log('Dropping existing filter_counts collection...');
    await countsCollection.drop();
  }

  // Store global counts for use in filter UI
  await countsCollection.insertOne({
    _id: 'global_counts' as unknown as ObjectId,
    byGeneration: Object.fromEntries(
      generationCounts.map((g) => [g._id, g.count])
    ),
    byType: Object.fromEntries(typeCounts.map((t) => [t._id, t.count])),
    total: await collection.countDocuments({}),
    lastUpdated: new Date(),
  });

  console.log('Static filter counts stored successfully');

  console.log(
    `Successfully seeded ${pokemonMetadata.length} Pokemon with indexes and filter counts!`
  );
  process.exit(0);
}

seedPokemon().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
