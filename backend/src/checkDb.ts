/**
 * Database health check and inspection utility
 *
 * Displays all users and their game progress
 * Useful for debugging and verifying database state
 *
 * Run with: npm run check-db
 */
import {connectToDatabase, closeDatabaseConnection} from './db.js';
import {Collection} from 'mongodb';
import {UserDocument} from './types.js';

async function checkDatabase() {
  console.log('🔍 Checking database...');

  const db = await connectToDatabase();
  const users = db.collection('users') as Collection<UserDocument>;

  const allUsers = await users.find({}).toArray();

  console.log(`\n📊 Found ${allUsers.length} users:\n`);

  for (const user of allUsers) {
    console.log(`User: ${user.username}`);
    console.log(`  Stats:`, user.stats);
    console.log(`  Rare Candy: ${user.rare_candy}`);
    console.log('');
  }

  await closeDatabaseConnection();
  process.exit(0);
}

checkDatabase().catch(async (err) => {
  console.error('❌ Failed:', err);
  await closeDatabaseConnection();
  process.exit(1);
});
