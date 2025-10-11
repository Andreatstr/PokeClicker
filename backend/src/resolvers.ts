import { fetchPokemon, fetchPokemonById } from './pokeapi.js';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { getDatabase } from './db.js'
import { DEFAULT_USER_STATS } from './types.js'
import { UserDocument, AuthResponse, PokemonQueryArgs } from './types'
import { Collection } from 'mongodb'
import 'dotenv/config'

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10)
const JWT_SECRET = process.env.JWT_SECRET || 'change_me'
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d'

function sanitizeUserForClient(userDoc: UserDocument) {
  return {
    _id: userDoc._id,
    username: userDoc.username,
    rare_candy: userDoc.rare_candy ?? 0,
    created_at: userDoc.created_at,
    stats: userDoc.stats,
    owned_pokemon_ids: userDoc.owned_pokemon_ids ?? [],
  }
}

const authMutations = {
  async signup(_: unknown, { username, password }: { username: string; password: string }): Promise<AuthResponse> {
    if (!username || !password) throw new Error('Missing username or password')
    if (username.length < 3 || username.length > 20) throw new Error('Username must be between 3 and 20 characters')
    if (password.length < 6) throw new Error('Password must be at least 6 characters')

    const db = getDatabase()
    const users = db.collection('users') as Collection<UserDocument>

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS)

    const newUser: Omit<UserDocument, '_id'>  = {
      username,
      password_hash,
      created_at: new Date(),
      rare_candy: DEFAULT_USER_STATS.rare_candy ?? 0,
      stats: DEFAULT_USER_STATS.stats,
      owned_pokemon_ids: DEFAULT_USER_STATS.owned_pokemon_ids ?? [],
    }

    try {
      const insertResult = await users.insertOne(newUser)
      const userDoc = await users.findOne({ _id: insertResult.insertedId })

      const token = jwt.sign({ id: userDoc._id.toString(), username: userDoc.username }, JWT_SECRET, { expiresIn: JWT_EXPIRES })

      return { token, user: sanitizeUserForClient(userDoc) }
    } catch (err) {
      if (err && err.code === 11000) throw new Error('Username already exists')
      console.error('Signup error', err)
      throw new Error('Server error during signup')
    }
  },

  async login(_: unknown, { username, password }: { username: string; password: string }): Promise<AuthResponse> {
    if (!username || !password) throw new Error('Missing username or password')

    const db = getDatabase()
    const users = db.collection('users')

    const userDoc = await users.findOne({ username })
    if (!userDoc) throw new Error('Incorrect username or password')

    const ok = await bcrypt.compare(password, userDoc.password_hash)
    if (!ok) throw new Error('Incorrect username or password')

    const token = jwt.sign({ id: userDoc._id.toString(), username: userDoc.username }, JWT_SECRET, { expiresIn: JWT_EXPIRES })

    return { token, user: sanitizeUserForClient(userDoc) }
  },
}

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
    pokemonById: async (_: unknown, { id }: { id: number }) => {
      return fetchPokemonById(id);
    },
  },
  Mutation: {
    ...(authMutations || {}),
  },
};
