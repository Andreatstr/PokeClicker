import {Db} from 'mongodb';

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

    // Create index on showInRanks for ranks queries
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
