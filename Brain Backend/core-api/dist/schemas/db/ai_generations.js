/**
 * DB Schema — ai_generations + credit_transactions
 */
import { pgTable, uuid, varchar, text, integer, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users.js';
export const aiStatusEnum = pgEnum('ai_status', ['queued', 'processing', 'completed', 'failed', 'cancelled']);
export const creditTxTypeEnum = pgEnum('credit_tx_type', ['purchase', 'award', 'deduct', 'refund', 'expire']);
export const aiGenerations = pgTable('ai_generations', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id),
    toolType: varchar('tool_type', { length: 50 }).notNull(),
    prompt: text('prompt'),
    parameters: jsonb('parameters'),
    modelVersion: varchar('model_version', { length: 255 }),
    replicatePredictionId: varchar('replicate_prediction_id', { length: 100 }),
    status: aiStatusEnum('status').notNull().default('queued'),
    outputUrls: jsonb('output_urls').$type().default([]),
    outputKeys: jsonb('output_keys').$type().default([]),
    creditsUsed: integer('credits_used').notNull().default(0),
    processingTimeMs: integer('processing_time_ms'),
    errorMessage: text('error_message'),
    isPublished: varchar('is_published', { length: 10 }).default('false'),
    publishedAssetId: uuid('published_asset_id'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    completedAt: timestamp('completed_at'),
});
export const creditTransactions = pgTable('credit_transactions', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id),
    type: creditTxTypeEnum('type').notNull(),
    amount: integer('amount').notNull(), // positive = add, negative = deduct
    balanceAfter: integer('balance_after').notNull(),
    reason: text('reason').notNull(),
    referenceId: uuid('reference_id'), // payment_id, generation_id, etc.
    referenceType: varchar('reference_type', { length: 50 }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});
//# sourceMappingURL=ai_generations.js.map