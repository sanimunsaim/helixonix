/**
 * DB Schema — notifications + audit_logs
 */
import { pgTable, uuid, varchar, text, boolean, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users.js';
export const notificationTypeEnum = pgEnum('notification_type', [
    'order_new', 'order_delivered', 'order_completed', 'order_cancelled', 'order_disputed',
    'message_new', 'payment_received', 'payout_processed',
    'asset_approved', 'asset_rejected', 'review_received',
    'credits_updated', 'ai_generation_complete', 'system_alert'
]);
export const notifications = pgTable('notifications', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    type: notificationTypeEnum('type').notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    message: text('message').notNull(),
    actionUrl: text('action_url'),
    isRead: boolean('is_read').notNull().default(false),
    readAt: timestamp('read_at'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});
export const auditLogs = pgTable('audit_logs', {
    id: uuid('id').primaryKey().defaultRandom(),
    action: varchar('action', { length: 100 }).notNull(),
    actorId: uuid('actor_id').references(() => users.id),
    actorRole: varchar('actor_role', { length: 50 }),
    targetId: uuid('target_id'),
    targetType: varchar('target_type', { length: 50 }),
    metadata: jsonb('metadata'),
    ip: varchar('ip', { length: 50 }),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});
//# sourceMappingURL=notifications.js.map