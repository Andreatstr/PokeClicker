import {
  fetchPokemon,
  fetchPokemonById,
  Pokemon,
  PokemonStats,
} from './pokeapi.js';
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

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in environment variables');
}
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';

function sanitizeUserForClient(
  userDoc: UserDocument
): Omit<UserDocument, 'password_hash' | 'created_at'> & {created_at: string} {
  const rareCandyString: string = userDoc.rare_candy ?? '0';

  return {
    _id: userDoc._id,
    username: userDoc.username,
    rare_candy: rareCandyString,
    created_at: userDoc.created_at?.toISOString() ?? new Date().toISOString(),
    stats: {
      ...userDoc.stats,
      clickPower: userDoc.stats.clickPower ?? 1,
      autoclicker: userDoc.stats.autoclicker ?? 1,
      luckyHitChance: userDoc.stats.luckyHitChance ?? 1,
      luckyHitMultiplier: userDoc.stats.luckyHitMultiplier ?? 1,
      clickMultiplier: userDoc.stats.clickMultiplier ?? 1,
      pokedexBonus: userDoc.stats.pokedexBonus ?? 1,
    },
    owned_pokemon_ids: userDoc.owned_pokemon_ids ?? [],
    favorite_pokemon_id: userDoc.favorite_pokemon_id,
    selected_pokemon_id: userDoc.selected_pokemon_id,
    showInRanks: userDoc.showInRanks,
    isGuestUser: userDoc.isGuestUser,
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
      owned_pokemon_ids: [1],
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

// Helper to get upgrade cost (uses config as single source of truth)
function getUpgradeCost(currentLevel: number, stat: string): Decimal {
  // Use centralized config
  const cost = getUpgradeCostFromConfig(stat, currentLevel);
  return new Decimal(cost);
}

// Helper to get Pokemon purchase cost
function getPokemonCost(pokemonId: number): Decimal {
  const tier = Math.floor(pokemonId / 10);
  return new Decimal(100).times(new Decimal(1.5).pow(tier)).floor();
}

// Helper to get Pokemon upgrade cost based on base stats
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

  // Much more aggressive scaling to match purchase cost differences
  // Weak Pokemon (~200 stats): ~25 base cost
  // Average Pokemon (~400 stats): ~100 base cost
  // Strong Pokemon (~600 stats): ~300 base cost
  // Legendary Pokemon (~800+ stats): ~800+ base cost
  const baseCostMultiplier = Math.max(25, Math.floor(totalBaseStats / 2)); // Much steeper scaling

  // Cost formula: baseCost × 2.5^(level-1)
  // Level 1->2: baseCost, Level 2->3: baseCost×2.5, Level 3->4: baseCost×6.25, etc.
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
      let userDoc = await users.findOne({_id: new ObjectId(user.id)});

      if (!userDoc) {
        throw new Error('User not found');
      }

      // Automatic migration: Initialize new stats for existing users
      let needsUpdate = false;
      const updates: Record<string, number> = {};

      const clickerStats = getClickerUpgradeKeys();

      for (const stat of clickerStats) {
        const statValue = (userDoc.stats as Record<string, number | undefined>)[
          stat
        ];
        if (!statValue) {
          updates[`stats.${stat}`] = 1;
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        await users.updateOne({_id: new ObjectId(user.id)}, {$set: updates});
        // Re-fetch to get updated document
        userDoc = await users.findOne({_id: new ObjectId(user.id)});
        if (!userDoc) {
          throw new Error('User not found after migration');
        }
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

      // Query MongoDB for scalable filtering/sorting/pagination
      const db = getDatabase();
      const metadataCollection = db.collection('pokemon_metadata');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const baseMatch: any = {};

      if (generation) {
        baseMatch.generation = generation.toLowerCase();
      }

      // FIX: Multi-type UNION filtering
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
        // Sort by first type, then by ID as secondary
        sort.types = sortOrder === 'asc' ? 1 : -1;
        sort.id = 1; // Always ascending ID as secondary sort
      } else {
        sort.id = sortOrder === 'asc' ? 1 : -1;
      }

      // Check total dataset size for adaptive faceting strategy
      const totalPokemonCount = await metadataCollection.countDocuments({});
      const useDynamicFacets = totalPokemonCount <= DYNAMIC_FACET_THRESHOLD;

      let facets = null;

      if (useDynamicFacets) {
        // STRATEGY 1: Dynamic faceted aggregation for small datasets
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

          // Fetch full Pokemon details
          const pokemonPromises = result.paginatedResults.map((meta) =>
            fetchPokemonById(meta.id)
          );
          const paginatedPokemon = await Promise.all(pokemonPromises);

          const pokedexPokemon = paginatedPokemon.map((p: Pokemon) => ({
            ...p,
            pokedexNumber: p.id,
            evolution: p.evolution || [],
            isOwned: effectiveUserId
              ? (ownedPokemonIds ?? []).includes(p.id)
              : false,
          }));

          return {pokemon: pokedexPokemon, total: result.total, facets};
        } catch (error) {
          console.warn(
            'Dynamic facets failed or timed out, falling back to static counts',
            error
          );
          // Fall through to static counts fallback
        }
      }

      // STRATEGY 2: Static counts fallback (or if dynamic failed)
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

      const pokedexPokemon = paginatedPokemon.map((p: Pokemon) => ({
        ...p,
        pokedexNumber: p.id,
        evolution: p.evolution || [],
        isOwned: effectiveUserId
          ? (ownedPokemonIds ?? []).includes(p.id)
          : false,
      }));

      return {pokemon: pokedexPokemon, total, facets};
    },

    // Get Pokemon upgrade level for a specific Pokemon
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

    getRanks: async (
      _: unknown,
      {input}: {input?: {limit?: number; offset?: number}},
      context: AuthContext
    ) => {
      const {limit = 50, offset = 0} = input || {};

      try {
        const db = getDatabase();
        const usersCollection = db.collection('users');

        // Use $facet to run all queries in parallel for optimal performance
        // This reduces 6 separate queries down to 1 aggregation pipeline
        const result = await usersCollection
          .aggregate([
            // First, match only users who are visible in ranks
            {$match: {showInRanks: {$ne: false}}},

            // Run multiple pipelines in parallel using $facet
            {
              $facet: {
                // Pipeline 1: Candy League with proper ranking
                candyLeague: [
                  // Add fields for sorting and ranking
                  {
                    $addFields: {
                      candyScore: {$ifNull: ['$rare_candy', 0]},
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
                            candyScore: {$ifNull: ['$rare_candy', 0]},
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
                              {$match: {showInRanks: {$ne: false}}},
                              {
                                $addFields: {
                                  hasBetterCandy: {
                                    $gt: [
                                      {$ifNull: ['$rare_candy', 0]},
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

    // Update rare candy count (increment/decrement by amount)
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
      let userDoc = await users.findOne({_id: new ObjectId(user.id)});
      if (!userDoc) {
        throw new Error('User not found');
      }

      // Initialize stat if it doesn't exist (migration for existing users)
      const statValue = (userDoc.stats as Record<string, number | undefined>)[
        stat
      ];
      if (statValue === undefined || statValue === null) {
        await users.updateOne(
          {_id: new ObjectId(user.id)},
          {$set: {[`stats.${stat}`]: 1}}
        );
        // Re-fetch user to get updated stats
        userDoc = await users.findOne({_id: new ObjectId(user.id)});
        if (!userDoc) {
          throw new Error('User not found after migration');
        }
      }

      // Calculate cost - get current level for the stat
      const currentLevel = (userDoc.stats as Record<string, number>)[stat] || 1;
      console.log(
        `[DEBUG] Upgrading ${stat}: currentLevel=${currentLevel}, cost will be calculated from this level`
      );
      const cost = getUpgradeCost(currentLevel, stat);

      console.log(
        `[DEBUG] Upgrade ${stat}: level=${currentLevel}, cost=${cost.toString()}, userCandy=${userDoc.rare_candy}`
      );

      // Check if user has enough rare candy
      const currentCandy = toDecimal(userDoc.rare_candy);
      if (currentCandy.lt(cost)) {
        throw new Error(
          `Not enough rare candy. Need ${cost.toString()}, have ${currentCandy.toString()}. Current ${stat} level: ${currentLevel}`
        );
      }

      // Calculate new candy amount
      const newCandy = currentCandy.minus(cost);

      // Update stat and deduct cost
      const result = await users.findOneAndUpdate(
        {_id: new ObjectId(user.id)},
        {
          $inc: {
            [`stats.${stat}`]: 1,
          },
          $set: {
            rare_candy: newCandy.toString(),
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
 * Helper: Compute dynamic faceted counts using MongoDB aggregation
 * Returns paginated results, total count, and filter counts for generation and types
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
 * Helper: Get precomputed static filter counts from database
 * Used as fallback when dynamic facets are too slow or dataset is too large
 */
async function getStaticFilterCounts(db: Db) {
  const countsCollection = db.collection('filter_counts');
  const counts = await countsCollection.findOne({
    _id: 'global_counts' as unknown as ObjectId,
  });
  return counts || null;
}
