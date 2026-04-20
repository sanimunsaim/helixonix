/**
 * Database — Drizzle ORM + PostgreSQL connection pool
 * Uses pg pool for connection management
 * pgvector extension required: CREATE EXTENSION IF NOT EXISTS vector;
 */
import * as schema from '../schemas/db/index.js';
export declare const pool: import("pg").Pool;
export declare const db: import("drizzle-orm/node-postgres").NodePgDatabase<typeof schema> & {
    $client: import("pg").Pool;
};
export type Database = typeof db;
/**
 * Test DB connectivity
 */
export declare function pingDatabase(): Promise<boolean>;
/**
 * Close pool on graceful shutdown
 */
export declare function closeDatabase(): Promise<void>;
//# sourceMappingURL=db.d.ts.map