import {connectToDatabase, closeDatabaseConnection} from './db.js';
import {Collection} from 'mongodb';
import {UserDocument} from './types.js';

/**
 * One-time migration script to initialize clickPower and passiveIncome stats
 * for all existing users who don't have them.
 *
 * Run with: npm run migrate-stats
 */
async function migrateStats() {
  console.log('🚀 Starting stats migration...');

  // Connect to database first
  const db = await connectToDatabase();
  const users = db.collection('users') as Collection<UserDocument>;

  // Count all users
  const totalUsers = await users.countDocuments();
  console.log(`📊 Found ${totalUsers} total users`);

  // FORCE RESET: Update ALL users to have clickPower and passiveIncome at level 1
  // This will overwrite existing values!
  console.log(`⚠️  Resetting ALL users' clickPower and passiveIncome to level 1...`);

  const result = await users.updateMany(
    {}, // Empty filter = all documents
    {
      $set: {
        'stats.clickPower': 1,
        'stats.passiveIncome': 1
      }
    }
  );

  console.log(`✅ Migration complete!`);
  console.log(`   - Matched: ${result.matchedCount} users`);
  console.log(`   - Modified: ${result.modifiedCount} users`);
  console.log(`   - All users now have clickPower and passiveIncome at level 1`);

  // Close database connection
  await closeDatabaseConnection();
  process.exit(0);
}

// Run the migration
migrateStats().catch(async (err) => {
  console.error('❌ Migration failed:', err);
  await closeDatabaseConnection();
  process.exit(1);
});
