/**
 * Database — Drizzle ORM + PostgreSQL connection pool
 * Uses pg pool for connection management
 * pgvector extension required: CREATE EXTENSION IF NOT EXISTS vector;
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { config } from '../config.js';
import * as schema from '../schemas/db/index.js';

const { Pool } = pg;

// Create pg connection pool
export const pool = new Pool({
  connectionString: config.DATABASE_URL,
  max: config.DATABASE_POOL_MAX,
  min: config.DATABASE_POOL_MIN,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: config.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});

// Log pool events
pool.on('connect', () => {
  // Connection established
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle db client', err);
});

// Drizzle instance with full schema
export const db = drizzle(pool, { schema });

export type Database = typeof db;

/**
 * Test DB connectivity
 */
export async function pingDatabase(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    return true;
  } catch {
    return false;
  }
}

/**
 * Close pool on graceful shutdown
 */
export async function closeDatabase(): Promise<void> {
  await pool.end();
}
