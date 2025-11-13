import {connectToDatabase, closeDatabaseConnection} from './db.js';
import {Collection} from 'mongodb';
import {UserDocument} from './types.js';
import {getClickerUpgradeKeys} from './upgradeConfig.js';

/**
 * One-time migration script to initialize all clicker stats and showInRanks
 * for all existing users who don't have them.
 *
 * This ensures all users have:
 * - All stats defined in upgradeConfig.ts
 * - showInRanks field (defaults to true)
 *
 * Run with: npm run migrate-stats
 */
async function migrateStats() {
  console.log('[MIGRATION] Starting stats migration...');

  // Connect to database first
  const db = await connectToDatabase();
  const users = db.collection('users') as Collection<UserDocument>;

  // Get all required clicker stats from config
  const requiredStats = getClickerUpgradeKeys();
  console.log(`[MIGRATION] Required stats: ${requiredStats.join(', ')}`);

  // Count all users
  const totalUsers = await users.countDocuments();
  console.log(`[MIGRATION] Found ${totalUsers} total users`);

  // Initialize missing stats for each user
  console.log('[MIGRATION] Initializing missing stats and showInRanks...');

  const allUsers = await users.find({}).toArray();
  let updatedCount = 0;

  for (const user of allUsers) {
    const updates: Record<string, number | boolean> = {};
    let needsUpdate = false;

    // Check and initialize stats
    for (const stat of requiredStats) {
      const statValue = (user.stats as Record<string, number | undefined>)[
        stat
      ];
      if (statValue === undefined || statValue === null) {
        updates[`stats.${stat}`] = 1;
        needsUpdate = true;
      }
    }

    // Check and initialize showInRanks
    if (user.showInRanks === undefined || user.showInRanks === null) {
      updates.showInRanks = true;
      needsUpdate = true;
    }

    if (needsUpdate) {
      await users.updateOne({_id: user._id}, {$set: updates});
      updatedCount++;
      console.log(
        `[MIGRATION] Updated user ${user.username}: ${Object.keys(updates).join(', ')}`
      );
    }
  }

  console.log('[MIGRATION] Migration complete');
  console.log(`[MIGRATION]   - Total users: ${totalUsers}`);
  console.log(`[MIGRATION]   - Updated users: ${updatedCount}`);
  console.log(`[MIGRATION]   - Skipped users: ${totalUsers - updatedCount}`);

  // Close database connection
  await closeDatabaseConnection();
  process.exit(0);
}

// Run the migration
migrateStats().catch(async (err) => {
  console.error('[MIGRATION] Migration failed:', err);
  await closeDatabaseConnection();
  process.exit(1);
});
