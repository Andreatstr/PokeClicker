import {
  fetchPokemon,
  fetchPokemonById,
  Pokemon,
  PokemonStats,
} from './pokeapi.js';
import {getBSTForPokemon} from './pokemonStats.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {getDatabase} from './db.js';
import {DEFAULT_USER_STATS} from './types.js';
import {
  UserDocument,
  AuthResponse,
  PokemonQueryArgs,
  PokemonUpgradeDocument,
} from './types';
import {Collection, ObjectId, type Db} from 'mongodb';
import {type AuthContext, requireAuth} from './auth.js';
import {
  DYNAMIC_FACET_THRESHOLD,
  FACET_TIMEOUT_MS,
  USE_STATIC_FALLBACK,
} from './config.js';
import {Decimal, toDecimal} from './decimal.js';
import {
  getUpgradeCost as getUpgradeCostFromConfig,
  isClickerUpgrade,
  getClickerUpgradeKeys,
} from './upgradeConfig.js';
import 'dotenv/config';

// Lightweight type for the pokemon metadata documents stored in MongoDB
type PokemonMetadata = {
  id: number;
  bst?: number;
  price?: string;
  [key: string]: unknown;
};

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in environment variables');
}
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';

/**
 * Sanitizes user document for client by removing sensitive data
 * Ensures all stat fields exist with default values if missing
 *
 * Security:
 * - Removes password_hash from response
 * - Converts MongoDB ObjectId to string
 *
 * Data integrity:
 * - Ensures all stats exist (battle stats + clicker upgrades)
 * - Converts Date objects to ISO strings
 * - Defaults missing fields to prevent client errors
 *
 * @param userDoc - Raw user document from MongoDB
 * @returns Sanitized user object safe for client consumption
 */
function sanitizeUserForClient(
  userDoc: UserDocument
): Omit<UserDocument, 'password_hash' | 'created_at'> & {created_at: string} {
  const rareCandyString: string = userDoc.rare_candy ?? '0';

  // Ensure stats object exists and has all required fields
  const stats = userDoc.stats || {};
  const defaultStats = DEFAULT_USER_STATS.stats;

  return {
    _id: userDoc._id,
    username: userDoc.username,
    rare_candy: rareCandyString,
    created_at: userDoc.created_at?.toISOString() ?? new Date().toISOString(),
    stats: {
      // Battle stats (preserve existing values or use defaults)
      hp: stats.hp ?? defaultStats.hp,
      attack: stats.attack ?? defaultStats.attack,
      defense: stats.defense ?? defaultStats.defense,
      spAttack: stats.spAttack ?? defaultStats.spAttack,
      spDefense: stats.spDefense ?? defaultStats.spDefense,
      speed: stats.speed ?? defaultStats.speed,
      // Clicker upgrades (preserve existing values or use defaults)
      clickPower: stats.clickPower ?? defaultStats.clickPower ?? 1,
      autoclicker: stats.autoclicker ?? defaultStats.autoclicker ?? 1,
      luckyHitChance: stats.luckyHitChance ?? defaultStats.luckyHitChance ?? 1,
      luckyHitMultiplier:
        stats.luckyHitMultiplier ?? defaultStats.luckyHitMultiplier ?? 1,
      clickMultiplier:
        stats.clickMultiplier ?? defaultStats.clickMultiplier ?? 1,
      pokedexBonus: stats.pokedexBonus ?? defaultStats.pokedexBonus ?? 1,
    },
    owned_pokemon_ids: userDoc.owned_pokemon_ids ?? [],
    favorite_pokemon_id: userDoc.favorite_pokemon_id,
    selected_pokemon_id: userDoc.selected_pokemon_id,
    showInRanks: userDoc.showInRanks,
    isGuestUser: userDoc.isGuestUser ?? false, // Default to false for old users
  };
}

const authMutations = {
  async signup(
    _: unknown,
    {
      username,
      password,
      isGuestUser,
    }: {username: string; password: string; isGuestUser?: boolean}
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
      rare_candy: DEFAULT_USER_STATS.rare_candy ?? '0',
      stats: DEFAULT_USER_STATS.stats,
      owned_pokemon_ids: [746], // Wishiwashi-solo - cheapest Pokemon
      favorite_pokemon_id: 746, // Default battle Pokemon
      selected_pokemon_id: 746, // Default clicker Pokemon
      showInRanks: true,
      isGuestUser: isGuestUser ?? false,
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

/**
 * Calculates cost to upgrade a stat from current level to next level
 * Uses Decimal for arbitrary precision (handles very large numbers)
 *
 * @param currentLevel - Current level of the stat
 * @param stat - Stat key (must exist in upgrade config)
 * @returns Cost in rare candy as Decimal
 */
function getUpgradeCost(currentLevel: number, stat: string): Decimal {
  const cost = getUpgradeCostFromConfig(stat, currentLevel);
  return new Decimal(cost);
}

/**
 * Calculates cost to purchase a Pokemon from the Pokedex
 * Uses tier-based exponential scaling: 100 * (1.5 ^ tier)
 * Tier is determined by ID: tier 0 = IDs 0-9, tier 1 = IDs 10-19, etc.
 *
 * Examples:
 * - ID 1-9: tier 0 = 100 candy
 * - ID 10-19: tier 1 = 150 candy
 * - ID 20-29: tier 2 = 225 candy
 *
 * @param pokemonId - Pokemon ID to purchase
 * @returns Cost in rare candy as Decimal
 */
async function getPokemonCost(pokemonId: number): Promise<Decimal> {
  const baseCost = new Decimal(150);
  const bst = await getBSTForPokemon(pokemonId);

  // Doubling formula: Price doubles every 5 BST points
  // Provides even distribution from 150 to 4.9E34
  //
  // Formula: 150 * 2^((bst - 180) / 5)
  //
  // Sample costs:
  // 180 BST (Magikarp) → 150
  // 250 BST (Rattata) → 2.5E6
  // 300 BST (Pidgey) → 2.5E9
  // 350 BST (Pikachu) → 2.6E12
  // 530 BST (Charizard) → 1.8E23
  // 680 BST (Mewtwo) → 1.9E32
  // 720 BST (Arceus) → 4.9E34

  const baselineBST = 180; // Weakest Pokemon
  const doublingInterval = 5; // Price doubles every 5 BST points

  // Calculate doublings: (bst - 180) / 5
  const bstDifference = bst - baselineBST;
  const doublings = bstDifference / doublingInterval;

  // Cost = 150 * 2^doublings
  // Using Decimal.js: cost = 150 * 2^doublings
  const two = new Decimal(2);
  const multiplier = two.pow(doublings);
  const cost = baseCost.times(multiplier);

  return cost.floor();
}

/**
 * Calculates cost to upgrade a Pokemon's level
 * Scales based on both current level and Pokemon's base stats strength
 *
 * Formula: baseCostMultiplier * (2.5 ^ (currentLevel - 1))
 * - baseCostMultiplier = max(25, totalBaseStats / 2)
 * - Stronger Pokemon (higher base stats) cost more to upgrade
 * - Exponential scaling (2.5x per level) makes high levels expensive
 *
 * Examples:
 * - Weak Pokemon (200 base stats total): 100 * 2.5^(level-1)
 * - Strong Pokemon (600 base stats total): 300 * 2.5^(level-1)
 *
 * @param currentLevel - Current upgrade level (1 = base level)
 * @param pokemonStats - Pokemon's base stats from PokeAPI
 * @returns Cost in rare candy as Decimal
 */
function getPokemonUpgradeCost(
  currentLevel: number,
  pokemonStats: PokemonStats
): Decimal {
  // Calculate base cost multiplier based on Pokemon's total base stats
  const totalBaseStats =
    pokemonStats.hp +
    pokemonStats.attack +
    pokemonStats.defense +
    pokemonStats.spAttack +
    pokemonStats.spDefense +
    pokemonStats.speed;

  // Minimum 25 cost, scales with strength (divide by 2 to keep costs reasonable)
  const baseCostMultiplier = Math.max(25, Math.floor(totalBaseStats / 2));

  return new Decimal(baseCostMultiplier)
    .times(new Decimal(2.5).pow(currentLevel - 1))
    .floor();
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
      const users = db.collection('users') as Collection<UserDocument>;
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

      let isOwned = false;
      let bst: number | undefined;
      let price: string | undefined;

      const db = getDatabase();

      // Fetch metadata for bst and price
      try {
        const metadataCollection = db.collection('pokemon_metadata');
        const metadata = await metadataCollection.findOne({id});
        if (metadata) {
          bst = metadata.bst;
          price = metadata.price;
        }
      } catch (error) {
        console.error('Error fetching Pokemon metadata:', error);
      }

      // Check ownership
      if (context.user?.id) {
        try {
          const users = db.collection('users');
          const user = await users.findOne({
            _id: new ObjectId(context.user.id),
          });
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
        bst,
        price,
      };
    },
    pokemonByIds: async (
      _: unknown,
      {ids}: {ids: number[]},
      context: AuthContext
    ) => {
      const pokemonPromises = ids.map((id) => fetchPokemonById(id));
      const pokemon = await Promise.all(pokemonPromises);

      let ownedPokemonIds: number[] = [];
      const db = getDatabase();

      // Fetch metadata for all Pokemon
      let metadataMap = new Map<number, {bst?: number; price?: string}>();
      try {
        const metadataCollection = db.collection('pokemon_metadata');
        const metadataList = await metadataCollection
          .find({id: {$in: ids}})
          .toArray();
        metadataMap = new Map(
          metadataList.map((m) => [m.id, {bst: m.bst, price: m.price}])
        );
      } catch (error) {
        console.error('Error fetching Pokemon metadata:', error);
      }

      // Check ownership
      if (context.user?.id) {
        try {
          const users = db.collection('users');
          const user = await users.findOne({
            _id: new ObjectId(context.user.id),
          });
          if (user && user.owned_pokemon_ids) {
            ownedPokemonIds = user.owned_pokemon_ids;
          }
        } catch (error) {
          console.error('Error fetching user owned Pokemon:', error);
        }
      }

      return pokemon.filter(Boolean).map((p) => {
        const meta = metadataMap.get(p.id);
        return {
          ...p,
          isOwned: ownedPokemonIds.includes(p.id),
          pokedexNumber: p.id,
          bst: meta?.bst,
          price: meta?.price,
        };
      });
    },
    pokedex: async (
      _: unknown,
      args: {
        search?: string;
        generation?: string;
        types?: string[];
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
        types,
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
            ownedPokemonIds = user.owned_pokemon_ids
              .map((v: unknown) => Number(v))
              .filter(Number.isFinite);
          }
        } catch (error) {
          console.error('Error fetching user owned Pokemon:', error);
        }
      }

      if (ownedOnly && !effectiveUserId) {
        return {
          pokemon: [],
          total: 0,
          facets: null,
        };
      }

      const db = getDatabase();
      const metadataCollection = db.collection('pokemon_metadata');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const baseMatch: any = {};

      if (generation) {
        baseMatch.generation = generation.toLowerCase();
      }

      if (types && types.length > 0) {
        baseMatch.types = {$in: types.map((t) => t.toLowerCase())};
      }

      if (search) {
        baseMatch.name = {$regex: search.toLowerCase(), $options: 'i'};
      }

      if (ownedOnly) {
        if (!ownedPokemonIds || ownedPokemonIds.length === 0) {
          return {
            pokemon: [],
            total: 0,
            facets: null,
          };
        }
        baseMatch.id = {$in: ownedPokemonIds};
      }

      // Build sort object
      const sort: Record<string, 1 | -1> = {};

      if (sortBy === 'name') {
        sort.name = sortOrder === 'asc' ? 1 : -1;
      } else if (sortBy === 'type') {
        sort.types = sortOrder === 'asc' ? 1 : -1;
        sort.id = 1;
      } else if (sortBy === 'price') {
        // Sort by priceNumeric (log10 scale) for correct numeric ordering
        // String-based sorting would incorrectly place "1000" before "200"
        sort.priceNumeric = sortOrder === 'asc' ? 1 : -1;
      } else if (sortBy === 'stats') {
        // Sort by BST (Base Stat Total) stored in database
        sort.bst = sortOrder === 'asc' ? 1 : -1;
      } else {
        sort.id = sortOrder === 'asc' ? 1 : -1;
      }

      const totalPokemonCount = await metadataCollection.countDocuments({});
      const useDynamicFacets = totalPokemonCount <= DYNAMIC_FACET_THRESHOLD;

      let facets = null;

      if (useDynamicFacets) {
        try {
          const facetResult = await Promise.race([
            computeDynamicFacets(
              metadataCollection,
              baseMatch,
              generation,
              types,
              search,
              ownedOnly,
              ownedPokemonIds,
              sort,
              offset,
              limit
            ),
            new Promise((_, reject) =>
              setTimeout(
                () => reject(new Error('Facet timeout')),
                FACET_TIMEOUT_MS
              )
            ),
          ]);

          const result = facetResult as {
            paginatedResults: Array<{id: number}>;
            total: number;
            facets: {
              byGeneration: Array<{generation: string; count: number}>;
              byType: Array<{type: string; count: number}>;
            };
          };

          facets = {
            ...result.facets,
            isDynamic: true,
          };

          const pokemonPromises = result.paginatedResults.map((meta) =>
            fetchPokemonById(meta.id)
          );
          const paginatedPokemon = await Promise.all(pokemonPromises);

          // Create a map of metadata by ID for quick lookup
          const resultMetadataMap = new Map<number, PokemonMetadata>(
            result.paginatedResults.map((m: unknown) => {
              const meta = m as PokemonMetadata;
              return [meta.id, meta];
            })
          );

          const pokedexPokemon = paginatedPokemon.map((p: Pokemon) => {
            const meta = resultMetadataMap.get(p.id);
            return {
              ...p,
              pokedexNumber: p.id,
              evolution: p.evolution || [],
              isOwned: effectiveUserId
                ? (ownedPokemonIds ?? []).includes(p.id)
                : false,
              bst: meta?.bst,
              price: meta?.price,
            };
          });

          return {pokemon: pokedexPokemon, total: result.total, facets};
        } catch (error) {
          console.warn(
            'Dynamic facets failed or timed out, falling back to static counts',
            error
          );
        }
      }

      // Static counts fallback (or if dynamic failed)
      if (USE_STATIC_FALLBACK) {
        const staticCounts = await getStaticFilterCounts(db);
        if (staticCounts) {
          // Compute owned count for static fallback
          const ownedMatchQuery: Record<string, unknown> = {...baseMatch};
          delete ownedMatchQuery.id; // Remove owned filter
          if (ownedPokemonIds.length > 0) {
            ownedMatchQuery.id = {$in: ownedPokemonIds};
          }
          const staticOwnedCount =
            ownedPokemonIds.length > 0
              ? await metadataCollection.countDocuments(ownedMatchQuery)
              : 0;

          facets = {
            byGeneration: Object.entries(staticCounts.byGeneration).map(
              ([gen, count]) => ({
                generation: gen,
                count: count as number,
              })
            ),
            byType: Object.entries(staticCounts.byType).map(
              ([type, count]) => ({
                type,
                count: count as number,
              })
            ),
            isDynamic: false,
            ownedCount: staticOwnedCount,
            totalCount: staticCounts.total,
          };
        }
      }

      // Standard query for Pokemon (without facets in aggregation)
      const total = await metadataCollection.countDocuments(baseMatch);
      const pokemonMetadata = await metadataCollection
        .find(baseMatch)
        .sort(sort)
        .skip(offset)
        .limit(limit)
        .toArray();

      const pokemonPromises = pokemonMetadata.map((meta) =>
        fetchPokemonById(meta.id)
      );
      const paginatedPokemon = await Promise.all(pokemonPromises);

      // Create a map of metadata by ID for quick lookup
      const metadataMap = new Map<number, PokemonMetadata>(
        pokemonMetadata.map((m: unknown) => {
          const meta = m as PokemonMetadata;
          return [meta.id, meta];
        })
      );

      const pokedexPokemon = paginatedPokemon.map((p: Pokemon) => {
        const meta = metadataMap.get(p.id);
        return {
          ...p,
          pokedexNumber: p.id,
          evolution: p.evolution || [],
          isOwned: effectiveUserId
            ? (ownedPokemonIds ?? []).includes(p.id)
            : false,
          bst: meta?.bst,
          price: meta?.price,
        };
      });

      return {pokemon: pokedexPokemon, total, facets};
    },

    pokemonUpgrade: async (
      _: unknown,
      {pokemonId}: {pokemonId: number},
      context: AuthContext
    ) => {
      const user = requireAuth(context);

      const db = getDatabase();
      const upgrades = db.collection(
        'pokemon_upgrades'
      ) as Collection<PokemonUpgradeDocument>;

      // Find existing upgrade for this user+Pokemon
      const upgrade = await upgrades.findOne({
        user_id: new ObjectId(user.id),
        pokemon_id: pokemonId,
      });

      // If no upgrade exists, return level 1 (default)
      const level = upgrade?.level || 1;

      // Fetch Pokemon stats to calculate stats-based upgrade cost
      const pokemon = await fetchPokemonById(pokemonId);
      const cost = getPokemonUpgradeCost(level, pokemon.stats);

      return {
        pokemon_id: pokemonId,
        level,
        cost: cost.toString(),
      };
    },

    /**
     * Retrieves ranked leaderboards for candy count and Pokemon collection
     * Uses MongoDB aggregation with $facet for efficient parallel computation
     *
     * Returns:
     * - Top players in candy league (sorted by rare candy)
     * - Top players in Pokemon league (sorted by owned Pokemon count)
     * - Current user's rank in both leagues (if authenticated)
     * - Total player count
     *
     * Ranking mechanics:
     * - Uses $setWindowFields for proper rank calculation with ties
     * - Standard ranking: 1, 2, 2, 4 (ties share rank, next rank skips)
     * - Pagination applied AFTER ranking to show correct positions
     * - Only includes users with showInRanks=true (privacy setting)
     *
     * Performance:
     * - $facet runs multiple pipelines in parallel (single DB roundtrip)
     * - Indexes on showInRanks, rare_candy, owned_pokemon_ids improve speed
     */
    getRanks: async (
      _: unknown,
      {input}: {input?: {limit?: number; offset?: number}},
      context: AuthContext
    ) => {
      const {limit = 50, offset = 0} = input || {};

      try {
        const db = getDatabase();
        const usersCollection = db.collection('users');

        const result = await usersCollection
          .aggregate([
            // First, match only users who are visible in ranks
            // Exclude e2e test users (e2etest* and test* patterns)
            // Exclude guest users EXCEPT the current viewing user
            {
              $match: {
                showInRanks: {$ne: false},
                username: {
                  $not: {$regex: '^(e2etest|test\\d)'},
                },
                $or: [
                  {isGuestUser: {$ne: true}}, // Include all non-guest users
                  ...(context.user?.id
                    ? [{_id: new ObjectId(context.user.id)}] // Include current user even if guest
                    : []),
                ],
              },
            },

            // Run multiple pipelines in parallel using $facet
            {
              $facet: {
                // Pipeline 1: Candy League with proper ranking
                candyLeague: [
                  // Add fields for sorting and ranking
                  {
                    $addFields: {
                      candyScore: {
                        $toDouble: {$ifNull: ['$rare_candy', '0']},
                      },
                    },
                  },
                  // Sort by candy (desc), then by _id for consistency with ties
                  {$sort: {candyScore: -1, _id: 1}},
                  // Calculate rank using $setWindowFields (handles ties properly)
                  {
                    $setWindowFields: {
                      sortBy: {candyScore: -1},
                      output: {
                        rank: {$rank: {}}, // Standard ranking (1, 2, 2, 4)
                      },
                    },
                  },
                  // Apply pagination after ranking
                  {$skip: offset},
                  {$limit: limit},
                  // Project final shape
                  {
                    $project: {
                      position: '$rank',
                      username: 1,
                      score: '$candyScore',
                      userId: {$toString: '$_id'},
                      showInRanks: {$ifNull: ['$showInRanks', true]},
                    },
                  },
                ],

                // Pipeline 2: Pokemon League with proper ranking
                pokemonLeague: [
                  // Calculate pokemon count
                  {
                    $addFields: {
                      pokemonCount: {
                        $size: {$ifNull: ['$owned_pokemon_ids', []]},
                      },
                    },
                  },
                  // Sort by pokemon count (desc), then by _id for consistency
                  {$sort: {pokemonCount: -1, _id: 1}},
                  // Calculate rank using $setWindowFields (handles ties properly)
                  {
                    $setWindowFields: {
                      sortBy: {pokemonCount: -1},
                      output: {
                        rank: {$rank: {}}, // Standard ranking (1, 2, 2, 4)
                      },
                    },
                  },
                  // Apply pagination after ranking
                  {$skip: offset},
                  {$limit: limit},
                  // Project final shape
                  {
                    $project: {
                      position: '$rank',
                      username: 1,
                      score: '$pokemonCount',
                      userId: {$toString: '$_id'},
                      showInRanks: {$ifNull: ['$showInRanks', true]},
                    },
                  },
                ],

                // Pipeline 3: Total player count
                totalPlayers: [{$count: 'count'}],

                // Pipeline 4: Current user ranks (if authenticated)
                ...(context.user?.id
                  ? {
                      currentUserRanks: [
                        // Match only the current user
                        {$match: {_id: new ObjectId(context.user.id)}},
                        // Add computed fields
                        {
                          $addFields: {
                            candyScore: {
                              $toDouble: {$ifNull: ['$rare_candy', '0']},
                            },
                            pokemonCount: {
                              $size: {$ifNull: ['$owned_pokemon_ids', []]},
                            },
                          },
                        },
                        // Lookup to calculate ranks by counting users with better scores
                        {
                          $lookup: {
                            from: 'users',
                            let: {
                              userCandy: '$candyScore',
                              userPokemon: '$pokemonCount',
                            },
                            pipeline: [
                              {
                                $match: {
                                  showInRanks: {$ne: false},
                                  username: {
                                    $not: {$regex: '^(e2etest|test\\d)'},
                                  },
                                  isGuestUser: {$ne: true},
                                },
                              },
                              {
                                $addFields: {
                                  hasBetterCandy: {
                                    $gt: [
                                      {
                                        $toDouble: {
                                          $ifNull: ['$rare_candy', '0'],
                                        },
                                      },
                                      '$$userCandy',
                                    ],
                                  },
                                  hasBetterPokemon: {
                                    $gt: [
                                      {
                                        $size: {
                                          $ifNull: ['$owned_pokemon_ids', []],
                                        },
                                      },
                                      '$$userPokemon',
                                    ],
                                  },
                                },
                              },
                              {
                                $group: {
                                  _id: null,
                                  betterCandyCount: {
                                    $sum: {$cond: ['$hasBetterCandy', 1, 0]},
                                  },
                                  betterPokemonCount: {
                                    $sum: {$cond: ['$hasBetterPokemon', 1, 0]},
                                  },
                                },
                              },
                            ],
                            as: 'rankData',
                          },
                        },
                        {
                          $project: {
                            candyRank: {
                              $add: [
                                {
                                  $ifNull: [
                                    {
                                      $arrayElemAt: [
                                        '$rankData.betterCandyCount',
                                        0,
                                      ],
                                    },
                                    0,
                                  ],
                                },
                                1,
                              ],
                            },
                            pokemonRank: {
                              $add: [
                                {
                                  $ifNull: [
                                    {
                                      $arrayElemAt: [
                                        '$rankData.betterPokemonCount',
                                        0,
                                      ],
                                    },
                                    0,
                                  ],
                                },
                                1,
                              ],
                            },
                          },
                        },
                      ],
                    }
                  : {}),
              },
            },
          ])
          .toArray();

        // Extract results from facet
        const facetResult = result[0];

        const candyLeague = facetResult.candyLeague || [];
        const pokemonLeague = facetResult.pokemonLeague || [];
        const totalPlayers = facetResult.totalPlayers?.[0]?.count || 0;

        // Extract user ranks if authenticated
        let userCandyRank = null;
        let userPokemonRank = null;

        if (context.user?.id && facetResult.currentUserRanks?.length > 0) {
          const userRanks = facetResult.currentUserRanks[0];
          userCandyRank = userRanks.candyRank || null;
          userPokemonRank = userRanks.pokemonRank || null;
        }

        return {
          candyLeague,
          pokemonLeague,
          totalPlayers,
          userCandyRank,
          userPokemonRank,
        };
      } catch (error) {
        console.error('Ranks error:', error);
        throw new Error('Failed to load ranks data');
      }
    },
  },

  Mutation: {
    ...authMutations,

    updateRareCandy: async (
      _: unknown,
      {amount}: {amount: string},
      context: AuthContext
    ) => {
      const user = requireAuth(context);

      const db = getDatabase();
      const users = db.collection('users') as Collection<UserDocument>;

      // Get current user candy
      const userDoc = await users.findOne({_id: new ObjectId(user.id)});
      if (!userDoc) {
        throw new Error('User not found');
      }

      // Calculate new candy amount
      const currentCandy = toDecimal(userDoc.rare_candy);
      const amountDecimal = toDecimal(amount);
      const newCandy = currentCandy.plus(amountDecimal);

      // Update rare candy
      const result = await users.findOneAndUpdate(
        {_id: new ObjectId(user.id)},
        {$set: {rare_candy: newCandy.toString()}},
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
      if (!isClickerUpgrade(stat)) {
        throw new Error(
          `Invalid stat: ${stat}. Must be one of: ${getClickerUpgradeKeys().join(', ')}`
        );
      }

      const db = getDatabase();
      const users = db.collection('users') as Collection<UserDocument>;

      // Get current user state
      const userDoc = await users.findOne({_id: new ObjectId(user.id)});
      if (!userDoc) {
        throw new Error('User not found');
      }

      // Ensure stats object exists (TypeScript workaround - will be properly initialized if missing)
      if (!userDoc.stats) {
        userDoc.stats = DEFAULT_USER_STATS.stats;
      }

      // Get current level for the stat, initialize to 1 if missing
      let currentLevel = (userDoc.stats as Record<string, number>)[stat];
      if (!currentLevel || currentLevel < 1) {
        currentLevel = 1;
        // Initialize the stat in the database if it's missing
        await users.updateOne(
          {_id: new ObjectId(user.id)},
          {
            $set: {
              [`stats.${stat}`]: 1,
            },
          }
        );
      }
      const cost = getUpgradeCost(currentLevel, stat);

      // Check if user has enough rare candy
      const currentCandy = toDecimal(userDoc.rare_candy);
      if (currentCandy.lt(cost)) {
        throw new Error(
          `Not enough rare candy. Need ${cost.toString()}, have ${currentCandy.toString()}. Current ${stat} level: ${currentLevel}`
        );
      }

      // Calculate new candy amount
      const newCandy = currentCandy.minus(cost);

      // Ensure stats object exists before incrementing
      const setOperation: Record<string, unknown> = {
        rare_candy: newCandy.toString(),
      };

      // If stats object doesn't exist, create it first
      if (!userDoc.stats || Object.keys(userDoc.stats).length === 0) {
        setOperation.stats = DEFAULT_USER_STATS.stats;
      }

      const updateOperation: Record<string, unknown> = {
        $set: setOperation,
      };

      // Increment the stat (MongoDB will create the field if it doesn't exist)
      updateOperation.$inc = {
        [`stats.${stat}`]: 1,
      };

      // Update stat and deduct cost
      const result = await users.findOneAndUpdate(
        {_id: new ObjectId(user.id)},
        updateOperation,
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
      const cost = await getPokemonCost(pokemonId);

      // Check if user has enough rare candy
      const currentCandy = toDecimal(userDoc.rare_candy);
      if (currentCandy.lt(cost)) {
        throw new Error(`Not enough candy.`);
      }

      // Calculate new candy amount
      const newCandy = currentCandy.minus(cost);

      // Purchase Pokemon: deduct rare candy and add to owned list
      const result = await users.findOneAndUpdate(
        {_id: new ObjectId(user.id)},
        {
          $set: {rare_candy: newCandy.toString()},
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

    // Upgrade a Pokemon (increases level by 1, all stats +3%)
    upgradePokemon: async (
      _: unknown,
      {pokemonId}: {pokemonId: number},
      context: AuthContext
    ) => {
      const user = requireAuth(context);

      const db = getDatabase();
      const users = db.collection('users') as Collection<UserDocument>;
      const upgrades = db.collection(
        'pokemon_upgrades'
      ) as Collection<PokemonUpgradeDocument>;

      // Check if user owns this Pokemon
      const userDoc = await users.findOne({_id: new ObjectId(user.id)});
      if (!userDoc) {
        throw new Error('User not found');
      }

      if (!userDoc.owned_pokemon_ids?.includes(pokemonId)) {
        throw new Error('You do not own this Pokémon');
      }

      // Get current upgrade level
      const existingUpgrade = await upgrades.findOne({
        user_id: new ObjectId(user.id),
        pokemon_id: pokemonId,
      });

      const currentLevel = existingUpgrade?.level || 1;

      // Fetch Pokemon stats to calculate stats-based upgrade cost
      const pokemon = await fetchPokemonById(pokemonId);
      const cost = getPokemonUpgradeCost(currentLevel, pokemon.stats);

      // Check if user has enough candy
      const currentCandy = toDecimal(userDoc.rare_candy);
      if (currentCandy.lt(cost)) {
        throw new Error(
          `Not enough rare candy. Need ${cost.toString()}, have ${currentCandy.toString()}`
        );
      }

      // Calculate new candy amount
      const newCandy = currentCandy.minus(cost);

      // Deduct candy
      await users.updateOne(
        {_id: new ObjectId(user.id)},
        {$set: {rare_candy: newCandy.toString()}}
      );

      // Update or create upgrade record
      const newLevel = currentLevel + 1;
      const now = new Date();

      if (existingUpgrade) {
        // Update existing
        await upgrades.updateOne(
          {
            user_id: new ObjectId(user.id),
            pokemon_id: pokemonId,
          },
          {
            $set: {
              level: newLevel,
              updated_at: now,
            },
          }
        );
      } else {
        // Create new
        await upgrades.insertOne({
          user_id: new ObjectId(user.id),
          pokemon_id: pokemonId,
          level: newLevel,
          created_at: now,
          updated_at: now,
        });
      }

      const newCost = getPokemonUpgradeCost(newLevel, pokemon.stats);

      // Return updated user data so frontend can sync candy count
      const updatedUserDoc = await users.findOne({_id: new ObjectId(user.id)});
      if (!updatedUserDoc) {
        throw new Error('Failed to fetch updated user data');
      }

      return {
        pokemon_id: pokemonId,
        level: newLevel,
        cost: newCost.toString(),
        user: sanitizeUserForClient(updatedUserDoc),
      };
    },
    updateRanksPreference: async (
      _: unknown,
      {showInRanks}: {showInRanks: boolean},
      context: AuthContext
    ) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }
      const db = getDatabase();

      try {
        const result = await db
          .collection('users')
          .findOneAndUpdate(
            {_id: new ObjectId(context.user.id)},
            {$set: {showInRanks}},
            {returnDocument: 'after'}
          );

        if (!result) {
          throw new Error('Failed to update user preferences');
        }

        return {
          _id: result._id.toString(),
          username: result.username,
          rare_candy: result.rare_candy,
          stats: result.stats,
          created_at: result.created_at,
          owned_pokemon_ids: result.owned_pokemon_ids,
          favorite_pokemon_id: result.favorite_pokemon_id,
          selected_pokemon_id: result.selected_pokemon_id,
          showInRanks: result.showInRanks,
        };
      } catch (error) {
        console.error('Failed to update ranks preference:', error);
        throw new Error('Failed to update ranks preference');
      }
    },
  },
};

/**
 * Computes dynamic faceted filter counts using MongoDB aggregation
 * Used for Pokedex filtering to show accurate counts per filter option
 *
 * Strategy:
 * - Uses $facet to run multiple aggregations in parallel
 * - Each facet applies all OTHER filters except the one being counted
 * - This shows "if I select this filter, how many results will I have?"
 *
 * Example:
 * - When counting types, applies generation + search filters (but not type filter)
 * - This way, type counts reflect "results if I filter by this type"
 *
 * Performance considerations:
 * - Can be slow on large datasets (controlled by DYNAMIC_FACET_THRESHOLD)
 * - Falls back to static counts if dataset too large or query times out
 * - Timeout protection prevents slow queries from blocking requests
 *
 * @returns Object containing paginated Pokemon, total count, and facet counts
 */
async function computeDynamicFacets(
  metadataCollection: Collection,
  baseMatch: Record<string, unknown>,
  generation: string | undefined,
  types: string[] | undefined,
  search: string | undefined,
  ownedOnly: boolean,
  ownedPokemonIds: number[],
  sort: Record<string, 1 | -1>,
  offset: number,
  limit: number
) {
  const pipeline = [
    {
      $facet: {
        // Main results - just paginated data
        paginatedResults: [
          {$match: baseMatch},
          {$sort: sort},
          {$skip: offset},
          {$limit: limit},
        ],

        // Total count
        totalCount: [{$match: baseMatch}, {$count: 'count'}],

        // Generation counts (apply all filters EXCEPT generation)
        generationCounts: [
          // Apply type filter if present
          ...(types && types.length > 0
            ? [{$match: {types: {$in: types.map((t) => t.toLowerCase())}}}]
            : []),
          // Apply search filter if present
          ...(search
            ? [{$match: {name: {$regex: search.toLowerCase(), $options: 'i'}}}]
            : []),
          // Apply owned filter if present
          ...(ownedOnly && ownedPokemonIds.length > 0
            ? [{$match: {id: {$in: ownedPokemonIds}}}]
            : []),

          {$group: {_id: '$generation', count: {$sum: 1}}},
          {$project: {generation: '$_id', count: 1, _id: 0}},
        ],

        // Type counts (apply all filters EXCEPT types)
        typeCounts: [
          // Apply generation filter if present
          ...(generation
            ? [{$match: {generation: generation.toLowerCase()}}]
            : []),
          // Apply search filter if present
          ...(search
            ? [{$match: {name: {$regex: search.toLowerCase(), $options: 'i'}}}]
            : []),
          // Apply owned filter if present
          ...(ownedOnly && ownedPokemonIds.length > 0
            ? [{$match: {id: {$in: ownedPokemonIds}}}]
            : []),

          {$unwind: '$types'},
          {$group: {_id: '$types', count: {$sum: 1}}},
          {$project: {type: '$_id', count: 1, _id: 0}},
        ],

        // Owned count (how many owned Pokemon match current filters, excluding ownedOnly)
        ownedCount: [
          // Apply all filters EXCEPT ownedOnly
          ...(generation
            ? [{$match: {generation: generation.toLowerCase()}}]
            : []),
          ...(types && types.length > 0
            ? [{$match: {types: {$in: types.map((t) => t.toLowerCase())}}}]
            : []),
          ...(search
            ? [{$match: {name: {$regex: search.toLowerCase(), $options: 'i'}}}]
            : []),
          // Filter to only owned Pokemon
          ...(ownedPokemonIds.length > 0
            ? [{$match: {id: {$in: ownedPokemonIds}}}]
            : []),

          {$count: 'count'},
        ],
      },
    },
  ];

  const [result] = await metadataCollection.aggregate(pipeline).toArray();

  const totalCount = result.totalCount[0]?.count || 0;
  const ownedCount = result.ownedCount[0]?.count || 0;

  return {
    paginatedResults: result.paginatedResults,
    total: totalCount,
    facets: {
      byGeneration: result.generationCounts || [],
      byType: result.typeCounts || [],
      ownedCount,
      totalCount,
    },
  };
}

/**
 * Retrieves precomputed static filter counts from database
 * Used as fallback when dynamic facets are too slow or dataset is too large
 *
 * Static counts:
 * - Precomputed and stored in filter_counts collection
 * - Updated when Pokemon metadata is seeded/changed
 * - Fast but not context-aware (shows total counts, not filtered counts)
 *
 * Trade-offs:
 * - Pro: Very fast, no computation needed
 * - Con: Counts don't reflect other active filters
 * - Con: Requires manual updates when data changes
 *
 * @param db - MongoDB database instance
 * @returns Static counts object or null if not found
 */
async function getStaticFilterCounts(db: Db) {
  const countsCollection = db.collection('filter_counts');
  const counts = await countsCollection.findOne({
    _id: 'global_counts' as unknown as ObjectId,
  });
  return counts || null;
}
