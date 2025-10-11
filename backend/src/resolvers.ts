import {fetchPokemon, fetchPokemonById, Pokemon} from './pokeapi.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {getDatabase} from './db.js';
import {DEFAULT_USER_STATS} from './types.js';
import {UserDocument, AuthResponse, PokemonQueryArgs} from './types';
import {Collection, ObjectId} from 'mongodb';
import 'dotenv/config';

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'change_me';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';

function sanitizeUserForClient(userDoc: UserDocument) {
  return {
    _id: userDoc._id,
    username: userDoc.username,
    rare_candy: userDoc.rare_candy ?? 0,
    created_at: userDoc.created_at,
    stats: userDoc.stats,
    owned_pokemon_ids: userDoc.owned_pokemon_ids ?? [],
  };
}

const authMutations = {
  async signup(
    _: unknown,
    {username, password}: {username: string; password: string}
  ): Promise<AuthResponse> {
    if (!username || !password) throw new Error('Missing username or password');
    if (username.length < 3 || username.length > 20)
      throw new Error('Username must be between 3 and 20 characters');
    if (password.length < 6)
      throw new Error('Password must be at least 6 characters');

    const db = getDatabase();
    const users = db.collection('users') as Collection<UserDocument>;

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser: Omit<UserDocument, '_id'> = {
      username,
      password_hash,
      created_at: new Date(),
      rare_candy: DEFAULT_USER_STATS.rare_candy ?? 0,
      stats: DEFAULT_USER_STATS.stats,
      owned_pokemon_ids: DEFAULT_USER_STATS.owned_pokemon_ids ?? [],
    };

    try {
      const insertResult = await users.insertOne(newUser);
      const userDoc = await users.findOne({_id: insertResult.insertedId});

      const token = jwt.sign(
        {id: userDoc._id.toString(), username: userDoc.username},
        JWT_SECRET,
        {expiresIn: JWT_EXPIRES}
      );

      return {token, user: sanitizeUserForClient(userDoc)};
    } catch (err: any) {
      if (err && err.code === 11000) throw new Error('Username already exists');
      console.error('Signup error', err);
      throw new Error('Server error during signup');
    }
  },

  async login(
    _: unknown,
    {username, password}: {username: string; password: string}
  ): Promise<AuthResponse> {
    if (!username || !password) throw new Error('Missing username or password');

    const db = getDatabase();
    const users = db.collection('users');

    const userDoc = await users.findOne({username});
    if (!userDoc) throw new Error('Incorrect username or password');

    const ok = await bcrypt.compare(password, userDoc.password_hash);
    if (!ok) throw new Error('Incorrect username or password');

    const token = jwt.sign(
      {id: userDoc._id.toString(), username: userDoc.username},
      JWT_SECRET,
      {expiresIn: JWT_EXPIRES}
    );

    return {token, user: sanitizeUserForClient(userDoc)};
  },
};

export const resolvers = {
  Query: {
    health: () => ({
      status: 'OK',
      timestamp: new Date().toISOString(),
    }),
    hello: () => 'Hello from PokéClicker GraphQL API!',
    pokemon: async (_: unknown, args: PokemonQueryArgs) => {
      return fetchPokemon(args);
    },
    pokemonById: async (_: unknown, {id}: {id: number}) => {
      return fetchPokemonById(id);
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
  Mutation: {
    ...authMutations,
  },
};
