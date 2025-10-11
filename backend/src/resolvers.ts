import {fetchPokemon, fetchPokemonById, Pokemon} from './pokeapi.js';
import {getDatabase} from './db.js';
import {ObjectId} from 'mongodb';

export const resolvers = {
  Query: {
    health: () => ({
      status: 'OK',
      timestamp: new Date().toISOString(),
    }),
    hello: () => 'Hello from PokéClicker GraphQL API!',
    pokemon: async (
      _: unknown,
      args: {
        type?: string;
        generation?: string;
        limit?: number;
        offset?: number;
      }
    ) => {
      return fetchPokemon(args);
    },
    pokemonById: async (_: unknown, args: {id: number}) => {
      return fetchPokemonById(args.id);
    },
    pokedex: async (
      _: unknown,
      args: {
        search?: string;
        generation?: string;
        type?: string;
        sortBy?: string;
        sortOrder?: string;
        limit?: number;
        offset?: number;
        userId?: string;
      }
    ) => {
      const {
        search,
        generation,
        type,
        sortBy = 'id',
        sortOrder = 'asc',
        limit = 20,
        offset = 0,
        userId,
      } = args;

      let ownedPokemonIds: number[] = [];

      if (userId) {
        try {
          const db = getDatabase();
          const usersCollection = db.collection('users');
          const user = await usersCollection.findOne({
            _id: new ObjectId(userId),
          });

          if (user && user.owned_pokemon_ids) {
            ownedPokemonIds = user.owned_pokemon_ids;
          }
        } catch (error) {
          console.error('Error fetching user owned Pokemon:', error);
        }
      }

      // Query MongoDB for scalable filtering/sorting/pagination
      const db = getDatabase();
      const metadataCollection = db.collection('pokemon_metadata');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const query: any = {};

      if (generation) {
        query.generation = generation.toLowerCase();
      }

      if (type) {
        query.types = type.toLowerCase();
      }

      if (search) {
        query.name = {$regex: search.toLowerCase(), $options: 'i'};
      }

      // Build sort object
      const sort: Record<string, 1 | -1> = {};
      if (sortBy === 'name') {
        sort.name = sortOrder === 'asc' ? 1 : -1;
      } else if (sortBy === 'type') {
        sort['types.0'] = sortOrder === 'asc' ? 1 : -1;
      } else {
        sort.id = sortOrder === 'asc' ? 1 : -1;
      }

      // Get total count for pagination
      const total = await metadataCollection.countDocuments(query);

      // Query MongoDB with filtering, sorting, and pagination
      const pokemonMetadata = await metadataCollection
        .find(query)
        .sort(sort)
        .skip(offset)
        .limit(limit)
        .toArray();

      // Fetch full details only for the paginated Pokemon
      const pokemonPromises = pokemonMetadata.map((meta) =>
        fetchPokemonById(meta.id)
      );
      const paginatedPokemon = await Promise.all(pokemonPromises);

      const pokedexPokemon = paginatedPokemon.map((p: Pokemon) => {
        // If no userId is provided, show all Pokemon as owned for development
        const isOwned = userId ? ownedPokemonIds.includes(p.id) : true;

        if (isOwned) {
          return {
            ...p,
            pokedexNumber: p.id,
            evolution: p.evolution || [],
            isOwned: true,
          };
        } else {
          return {
            id: p.id,
            name: p.name,
            types: p.types,
            sprite:
              'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/0.png',
            pokedexNumber: p.id,
            stats: null,
            height: null,
            weight: null,
            abilities: null,
            evolution: [],
            isOwned: false,
          };
        }
      });

      return {
        pokemon: pokedexPokemon,
        total,
      };
    },
  },
};
