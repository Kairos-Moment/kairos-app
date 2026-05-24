// backend/src/config/migrate-navidrome.js
// Run once: node src/config/migrate-navidrome.js
const path = require('path');
require('dotenv').config({ path: path.join(process.cwd(), '../.env') });
const { pool } = require('./database');

const migrateNavidrome = async () => {
  try {
    // Add new columns to saved_tracks for Navidrome support
    await pool.query(`
      ALTER TABLE saved_tracks
        ADD COLUMN IF NOT EXISTS source_type VARCHAR(50) DEFAULT 'youtube',
        ADD COLUMN IF NOT EXISTS navidrome_id VARCHAR(255),
        ADD COLUMN IF NOT EXISTS metadata JSONB;
    `);

    // Update existing tracks to mark them as youtube source
    await pool.query(`
      UPDATE saved_tracks 
      SET source_type = 'youtube' 
      WHERE source_type IS NULL AND youtube_id IS NOT NULL;
    `);

    // Update tracks with file_path to mark them as uploads
    await pool.query(`
      UPDATE saved_tracks 
      SET source_type = 'upload' 
      WHERE source_type IS NULL AND file_path IS NOT NULL;
    `);

    console.log('✅ Navidrome migration complete: saved_tracks schema updated.');
    console.log('   - Added source_type (youtube, navidrome, upload)');
    console.log('   - Added navidrome_id for Navidrome track references');
    console.log('   - Added metadata for storing track details (artist, album, duration, etc.)');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    await pool.end();
  }
};

migrateNavidrome();
