/**
 * Database schema initialization
 *
 * Sets up collections and indexes for optimal query performance
 * Runs on server startup to ensure schema is ready
 */
import {Db} from 'mongodb';

/**
 * Initializes database schema with required collections and indexes
 *
 * Collections created:
 * - users: Stores user accounts, game progress, and owned Pokemon
 *
 * Indexes created for performance:
 * - username (unique): Fast user lookup and prevents duplicate accounts
 * - owned_pokemon_ids: Optimizes Pokemon ownership queries
 * - showInRanks: Speeds up leaderboard queries by filtering visible users
 */
export async function initializeSchema(db: Db): Promise<void> {
  try {
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((col) => col.name);

    if (!collectionNames.includes('users')) {
      await db.createCollection('users');
      console.log('Created users collection');
    }

    const usersCollection = db.collection('users');

    // Unique constraint ensures no duplicate usernames
    await usersCollection.createIndex(
      {username: 1},
      {unique: true, name: 'username_unique'}
    );
    console.log('Created unique index on username');

    // Speeds up queries that check Pokemon ownership
    await usersCollection.createIndex(
      {owned_pokemon_ids: 1},
      {name: 'owned_pokemon_ids_index'}
    );
    console.log('Created index on owned_pokemon_ids');

    // Optimizes leaderboard queries that filter by showInRanks
    await usersCollection.createIndex(
      {showInRanks: 1},
      {name: 'show_in_ranks_index'}
    );
    console.log('Created index on showInRanks');

    console.log('Database schema initialized successfully');
  } catch (error) {
    console.error('Failed to initialize schema:', error);
    throw error;
  }
}
