import {connectToDatabase} from './db.js';
import fetch from 'node-fetch';
import {ObjectId} from 'mongodb';

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
}

async function fetchPokemonMetadata(id: number) {
  try {
    const response = await fetch(`${BASE_URL}/pokemon/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch Pokemon ${id}: ${response.statusText}`);
    }
    const data = (await response.json()) as PokeAPIPokemon;

    const sprite = data.sprites.front_default || '';

    return {
      id: data.id,
      name: data.name,
      types: data.types.map((t) => t.type.name),
      generation: getGeneration(data.id),
      sprite,
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

  // Check if already seeded
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

    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log(`Inserting ${pokemonMetadata.length} Pokemon into database...`);
  await collection.insertMany(pokemonMetadata);

  // Create indexes for efficient querying
  console.log('Creating indexes...');
  await collection.createIndex({name: 1});
  await collection.createIndex({generation: 1});
  await collection.createIndex({types: 1});
  await collection.createIndex({id: 1}, {unique: true});

  // Compute and store static filter counts for large dataset fallback
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

  // Drop existing filter_counts collection if it exists
  const existingCounts = await countsCollection.countDocuments();
  if (existingCounts > 0) {
    console.log('Dropping existing filter_counts collection...');
    await countsCollection.drop();
  }

  // Insert new counts
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
