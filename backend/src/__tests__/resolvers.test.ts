import {
  describe,
  it,
  expect,
  beforeEach,
  beforeAll,
  vi,
  afterEach,
} from 'vitest';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {ObjectId} from 'mongodb';
import type {Pokemon} from '../pokeapi';

// Mock MongoDB
const mockFind = vi.fn();
const mockFindOne = vi.fn();
const mockInsertOne = vi.fn();
const mockUpdateOne = vi.fn();
const mockFindOneAndUpdate = vi.fn();
const mockCollection = vi.fn().mockReturnValue({
  findOne: mockFindOne,
  insertOne: mockInsertOne,
  updateOne: mockUpdateOne,
  findOneAndUpdate: mockFindOneAndUpdate,
  find: mockFind,
});

const mockDb = {
  collection: mockCollection,
};

vi.mock('../db.js', () => ({
  getDatabase: vi.fn(() => mockDb),
}));

// Mock pokeapi
vi.mock('../pokeapi.js', () => ({
  fetchPokemon: vi.fn(),
  fetchPokemonById: vi.fn(),
}));

beforeAll(() => {
  process.env.JWT_SECRET = 'testsecret';
  process.env.JWT_EXPIRES = '1h';
});

import {resolvers} from '../resolvers';
import {fetchPokemon, fetchPokemonById} from '../pokeapi';
import type {AuthContext} from '../auth';
import type {UserDocument} from '../types';

describe('GraphQL Resolvers', () => {
  const JWT_SECRET = process.env.JWT_SECRET || 'test_secret';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Query.health', () => {
    it('should return OK status with timestamp', () => {
      const result = resolvers.Query.health();

      expect(result.status).toBe('OK');
      expect(result.timestamp).toBeDefined();
      expect(new Date(result.timestamp)).toBeInstanceOf(Date);
    });
  });

  describe('Query.hello', () => {
    it('should return greeting message', () => {
      const result = resolvers.Query.hello();
      expect(result).toBe('Hello from PokéClicker GraphQL API!');
    });
  });

  describe('Query.me', () => {
    it('should return user data for authenticated user', async () => {
      const mockUser: UserDocument = {
        _id: new ObjectId(),
        username: 'testuser',
        password_hash: 'hash',
        created_at: new Date(),
        rare_candy: '100',
        stats: {
          hp: 1,
          attack: 1,
          defense: 1,
          spAttack: 1,
          spDefense: 1,
          speed: 1,
          clickPower: 5,
          autoclicker: 3,
          luckyHitChance: 1,
          luckyHitMultiplier: 1,
          clickMultiplier: 1,
          pokedexBonus: 1,
        },
        owned_pokemon_ids: [1, 25],
        favorite_pokemon_id: 25,
        selected_pokemon_id: 1,
      };

      mockFindOne.mockResolvedValue(mockUser);

      const context: AuthContext = {
        user: {id: mockUser._id.toString(), username: 'testuser'},
      };

      const result = await resolvers.Query.me({}, {}, context);

      expect(result).toBeDefined();
      expect(result.username).toBe('testuser');
      expect(result.rare_candy).toBe('100'); // Changed to string for large number support
      expect(result.stats.clickPower).toBe(5);
      expect(result.owned_pokemon_ids).toEqual([1, 25]);
      expect(result).not.toHaveProperty('password_hash');
    });

    it('should throw error when not authenticated', async () => {
      const context: AuthContext = {};

      await expect(resolvers.Query.me({}, {}, context)).rejects.toThrow(
        'Authentication required'
      );
    });

    it('should throw error when user not found', async () => {
      mockFindOne.mockResolvedValue(null);

      const context: AuthContext = {
        user: {id: new ObjectId().toString(), username: 'testuser'},
      };

      await expect(resolvers.Query.me({}, {}, context)).rejects.toThrow(
        'User not found'
      );
    });

    it('should migrate missing stats for existing users', async () => {
      const mockUser: UserDocument = {
        _id: new ObjectId(),
        username: 'olduser',
        password_hash: 'hash',
        created_at: new Date(),
        rare_candy: '50',
        stats: {
          hp: 10,
          attack: 5,
          defense: 3,
          spAttack: 4,
          spDefense: 2,
          speed: 6,
          // Missing clickPower and autoclicker
        },
        owned_pokemon_ids: [1],
      };

      const updatedUser = {
        ...mockUser,
        stats: {
          ...mockUser.stats,
          clickPower: 1,
          autoclicker: 1,
        },
      };

      mockFindOne
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(updatedUser);
      mockUpdateOne.mockResolvedValue({modifiedCount: 1});

      const context: AuthContext = {
        user: {id: mockUser._id.toString(), username: 'olduser'},
      };

      const result = await resolvers.Query.me({}, {}, context);

      expect(mockUpdateOne).toHaveBeenCalledWith(
        {_id: mockUser._id},
        {
          $set: {
            'stats.clickPower': 1,
            'stats.autoclicker': 1,
            'stats.luckyHitChance': 1,
            'stats.luckyHitMultiplier': 1,
            'stats.clickMultiplier': 1,
            'stats.pokedexBonus': 1,
          },
        }
      );
      expect(result.stats.clickPower).toBe(1);
      expect(result.stats.autoclicker).toBe(1);
    });
  });

  describe('Query.pokemon', () => {
    it('should fetch Pokemon with given arguments', async () => {
      const mockPokemonData = {
        pokemon: [
          {
            id: 1,
            name: 'Bulbasaur',
            types: ['grass', 'poison'],
            sprite: 'url',
            stats: {
              hp: 45,
              attack: 49,
              defense: 49,
              spAttack: 65,
              spDefense: 65,
              speed: 45,
            },
            height: 7,
            weight: 69,
            abilities: ['overgrow'],
            evolution: [1, 2, 3],
          },
          {
            id: 2,
            name: 'Ivysaur',
            types: ['grass', 'poison'],
            sprite: 'url',
            stats: {
              hp: 60,
              attack: 62,
              defense: 63,
              spAttack: 80,
              spDefense: 80,
              speed: 60,
            },
            height: 10,
            weight: 130,
            abilities: ['overgrow'],
            evolution: [1, 2, 3],
          },
        ],
        total: 2,
      };

      vi.mocked(fetchPokemon).mockResolvedValue(mockPokemonData);

      const args = {generation: 'kanto', limit: 2, offset: 0};
      const result = await resolvers.Query.pokemon({}, args);

      expect(fetchPokemon).toHaveBeenCalledWith(args);
      expect(result).toEqual(mockPokemonData);
    });
  });

  describe('Query.pokemonById', () => {
    it('should fetch Pokemon by ID and check ownership for authenticated user', async () => {
      const mockPokemon: Pokemon = {
        id: 25,
        name: 'Pikachu',
        types: ['electric'],
        sprite: 'url',
        stats: {
          hp: 35,
          attack: 55,
          defense: 40,
          spAttack: 50,
          spDefense: 50,
          speed: 90,
        },
        height: 4,
        weight: 60,
        abilities: ['static'],
        evolution: [25],
      };

      const mockUser = {
        _id: new ObjectId(),
        owned_pokemon_ids: [25, 1, 4],
      };

      vi.mocked(fetchPokemonById).mockResolvedValue(mockPokemon);
      mockFindOne.mockResolvedValue(mockUser);

      const context: AuthContext = {
        user: {id: mockUser._id.toString(), username: 'testuser'},
      };

      const result = await resolvers.Query.pokemonById({}, {id: 25}, context);

      expect(fetchPokemonById).toHaveBeenCalledWith(25);
      expect(result).toMatchObject({
        id: 25,
        name: 'Pikachu',
        isOwned: true,
      });
    });

    it('should return isOwned false when user does not own Pokemon', async () => {
      const mockPokemon: Pokemon = {
        id: 150,
        name: 'Mewtwo',
        types: ['psychic'],
        sprite: 'url',
        stats: {
          hp: 106,
          attack: 110,
          defense: 90,
          spAttack: 154,
          spDefense: 90,
          speed: 130,
        },
        height: 20,
        weight: 1220,
        abilities: ['pressure'],
        evolution: [150],
      };

      const mockUser = {
        _id: new ObjectId(),
        owned_pokemon_ids: [25, 1],
      };

      vi.mocked(fetchPokemonById).mockResolvedValue(mockPokemon);
      mockFindOne.mockResolvedValue(mockUser);

      const context: AuthContext = {
        user: {id: mockUser._id.toString(), username: 'testuser'},
      };

      const result = await resolvers.Query.pokemonById({}, {id: 150}, context);

      expect(result).toMatchObject({
        id: 150,
        name: 'Mewtwo',
        isOwned: false,
      });
    });

    it('should return isOwned false for unauthenticated user', async () => {
      const mockPokemon: Pokemon = {
        id: 25,
        name: 'Pikachu',
        types: ['electric'],
        sprite: 'url',
        stats: {
          hp: 35,
          attack: 55,
          defense: 40,
          spAttack: 50,
          spDefense: 50,
          speed: 90,
        },
        height: 4,
        weight: 60,
        abilities: ['static'],
        evolution: [25],
      };

      vi.mocked(fetchPokemonById).mockResolvedValue(mockPokemon);

      const context: AuthContext = {};

      const result = await resolvers.Query.pokemonById({}, {id: 25}, context);

      expect(result).toMatchObject({
        id: 25,
        name: 'Pikachu',
        isOwned: false,
      });
    });

    it('should return null when Pokemon not found', async () => {
      vi.mocked(fetchPokemonById).mockResolvedValue(null as unknown as Pokemon);

      const context: AuthContext = {};

      const result = await resolvers.Query.pokemonById({}, {id: 999}, context);

      expect(result).toBeNull();
    });
  });

  describe('Mutation.signup', () => {
    it('should create new user and return token', async () => {
      const insertedId = new ObjectId();
      const mockUser: UserDocument = {
        _id: insertedId,
        username: 'newuser',
        password_hash: await bcrypt.hash('password123', 10),
        created_at: new Date(),
        rare_candy: '0',
        stats: {
          hp: 1,
          attack: 1,
          defense: 1,
          spAttack: 1,
          spDefense: 1,
          speed: 1,
          clickPower: 1,
          autoclicker: 1,
          luckyHitChance: 1,
          luckyHitMultiplier: 1,
          clickMultiplier: 1,
          pokedexBonus: 1,
        },
        owned_pokemon_ids: [1],
      };

      mockInsertOne.mockResolvedValue({insertedId});
      mockFindOne.mockResolvedValue(mockUser);

      const result = await resolvers.Mutation.signup(
        {},
        {username: 'newuser', password: 'password123'}
      );

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(result.user.username).toBe('newuser');
      expect(result.user).not.toHaveProperty('password_hash');

      // Verify token is valid
      const decoded = jwt.verify(result.token, JWT_SECRET) as jwt.JwtPayload;
      expect(decoded.username).toBe('newuser');
    });

    it('should throw error for missing username', async () => {
      await expect(
        resolvers.Mutation.signup({}, {username: '', password: 'password123'})
      ).rejects.toThrow('Missing username or password');
    });

    it('should throw error for missing password', async () => {
      await expect(
        resolvers.Mutation.signup({}, {username: 'newuser', password: ''})
      ).rejects.toThrow('Missing username or password');
    });

    it('should throw error for username too short', async () => {
      await expect(
        resolvers.Mutation.signup({}, {username: 'ab', password: 'password123'})
      ).rejects.toThrow('Username must be between 3 and 20 characters');
    });

    it('should throw error for username too long', async () => {
      await expect(
        resolvers.Mutation.signup(
          {},
          {
            username: 'a'.repeat(21),
            password: 'password123',
          }
        )
      ).rejects.toThrow('Username must be between 3 and 20 characters');
    });

    it('should throw error for password too short', async () => {
      await expect(
        resolvers.Mutation.signup({}, {username: 'newuser', password: '12345'})
      ).rejects.toThrow('Password must be at least 6 characters');
    });

    it('should throw error for duplicate username', async () => {
      mockInsertOne.mockRejectedValue({code: 11000});

      await expect(
        resolvers.Mutation.signup(
          {},
          {
            username: 'existinguser',
            password: 'password123',
          }
        )
      ).rejects.toThrow('Username already exists');
    });
  });

  describe('Mutation.login', () => {
    it('should return token for valid credentials', async () => {
      const mockUser: UserDocument = {
        _id: new ObjectId(),
        username: 'testuser',
        password_hash: await bcrypt.hash('password123', 10),
        created_at: new Date(),
        rare_candy: '50',
        stats: {
          hp: 5,
          attack: 3,
          defense: 2,
          spAttack: 4,
          spDefense: 2,
          speed: 3,
          clickPower: 2,
          autoclicker: 2,
        },
        owned_pokemon_ids: [1, 4, 7],
      };

      mockFindOne.mockResolvedValue(mockUser);

      const result = await resolvers.Mutation.login(
        {},
        {username: 'testuser', password: 'password123'}
      );

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(result.user.username).toBe('testuser');
      expect(result.user.rare_candy).toBe('50'); // Changed to string for large number support

      // Verify token
      const decoded = jwt.verify(result.token, JWT_SECRET) as jwt.JwtPayload;
      expect(decoded.username).toBe('testuser');
    });

    it('should throw error for missing username', async () => {
      await expect(
        resolvers.Mutation.login({}, {username: '', password: 'password123'})
      ).rejects.toThrow('Missing username or password');
    });

    it('should throw error for missing password', async () => {
      await expect(
        resolvers.Mutation.login({}, {username: 'testuser', password: ''})
      ).rejects.toThrow('Missing username or password');
    });

    it('should throw error for non-existent username', async () => {
      mockFindOne.mockResolvedValue(null);

      await expect(
        resolvers.Mutation.login(
          {},
          {
            username: 'nonexistent',
            password: 'password123',
          }
        )
      ).rejects.toThrow('Incorrect username or password');
    });

    it('should throw error for incorrect password', async () => {
      const mockUser: UserDocument = {
        _id: new ObjectId(),
        username: 'testuser',
        password_hash: await bcrypt.hash('correctpassword', 10),
        created_at: new Date(),
        rare_candy: '0',
        stats: {
          hp: 1,
          attack: 1,
          defense: 1,
          spAttack: 1,
          spDefense: 1,
          speed: 1,
          clickPower: 1,
          autoclicker: 1,
          luckyHitChance: 1,
          luckyHitMultiplier: 1,
          clickMultiplier: 1,
          pokedexBonus: 1,
        },
        owned_pokemon_ids: [1],
      };

      mockFindOne.mockResolvedValue(mockUser);

      await expect(
        resolvers.Mutation.login(
          {},
          {
            username: 'testuser',
            password: 'wrongpassword',
          }
        )
      ).rejects.toThrow('Incorrect username or password');
    });
  });

  describe('Mutation.updateRareCandy', () => {
    it('should increment rare candy for authenticated user', async () => {
      const mockUser: UserDocument = {
        _id: new ObjectId(),
        username: 'testuser',
        password_hash: 'hash',
        created_at: new Date(),
        rare_candy: '100',
        stats: {
          hp: 1,
          attack: 1,
          defense: 1,
          spAttack: 1,
          spDefense: 1,
          speed: 1,
          clickPower: 1,
          autoclicker: 1,
          luckyHitChance: 1,
          luckyHitMultiplier: 1,
          clickMultiplier: 1,
          pokedexBonus: 1,
        },
        owned_pokemon_ids: [1],
      };

      const updatedUser = {...mockUser, rare_candy: '150'};
      mockFindOneAndUpdate.mockResolvedValue(updatedUser);

      const context: AuthContext = {
        user: {id: mockUser._id.toString(), username: 'testuser'},
      };

      const result = await resolvers.Mutation.updateRareCandy(
        {},
        {amount: '50'},
        context
      );

      expect(result.rare_candy).toBe('150');
    });

    it('should throw error when user not authenticated', async () => {
      const context: AuthContext = {};

      await expect(
        resolvers.Mutation.updateRareCandy({}, {amount: '50'}, context)
      ).rejects.toThrow('Authentication required');
    });
  });

  describe('Mutation.upgradeStat', () => {
    it('should upgrade clickPower stat when user has enough candy', async () => {
      const mockUser: UserDocument = {
        _id: new ObjectId(),
        username: 'testuser',
        password_hash: 'hash',
        created_at: new Date(),
        rare_candy: '100',
        stats: {
          hp: 1,
          attack: 1,
          defense: 1,
          spAttack: 1,
          spDefense: 1,
          speed: 1,
          clickPower: 2,
          autoclicker: 1,
        },
        owned_pokemon_ids: [1],
      };

      const upgradedUser = {
        ...mockUser,
        stats: {...mockUser.stats, clickPower: 3},
        rare_candy: '72', // 100 - 28 (cost for level 2->3)
      };

      mockFindOne.mockResolvedValue(mockUser);
      mockFindOneAndUpdate.mockResolvedValue(upgradedUser);

      const context: AuthContext = {
        user: {id: mockUser._id.toString(), username: 'testuser'},
      };

      const result = await resolvers.Mutation.upgradeStat(
        {},
        {stat: 'clickPower'},
        context
      );

      expect(result.stats.clickPower).toBe(3);
      expect(result.rare_candy).toBe('72'); // Changed to string for large number support
    });

    it('should throw error when stat is invalid', async () => {
      const context: AuthContext = {
        user: {id: new ObjectId().toString(), username: 'testuser'},
      };

      await expect(
        resolvers.Mutation.upgradeStat({}, {stat: 'invalidStat'}, context)
      ).rejects.toThrow('Invalid stat');
    });

    it('should throw error when user does not have enough candy', async () => {
      const mockUser: UserDocument = {
        _id: new ObjectId(),
        username: 'testuser',
        password_hash: 'hash',
        created_at: new Date(),
        rare_candy: '5', // Not enough for upgrade
        stats: {
          hp: 1,
          attack: 1,
          defense: 1,
          spAttack: 1,
          spDefense: 1,
          speed: 1,
          clickPower: 2,
          autoclicker: 1,
        },
        owned_pokemon_ids: [1],
      };

      mockFindOne.mockResolvedValue(mockUser);

      const context: AuthContext = {
        user: {id: mockUser._id.toString(), username: 'testuser'},
      };

      await expect(
        resolvers.Mutation.upgradeStat({}, {stat: 'clickPower'}, context)
      ).rejects.toThrow('Not enough rare candy');
    });

    it('should throw error when user not found', async () => {
      mockFindOne.mockResolvedValue(null);

      const context: AuthContext = {
        user: {id: new ObjectId().toString(), username: 'testuser'},
      };

      await expect(
        resolvers.Mutation.upgradeStat({}, {stat: 'clickPower'}, context)
      ).rejects.toThrow('User not found');
    });
  });

  describe('Mutation.purchasePokemon', () => {
    it('should purchase Pokemon when user has enough candy', async () => {
      const mockUser: UserDocument = {
        _id: new ObjectId(),
        username: 'testuser',
        password_hash: 'hash',
        created_at: new Date(),
        rare_candy: '1000',
        stats: {
          hp: 1,
          attack: 1,
          defense: 1,
          spAttack: 1,
          spDefense: 1,
          speed: 1,
          clickPower: 1,
          autoclicker: 1,
          luckyHitChance: 1,
          luckyHitMultiplier: 1,
          clickMultiplier: 1,
          pokedexBonus: 1,
        },
        owned_pokemon_ids: [1],
      };

      const updatedUser = {
        ...mockUser,
        owned_pokemon_ids: [1, 25],
        rare_candy: '900', // Assuming 100 candy cost
      };

      mockFindOne.mockResolvedValue(mockUser);
      mockFindOneAndUpdate.mockResolvedValue(updatedUser);

      const context: AuthContext = {
        user: {id: mockUser._id.toString(), username: 'testuser'},
      };

      const result = await resolvers.Mutation.purchasePokemon(
        {},
        {pokemonId: 25},
        context
      );

      expect(result.owned_pokemon_ids).toContain(25);
    });

    it('should throw error when user already owns the Pokemon', async () => {
      const mockUser: UserDocument = {
        _id: new ObjectId(),
        username: 'testuser',
        password_hash: 'hash',
        created_at: new Date(),
        rare_candy: '1000',
        stats: {
          hp: 1,
          attack: 1,
          defense: 1,
          spAttack: 1,
          spDefense: 1,
          speed: 1,
          clickPower: 1,
          autoclicker: 1,
          luckyHitChance: 1,
          luckyHitMultiplier: 1,
          clickMultiplier: 1,
          pokedexBonus: 1,
        },
        owned_pokemon_ids: [1, 25],
      };

      mockFindOne.mockResolvedValue(mockUser);

      const context: AuthContext = {
        user: {id: mockUser._id.toString(), username: 'testuser'},
      };

      await expect(
        resolvers.Mutation.purchasePokemon({}, {pokemonId: 25}, context)
      ).rejects.toThrow('You already own this Pokémon');
    });

    it('should throw error when user does not have enough candy', async () => {
      const mockUser: UserDocument = {
        _id: new ObjectId(),
        username: 'testuser',
        password_hash: 'hash',
        created_at: new Date(),
        rare_candy: '10',
        stats: {
          hp: 1,
          attack: 1,
          defense: 1,
          spAttack: 1,
          spDefense: 1,
          speed: 1,
          clickPower: 1,
          autoclicker: 1,
          luckyHitChance: 1,
          luckyHitMultiplier: 1,
          clickMultiplier: 1,
          pokedexBonus: 1,
        },
        owned_pokemon_ids: [1],
      };

      mockFindOne.mockResolvedValue(mockUser);

      const context: AuthContext = {
        user: {id: mockUser._id.toString(), username: 'testuser'},
      };

      await expect(
        resolvers.Mutation.purchasePokemon({}, {pokemonId: 25}, context)
      ).rejects.toThrow('Not enough candy');
    });

    it('should throw error when user not found', async () => {
      mockFindOne.mockResolvedValue(null);

      const context: AuthContext = {
        user: {id: new ObjectId().toString(), username: 'testuser'},
      };

      await expect(
        resolvers.Mutation.purchasePokemon({}, {pokemonId: 25}, context)
      ).rejects.toThrow('User not found');
    });
  });

  describe('Mutation.catchPokemon', () => {
    it('should catch Pokemon for free when user does not own it', async () => {
      const mockUser: UserDocument = {
        _id: new ObjectId(),
        username: 'testuser',
        password_hash: 'hash',
        created_at: new Date(),
        rare_candy: '100',
        stats: {
          hp: 1,
          attack: 1,
          defense: 1,
          spAttack: 1,
          spDefense: 1,
          speed: 1,
          clickPower: 1,
          autoclicker: 1,
          luckyHitChance: 1,
          luckyHitMultiplier: 1,
          clickMultiplier: 1,
          pokedexBonus: 1,
        },
        owned_pokemon_ids: [1],
      };

      const updatedUser = {
        ...mockUser,
        owned_pokemon_ids: [1, 25],
      };

      mockFindOne.mockResolvedValue(mockUser);
      mockFindOneAndUpdate.mockResolvedValue(updatedUser);

      const context: AuthContext = {
        user: {id: mockUser._id.toString(), username: 'testuser'},
      };

      const result = await resolvers.Mutation.catchPokemon(
        {},
        {pokemonId: 25},
        context
      );

      expect(result.owned_pokemon_ids).toContain(25);
      expect(result.rare_candy).toBe('100'); // No cost - changed to string for large number support
    });

    it('should return user without error when user already owns the Pokemon', async () => {
      const mockUser: UserDocument = {
        _id: new ObjectId(),
        username: 'testuser',
        password_hash: 'hash',
        created_at: new Date(),
        rare_candy: '100',
        stats: {
          hp: 1,
          attack: 1,
          defense: 1,
          spAttack: 1,
          spDefense: 1,
          speed: 1,
          clickPower: 1,
          autoclicker: 1,
          luckyHitChance: 1,
          luckyHitMultiplier: 1,
          clickMultiplier: 1,
          pokedexBonus: 1,
        },
        owned_pokemon_ids: [1, 25],
      };

      mockFindOne.mockResolvedValue(mockUser);

      const context: AuthContext = {
        user: {id: mockUser._id.toString(), username: 'testuser'},
      };

      const result = await resolvers.Mutation.catchPokemon(
        {},
        {pokemonId: 25},
        context
      );

      // Should return user without throwing error (idempotent operation)
      expect(result.owned_pokemon_ids).toContain(25);
      expect(result.rare_candy).toBe('100'); // Changed to string for large number support
    });
  });
});
