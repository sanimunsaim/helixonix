/**
 * DB Schema — gigs table + gig_packages + gig_addons
 */

import {
  pgTable, uuid, varchar, text, boolean, integer, bigint, timestamp, jsonb, real, pgEnum
} from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const gigStatusEnum = pgEnum('gig_status', ['draft', 'active', 'paused', 'suspended', 'deleted']);
export const packageTypeEnum = pgEnum('package_type', ['basic', 'standard', 'premium']);

export const gigs = pgTable('gigs', {
  id: uuid('id').primaryKey().defaultRandom(),
  sellerId: uuid('seller_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description').notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  subcategory: varchar('subcategory', { length: 100 }),
  tags: jsonb('tags').$type<string[]>().default([]),
  status: gigStatusEnum('status').notNull().default('draft'),

  // Package pricing (summary — detailed in gig_packages)
  basicPrice: bigint('basic_price', { mode: 'number' }).notNull().default(0), // cents
  standardPrice: bigint('standard_price', { mode: 'number' }),
  premiumPrice: bigint('premium_price', { mode: 'number' }),

  // Media
  thumbnailUrl: text('thumbnail_url'),
  galleryUrls: jsonb('gallery_urls').$type<string[]>().default([]),
  videoUrl: text('video_url'),

  // Stats
  avgRating: real('avg_rating').notNull().default(0),
  totalReviews: integer('total_reviews').notNull().default(0),
  ordersCount: integer('orders_count').notNull().default(0),
  completedOrdersCount: integer('completed_orders_count').notNull().default(0),

  // Revenue
  totalRevenue: bigint('total_revenue', { mode: 'number' }).notNull().default(0),

  // SEO
  seoTitle: varchar('seo_title', { length: 255 }),

  isFeatured: boolean('is_featured').notNull().default(false),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const gigPackages = pgTable('gig_packages', {
  id: uuid('id').primaryKey().defaultRandom(),
  gigId: uuid('gig_id').notNull().references(() => gigs.id, { onDelete: 'cascade' }),
  packageType: packageTypeEnum('package_type').notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description').notNull(),
  price: bigint('price', { mode: 'number' }).notNull(), // cents
  deliveryDays: integer('delivery_days').notNull(),
  revisions: integer('revisions').notNull().default(1),
  features: jsonb('features').$type<string[]>().default([]),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const gigAddons = pgTable('gig_addons', {
  id: uuid('id').primaryKey().defaultRandom(),
  gigId: uuid('gig_id').notNull().references(() => gigs.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 100 }).notNull(),
  description: text('description'),
  price: bigint('price', { mode: 'number' }).notNull(), // cents
  deliveryDays: integer('delivery_days').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type Gig = typeof gigs.$inferSelect;
export type NewGig = typeof gigs.$inferInsert;
export type GigPackage = typeof gigPackages.$inferSelect;
export type GigAddon = typeof gigAddons.$inferSelect;
