import {Collection, MongoClient, Db} from 'mongodb';
import { UserDocument } from './types';

let client: MongoClient;
let db: Db;

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

export async function closeDatabaseConnection(): Promise<void> {
  if (client) {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

export function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return {
    collection(name: string): Collection<UserDocument> {
      return db.collection(name);
    }
  };
}