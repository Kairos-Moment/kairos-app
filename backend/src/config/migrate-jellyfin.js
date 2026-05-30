// backend/src/config/migrate-jellyfin.js
// Run once: node src/config/migrate-jellyfin.js
const path = require('path');
require('dotenv').config({ path: path.join(process.cwd(), '../.env') });
const { pool } = require('./database');

const migrateJellyfin = async () => {
  try {
    await pool.query(`
      ALTER TABLE saved_tracks
        ADD COLUMN IF NOT EXISTS jellyfin_id VARCHAR(255);
    `);

    await pool.query(`
      UPDATE saved_tracks
      SET jellyfin_id = navidrome_id
      WHERE navidrome_id IS NOT NULL AND jellyfin_id IS NULL;
    `);

    await pool.query(`
      UPDATE saved_tracks
      SET source_type = 'jellyfin'
      WHERE source_type = 'navidrome';
    `);

    await pool.query(`
      ALTER TABLE saved_tracks
        DROP COLUMN IF EXISTS navidrome_id;
    `);

    console.log('✅ Jellyfin migration complete: saved_tracks schema updated.');
    console.log('   - Added jellyfin_id for Jellyfin track references');
    console.log('   - Migrated navidrome_id values to jellyfin_id');
    console.log('   - Updated source_type navidrome → jellyfin');
    console.log('   - Dropped navidrome_id column');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    await pool.end();
  }
};

migrateJellyfin();
