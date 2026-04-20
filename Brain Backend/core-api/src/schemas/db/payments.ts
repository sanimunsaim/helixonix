/**
 * DB Schema — payments (asset purchases, subscriptions, credit packs, payouts)
 */

import {
  pgTable, uuid, varchar, text, integer, bigint, boolean, timestamp, jsonb, real, pgEnum
} from 'drizzle-orm/pg-core';
import { users } from './users.js';
import { assets } from './assets.js';

export const paymentTypeEnum = pgEnum('payment_type', ['asset_purchase', 'gig_order', 'subscription', 'credit_pack', 'payout']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'succeeded', 'failed', 'refunded', 'disputed']);
export const payoutStatusEnum = pgEnum('payout_status', ['pending', 'approved', 'processing', 'paid', 'failed']);

export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  type: paymentTypeEnum('type').notNull(),
  status: paymentStatusEnum('status').notNull().default('pending'),
  amountCents: bigint('amount_cents', { mode: 'number' }).notNull(),
  currency: varchar('currency', { length: 10 }).notNull().default('usd'),
  stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 100 }).unique(),
  stripeInvoiceId: varchar('stripe_invoice_id', { length: 100 }).unique(),
  metadata: jsonb('metadata'),
  description: text('description'),
  failureReason: text('failure_reason'),
  refundedAt: timestamp('refunded_at'),
  refundAmountCents: bigint('refund_amount_cents', { mode: 'number' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const assetPurchases = pgTable('asset_purchases', {
  id: uuid('id').primaryKey().defaultRandom(),
  buyerId: uuid('buyer_id').notNull().references(() => users.id),
  assetId: uuid('asset_id').notNull().references(() => assets.id),
  paymentId: uuid('payment_id').references(() => payments.id),
  licenseType: varchar('license_type', { length: 50 }).notNull(),
  amountPaid: bigint('amount_paid', { mode: 'number' }).notNull().default(0),
  downloadCount: integer('download_count').notNull().default(0),
  lastDownloadedAt: timestamp('last_downloaded_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id).unique(),
  plan: varchar('plan', { length: 50 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('inactive'),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 100 }).unique(),
  stripePriceId: varchar('stripe_price_id', { length: 100 }),
  currentPeriodStart: timestamp('current_period_start'),
  currentPeriodEnd: timestamp('current_period_end'),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').notNull().default(false),
  cancelledAt: timestamp('cancelled_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const payoutRequests = pgTable('payout_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  sellerId: uuid('seller_id').notNull().references(() => users.id),
  amountCents: bigint('amount_cents', { mode: 'number' }).notNull(),
  status: payoutStatusEnum('status').notNull().default('pending'),
  stripeTransferId: varchar('stripe_transfer_id', { length: 100 }),
  platformFeePercent: real('platform_fee_percent').notNull().default(5),
  netAmountCents: bigint('net_amount_cents', { mode: 'number' }).notNull(),
  processedAt: timestamp('processed_at'),
  paidAt: timestamp('paid_at'),
  failureReason: text('failure_reason'),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type Payment = typeof payments.$inferSelect;
export type AssetPurchase = typeof assetPurchases.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type PayoutRequest = typeof payoutRequests.$inferSelect;
