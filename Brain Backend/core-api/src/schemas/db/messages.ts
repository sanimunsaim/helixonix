/**
 * DB Schema — message_threads + messages
 */

import {
  pgTable, uuid, varchar, text, boolean, integer, timestamp, jsonb, pgEnum
} from 'drizzle-orm/pg-core';
import { users } from './users.js';
import { orders } from './orders.js';

export const threadTypeEnum = pgEnum('thread_type', ['order', 'support', 'custom_offer']);

export const messageThreads = pgTable('message_threads', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }),
  type: threadTypeEnum('type').notNull().default('order'),
  participantIds: jsonb('participant_ids').$type<string[]>().notNull().default([]),
  lastMessageAt: timestamp('last_message_at'),
  lastMessagePreview: varchar('last_message_preview', { length: 255 }),
  buyerUnreadCount: integer('buyer_unread_count').notNull().default(0),
  sellerUnreadCount: integer('seller_unread_count').notNull().default(0),
  isArchived: boolean('is_archived').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  threadId: uuid('thread_id').notNull().references(() => messageThreads.id, { onDelete: 'cascade' }),
  senderId: uuid('sender_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  attachmentKeys: jsonb('attachment_keys').$type<string[]>().default([]),
  isRead: boolean('is_read').notNull().default(false),
  readAt: timestamp('read_at'),
  isSystemMessage: boolean('is_system_message').notNull().default(false),
  editedAt: timestamp('edited_at'),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type MessageThread = typeof messageThreads.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
