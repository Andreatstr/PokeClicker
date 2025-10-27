import {fetchPokemon, fetchPokemonById, Pokemon} from './pokeapi.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {getDatabase} from './db.js';
import {DEFAULT_USER_STATS} from './types.js';
import {UserDocument, AuthResponse, PokemonQueryArgs} from './types';
import {Collection, ObjectId} from 'mongodb';
import {type AuthContext, requireAuth} from './auth.js';
import 'dotenv/config';

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in environment variables');
}
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';

function sanitizeUserForClient(
  userDoc: UserDocument
): Omit<UserDocument, 'password_hash' | 'created_at'> & {created_at: string} {
  return {
    _id: userDoc._id,
    username: userDoc.username,
    rare_candy: userDoc.rare_candy ?? 0,
    created_at: userDoc.created_at?.toISOString() ?? new Date().toISOString(),
    stats: userDoc.stats,
    owned_pokemon_ids: userDoc.owned_pokemon_ids ?? [],
    favorite_pokemon_id: userDoc.favorite_pokemon_id,
    selected_pokemon_id: userDoc.selected_pokemon_id,
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
      owned_pokemon_ids: [1], // DEFAULT_USER_STATS.owned_pokemon_ids ?? [],
    };

    try {
      const insertResult = await users.insertOne(newUser as UserDocument);
      const userDoc = await users.findOne({_id: insertResult.insertedId});

      if (!userDoc) {
        throw new Error('Failed to create user');
      }

      const token = jwt.sign(
        {id: userDoc._id.toString(), username: userDoc.username},
        JWT_SECRET,
        {expiresIn: JWT_EXPIRES} as jwt.SignOptions
      );

      return {token, user: sanitizeUserForClient(userDoc as UserDocument)};
    } catch (err) {
      if (
        err &&
        typeof err === 'object' &&
        'code' in err &&
        err.code === 11000
      ) {
        throw new Error('Username already exists');
      }
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
      {expiresIn: JWT_EXPIRES} as jwt.SignOptions
    );

    return {token, user: sanitizeUserForClient(userDoc as UserDocument)};
  },
};

// Helper to get upgrade cost (differentiated by stat type)
function getUpgradeCost(currentLevel: number, stat: string): number {
  // Different multipliers for different stat types:
  // Attack/SpAttack: 2.8x (most expensive, highest reward)
  // HP/Defense/SpDefense: 2.5x (moderate cost)
  // Speed: 2.2x (cheapest, utility stat)
  let multiplier = 2.5; // default

  if (stat === 'attack' || stat === 'spAttack') {
    multiplier = 2.8;
  } else if (stat === 'speed') {
    multiplier = 2.2;
  }

  return Math.floor(10 * Math.pow(multiplier, currentLevel - 1));
}

// Helper to get Pokemon purchase cost
function getPokemonCost(pokemonId: number): number {
  // Exponential pricing by tier: 100 × 2^(tier)
  // Pokemon are grouped into tiers of 10
  // Tier 0 (ID 1-10): 100, Tier 1 (ID 11-20): 200, Tier 2 (ID 21-30): 400, etc.
  const tier = Math.floor(pokemonId / 10);
  return Math.floor(100 * Math.pow(2, tier));
}

export const resolvers = {
  Query: {
    health: () => ({
      status: 'OK',
      timestamp: new Date().toISOString(),
    }),
    hello: () => 'Hello from PokéClicker GraphQL API!',
    me: async (_: unknown, __: unknown, context: AuthContext) => {
      // Protected query - requires valid authentication token
      const user = requireAuth(context);

      const db = getDatabase();
      const users = db.collection('users');
      const userDoc = await users.findOne({_id: new ObjectId(user.id)});

      if (!userDoc) {
        throw new Error('User not found');
      }

      return sanitizeUserForClient(userDoc as UserDocument);
    },
    pokemon: async (_: unknown, args: PokemonQueryArgs) => {
      return fetchPokemon(args);
    },
    pokemonById: async (
      _: unknown,
      {id}: {id: number},
      context: AuthContext
    ) => {
      const pokemon = await fetchPokemonById(id);
      if (!pokemon) return null;

      // Check if user owns this Pokemon
      let isOwned = false;
      if (context.user?.id) {
        try {
          const db = getDatabase();
          const users = db.collection('users');
          const user = await users.findOne({_id: new ObjectId(context.user.id)});
          if (user && user.owned_pokemon_ids) {
            isOwned = user.owned_pokemon_ids.includes(id);
          }
        } catch (error) {
          console.error('Error checking Pokemon ownership:', error);
        }
      }

      return {
        ...pokemon,
        isOwned,
        pokedexNumber: pokemon.id,
      };
    },
    pokemonByIds: async (
      _: unknown,
      {ids}: {ids: number[]},
      context: AuthContext
    ) => {
      // Fetch all Pokemon in parallel
      const pokemonPromises = ids.map((id) => fetchPokemonById(id));
      const pokemon = await Promise.all(pokemonPromises);

      // Get owned Pokemon IDs if user is authenticated
      let ownedPokemonIds: number[] = [];
      if (context.user?.id) {
        try {
          const db = getDatabase();
          const users = db.collection('users');
          const user = await users.findOne({_id: new ObjectId(context.user.id)});
          if (user && user.owned_pokemon_ids) {
            ownedPokemonIds = user.owned_pokemon_ids;
          }
        } catch (error) {
          console.error('Error fetching user owned Pokemon:', error);
        }
      }

      // Filter out any null results and add ownership info
      return pokemon.filter(Boolean).map((p) => ({
        ...p,
        isOwned: ownedPokemonIds.includes(p.id),
        pokedexNumber: p.id,
      }));
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
        ownedOnly?: boolean;
      },
      context: AuthContext
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
        ownedOnly = false,
      } = args;

      let ownedPokemonIds: number[] = [];

      // Use authenticated user if available, otherwise fall back to userId parameter
      const effectiveUserId = context.user?.id || userId;

      if (effectiveUserId) {
        try {
          const db = getDatabase();
          const usersCollection = db.collection('users');
          const user = await usersCollection.findOne({
            _id: new ObjectId(effectiveUserId),
          });

          if (user && Array.isArray(user.owned_pokemon_ids)) {
            ownedPokemonIds = user.owned_pokemon_ids.map((v: any) => Number(v)).filter(Number.isFinite);
          }
        } catch (error) {
          console.error('Error fetching user owned Pokemon:', error);
        }
      }

      if (ownedOnly && !effectiveUserId) {
        return {
          pokemon: [],
          total: 0,
        };
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

      if (ownedOnly) {
        if (!ownedPokemonIds || ownedPokemonIds.length === 0) {
          return {
            pokemon: [],
            total: 0,
          };
        }
        query.id = { $in: ownedPokemonIds };
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
        // If no user is authenticated, guest users see Pokemon as unowned
        const isOwned = effectiveUserId
          ? (ownedPokemonIds ?? []).includes(p.id)
          : false;

        // Return full Pokemon data regardless of ownership status
        // The isOwned flag allows frontend to show ownership indicators
        return {
          ...p,
          pokedexNumber: p.id,
          evolution: p.evolution || [],
          isOwned,
        };
      });

      return {
        pokemon: pokedexPokemon,
        total,
      };
    },
  },
  Mutation: {
    ...authMutations,

    // Update rare candy count (increment/decrement by amount)
    updateRareCandy: async (
      _: unknown,
      {amount}: {amount: number},
      context: AuthContext
    ) => {
      const user = requireAuth(context);

      const db = getDatabase();
      const users = db.collection('users') as Collection<UserDocument>;

      // Update rare candy atomically
      const result = await users.findOneAndUpdate(
        {_id: new ObjectId(user.id)},
        {$inc: {rare_candy: amount}},
        {returnDocument: 'after'}
      );

      if (!result) {
        throw new Error('User not found');
      }

      return sanitizeUserForClient(result);
    },

    // Upgrade a specific stat
    upgradeStat: async (
      _: unknown,
      {stat}: {stat: string},
      context: AuthContext
    ) => {
      const user = requireAuth(context);

      // Validate stat name
      const validStats = [
        'hp',
        'attack',
        'defense',
        'spAttack',
        'spDefense',
        'speed',
      ];
      if (!validStats.includes(stat)) {
        throw new Error(
          `Invalid stat: ${stat}. Must be one of: ${validStats.join(', ')}`
        );
      }

      const db = getDatabase();
      const users = db.collection('users') as Collection<UserDocument>;

      // Get current user state
      const userDoc = await users.findOne({_id: new ObjectId(user.id)});
      if (!userDoc) {
        throw new Error('User not found');
      }

      // Calculate cost
      const currentLevel = userDoc.stats[stat as keyof typeof userDoc.stats];
      const cost = getUpgradeCost(currentLevel, stat);

      // Check if user has enough rare candy
      if (userDoc.rare_candy < cost) {
        throw new Error(
          `Not enough rare candy. Need ${cost}, have ${userDoc.rare_candy}`
        );
      }

      // Update stat and deduct cost atomically
      const result = await users.findOneAndUpdate(
        {_id: new ObjectId(user.id)},
        {
          $inc: {
            [`stats.${stat}`]: 1,
            rare_candy: -cost,
          },
        },
        {returnDocument: 'after'}
      );

      if (!result) {
        throw new Error('Failed to upgrade stat');
      }

      return sanitizeUserForClient(result);
    },

    // Purchase a Pokemon
    purchasePokemon: async (
      _: unknown,
      {pokemonId}: {pokemonId: number},
      context: AuthContext
    ) => {
      const user = requireAuth(context);

      const db = getDatabase();
      const users = db.collection('users') as Collection<UserDocument>;

      // Get current user state
      const userDoc = await users.findOne({_id: new ObjectId(user.id)});
      if (!userDoc) {
        throw new Error('User not found');
      }

      // Check if user already owns this Pokemon
      if (
        userDoc.owned_pokemon_ids &&
        userDoc.owned_pokemon_ids.includes(pokemonId)
      ) {
        throw new Error('You already own this Pokémon');
      }

      // Calculate cost
      const cost = getPokemonCost(pokemonId);

      // Check if user has enough rare candy
      if (userDoc.rare_candy < cost) {
        throw new Error(`Not enough candy.`);
      }

      // Purchase Pokemon atomically: deduct rare candy and add to owned list
      const result = await users.findOneAndUpdate(
        {_id: new ObjectId(user.id)},
        {
          $inc: {rare_candy: -cost},
          $addToSet: {owned_pokemon_ids: pokemonId},
        },
        {returnDocument: 'after'}
      );

      if (!result) {
        throw new Error('Failed to purchase Pokémon');
      }

      return sanitizeUserForClient(result);
    },

    // Catch Pokemon (free - for battle rewards)
    catchPokemon: async (
      _: unknown,
      {pokemonId}: {pokemonId: number},
      context: AuthContext
    ) => {
      const user = requireAuth(context);

      const db = getDatabase();
      const users = db.collection('users') as Collection<UserDocument>;

      // Get current user state
      const userDoc = await users.findOne({_id: new ObjectId(user.id)});
      if (!userDoc) {
        throw new Error('User not found');
      }

      // Check if user already owns this Pokemon
      if (
        userDoc.owned_pokemon_ids &&
        userDoc.owned_pokemon_ids.includes(pokemonId)
      ) {
        // Already owned - just return the user without error
        return sanitizeUserForClient(userDoc);
      }

      // Add Pokemon to collection (no candy cost)
      const result = await users.findOneAndUpdate(
        {_id: new ObjectId(user.id)},
        {
          $addToSet: {owned_pokemon_ids: pokemonId},
        },
        {returnDocument: 'after'}
      );

      if (!result) {
        throw new Error('Failed to catch Pokémon');
      }

      return sanitizeUserForClient(result);
    },

    // Delete user account
    deleteUser: async (
      _: unknown,
      __: unknown,
      context: AuthContext
    ): Promise<boolean> => {
      const user = requireAuth(context);

      const db = getDatabase();
      const users = db.collection('users') as Collection<UserDocument>;

      // Delete the user
      const result = await users.deleteOne({_id: new ObjectId(user.id)});

      if (result.deletedCount === 0) {
        throw new Error('User not found or already deleted');
      }

      return true;
    },

    // Set favorite Pokemon
    setFavoritePokemon: async (
      _: unknown,
      {pokemonId}: {pokemonId?: number},
      context: AuthContext
    ) => {
      const user = requireAuth(context);

      const db = getDatabase();
      const users = db.collection('users') as Collection<UserDocument>;

      // Get current user state
      const userDoc = await users.findOne({_id: new ObjectId(user.id)});
      if (!userDoc) {
        throw new Error('User not found');
      }

      // If pokemonId is provided, verify user owns it
      if (pokemonId !== null && pokemonId !== undefined) {
        if (
          !userDoc.owned_pokemon_ids ||
          !userDoc.owned_pokemon_ids.includes(pokemonId)
        ) {
          throw new Error('You must own this Pokémon to set it as favorite');
        }

        // Set favorite Pokemon
        const result = await users.findOneAndUpdate(
          {_id: new ObjectId(user.id)},
          {$set: {favorite_pokemon_id: pokemonId}},
          {returnDocument: 'after'}
        );

        if (!result) {
          throw new Error('Failed to set favorite Pokémon');
        }

        return sanitizeUserForClient(result);
      } else {
        // Unset favorite Pokemon
        const result = await users.findOneAndUpdate(
          {_id: new ObjectId(user.id)},
          {$unset: {favorite_pokemon_id: ''}},
          {returnDocument: 'after'}
        );

        if (!result) {
          throw new Error('Failed to unset favorite Pokémon');
        }

        return sanitizeUserForClient(result);
      }
    },

    // Set selected Pokemon for clicker
    setSelectedPokemon: async (
      _: unknown,
      {pokemonId}: {pokemonId?: number},
      context: AuthContext
    ) => {
      const user = requireAuth(context);

      const db = getDatabase();
      const users = db.collection('users') as Collection<UserDocument>;

      // Get current user state
      const userDoc = await users.findOne({_id: new ObjectId(user.id)});
      if (!userDoc) {
        throw new Error('User not found');
      }

      // If pokemonId is provided, verify user owns it
      if (pokemonId !== null && pokemonId !== undefined) {
        if (
          !userDoc.owned_pokemon_ids ||
          !userDoc.owned_pokemon_ids.includes(pokemonId)
        ) {
          throw new Error('You must own this Pokémon to select it for clicker');
        }

        // Set selected Pokemon
        const result = await users.findOneAndUpdate(
          {_id: new ObjectId(user.id)},
          {$set: {selected_pokemon_id: pokemonId}},
          {returnDocument: 'after'}
        );

        if (!result) {
          throw new Error('Failed to set selected Pokémon');
        }

        return sanitizeUserForClient(result);
      } else {
        // Unset selected Pokemon
        const result = await users.findOneAndUpdate(
          {_id: new ObjectId(user.id)},
          {$unset: {selected_pokemon_id: ''}},
          {returnDocument: 'after'}
        );

        if (!result) {
          throw new Error('Failed to unset selected Pokémon');
        }

        return sanitizeUserForClient(result);
      }
    },
  },
};
