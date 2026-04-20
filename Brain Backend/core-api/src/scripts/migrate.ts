// Load .env FIRST before any other imports that read process.env
import * as dotenv from 'dotenv';
dotenv.config();

import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db, pool } from '../lib/db.js';

async function runMigrate() {
  console.log('⏳ Running database migrations...');
  console.log('   DB:', process.env.DATABASE_URL?.replace(/:([^:@]+)@/, ':***@'));
  try {
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('✅ Migrations completed successfully.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

runMigrate();
