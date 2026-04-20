/**
 * DB Schema — assets table
 */

import {
  pgTable, uuid, varchar, text, boolean, integer, bigint, timestamp, jsonb, real, pgEnum
} from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const assetTypeEnum = pgEnum('asset_type', ['image', 'video', 'audio', 'template', 'vector', 'font', 'ui_kit', 'other']);
export const assetStatusEnum = pgEnum('asset_status', ['draft', 'pending_review', 'approved', 'rejected', 'suspended']);
export const licenseTypeEnum = pgEnum('license_type', ['free', 'standard', 'extended', 'custom']);

export const assets = pgTable('assets', {
  id: uuid('id').primaryKey().defaultRandom(),
  sellerId: uuid('seller_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  type: assetTypeEnum('type').notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  subcategory: varchar('subcategory', { length: 100 }),
  tags: jsonb('tags').$type<string[]>().default([]),

  // Pricing
  licenseType: licenseTypeEnum('license_type').notNull().default('standard'),
  isFree: boolean('is_free').notNull().default(false),
  price: bigint('price', { mode: 'number' }).notNull().default(0), // cents
  extendedPrice: bigint('extended_price', { mode: 'number' }).default(0),

  // Files (R2 keys)
  originalKey: text('original_key'),
  thumbnailKey: text('thumbnail_key'),
  previewKeys: jsonb('preview_keys').$type<string[]>().default([]),
  watermarkedKey: text('watermarked_key'),
  fileSize: bigint('file_size', { mode: 'number' }),
  fileMimeType: varchar('file_mime_type', { length: 100 }),
  fileExtension: varchar('file_extension', { length: 20 }),

  // Status & Moderation
  status: assetStatusEnum('status').notNull().default('draft'),
  moderationScore: real('moderation_score'),
  copyrightRisk: real('copyright_risk'),
  qualityScore: real('quality_score'),
  autoModerationPassed: boolean('auto_moderation_passed'),
  moderationNotes: text('moderation_notes'),
  rejectionReason: text('rejection_reason'),
  approvedAt: timestamp('approved_at'),
  approvedBy: uuid('approved_by').references(() => users.id),

  // Stats (high frequency — Redis cache, flush hourly)
  downloadCount: integer('download_count').notNull().default(0),
  viewCount: integer('view_count').notNull().default(0),
  favoriteCount: integer('favorite_count').notNull().default(0),
  purchaseCount: integer('purchase_count').notNull().default(0),

  // Revenue
  totalRevenue: bigint('total_revenue', { mode: 'number' }).notNull().default(0), // cents

  // SEO
  seoTitle: varchar('seo_title', { length: 255 }),
  seoDescription: text('seo_description'),

  // Feature flags
  isFeatured: boolean('is_featured').notNull().default(false),
  featuredUntil: timestamp('featured_until'),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type Asset = typeof assets.$inferSelect;
export type NewAsset = typeof assets.$inferInsert;
