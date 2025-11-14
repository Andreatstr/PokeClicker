import {MongoClient, Db} from 'mongodb';

/**
 * MongoDB connection singleton
 * Maintains a single connection throughout the application lifecycle
 */
let client: MongoClient;
let db: Db;

/**
 * Establishes connection to MongoDB database
 * Uses singleton pattern - returns existing connection if already established
 *
 * Configuration via environment variables:
 * - MONGODB_URI: MongoDB connection string (default: localhost:27017)
 * - MONGODB_DB_NAME: Database name (default: pokeclicker_db)
 *
 * Connection settings:
 * - serverSelectionTimeoutMS: 3 seconds (fast fail for dev/testing)
 *
 * @returns MongoDB database instance
 * @throws Error if connection fails
 */
export async function connectToDatabase(): Promise<Db> {
  if (db) {
    return db;
  }

  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  const dbName = process.env.MONGODB_DB_NAME || 'pokeclicker_db';

  try {
    client = new MongoClient(mongoUri, {
      serverSelectionTimeoutMS: 3000,
    });
    await client.connect();

    console.log('Connected to MongoDB');

    db = client.db(dbName);
    console.log(`Using database: ${dbName}`);

    return db;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

/**
 * Closes MongoDB connection gracefully
 * Should be called on application shutdown
 */
export async function closeDatabaseConnection(): Promise<void> {
  if (client) {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

/**
 * Returns the active database instance
 * Must call connectToDatabase() first to initialize
 *
 * @returns MongoDB database instance
 * @throws Error if database not yet initialized
 */
export function getDatabase(): Db {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}
