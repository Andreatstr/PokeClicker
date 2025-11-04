import {Db} from 'mongodb';
import bcrypt from 'bcrypt';
import {DEFAULT_USER_STATS} from './types.js';

export async function initializeSchema(db: Db): Promise<void> {
  try {
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((col) => col.name);

    // Create users collection if it doesn't exist
    if (!collectionNames.includes('users')) {
      await db.createCollection('users');
      console.log('Created users collection');
    }

    const usersCollection = db.collection('users');

    // Create unique index on username
    await usersCollection.createIndex(
      {username: 1},
      {unique: true, name: 'username_unique'}
    );
    console.log('Created unique index on username');

    // Create index on owned_pokemon_ids for performance
    await usersCollection.createIndex(
      {owned_pokemon_ids: 1},
      {name: 'owned_pokemon_ids_index'}
    );
    console.log('Created index on owned_pokemon_ids');

    // Create index on showInRanks for leaderboard queries
    await usersCollection.createIndex(
      {showInRanks: 1},
      {name: 'show_in_ranks_index'}
    );
    console.log('Created index on showInRanks');

    // Migrate existing users to have showInRanks default value
    const migrationResult = await usersCollection.updateMany(
      {showInRanks: {$exists: false}},
      {$set: {showInRanks: true}}
    );
    if (migrationResult.modifiedCount > 0) {
      console.log(
        `Migrated ${migrationResult.modifiedCount} existing users with showInRanks=true`
      );
    }

    // Ensure a default guest user exists for simple guest login
    const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
    const existingGuest = await usersCollection.findOne({username: 'guest'});
    if (!existingGuest) {
      const password_hash = await bcrypt.hash('123456', SALT_ROUNDS);
      await usersCollection.insertOne({
        username: 'guest',
        password_hash,
        created_at: new Date(),
        rare_candy: DEFAULT_USER_STATS.rare_candy ?? 0,
        stats: DEFAULT_USER_STATS.stats,
        owned_pokemon_ids: DEFAULT_USER_STATS.owned_pokemon_ids,
      });
      console.log('Created default guest user');
    }

    console.log('Database schema initialized successfully');
  } catch (error) {
    console.error('Failed to initialize schema:', error);
    throw error;
  }
}
