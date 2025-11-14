/**
 * Database migration script for user stats initialization
 *
 * Purpose: Ensures backward compatibility when adding new upgrade types
 * Initializes missing stats to level 1 for existing users
 *
 * Run with: npm run migrate-stats
 *
 * Why this is needed:
 * When new upgrade types are added to upgradeConfig.ts, existing users
 * don't have those stats in their database records. This migration ensures
 * all users have all required stats, preventing null reference errors.
 */
import {connectToDatabase, closeDatabaseConnection} from './db.js';
import {Collection} from 'mongodb';
import {UserDocument} from './types.js';
import {getClickerUpgradeKeys} from './upgradeConfig.js';

async function migrateStats() {
  console.log('[MIGRATION] Starting stats migration...');

  const db = await connectToDatabase();
  const users = db.collection('users') as Collection<UserDocument>;

  const requiredStats = getClickerUpgradeKeys();
  console.log(`[MIGRATION] Required stats: ${requiredStats.join(', ')}`);

  const totalUsers = await users.countDocuments();
  console.log(`[MIGRATION] Found ${totalUsers} total users`);

  console.log('[MIGRATION] Initializing missing stats and showInRanks...');

  const allUsers = await users.find({}).toArray();
  let updatedCount = 0;

  for (const user of allUsers) {
    const updates: Record<string, number | boolean> = {};
    let needsUpdate = false;

    // Initialize any missing stats to level 1 (base level)
    for (const stat of requiredStats) {
      const statValue = (user.stats as Record<string, number | undefined>)[
        stat
      ];
      if (statValue === undefined || statValue === null) {
        updates[`stats.${stat}`] = 1;
        needsUpdate = true;
      }
    }

    // Initialize showInRanks if missing (default: visible in leaderboards)
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

  await closeDatabaseConnection();
  process.exit(0);
}

migrateStats().catch(async (err) => {
  console.error('[MIGRATION] Migration failed:', err);
  await closeDatabaseConnection();
  process.exit(1);
});
