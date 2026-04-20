/**
 * DB Schema — orders + escrow_holds + disputes + reviews
 */
import { pgTable, uuid, varchar, text, boolean, integer, bigint, timestamp, jsonb, real, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users.js';
import { gigs, gigPackages } from './gigs.js';
export const orderStatusEnum = pgEnum('order_status', [
    'pending', 'active', 'delivered', 'revision_requested',
    'completed', 'cancelled', 'disputed', 'refunded'
]);
export const disputeStatusEnum = pgEnum('dispute_status', ['open', 'under_review', 'resolved', 'escalated']);
export const disputeOutcomeEnum = pgEnum('dispute_outcome', ['refund_buyer', 'release_seller', 'partial_refund', 'no_action']);
export const orders = pgTable('orders', {
    id: uuid('id').primaryKey().defaultRandom(),
    buyerId: uuid('buyer_id').notNull().references(() => users.id),
    sellerId: uuid('seller_id').notNull().references(() => users.id),
    gigId: uuid('gig_id').notNull().references(() => gigs.id),
    packageId: uuid('package_id').references(() => gigPackages.id),
    packageType: varchar('package_type', { length: 20 }).notNull(),
    status: orderStatusEnum('status').notNull().default('pending'),
    // Pricing
    subtotal: bigint('subtotal', { mode: 'number' }).notNull(), // cents
    addonTotal: bigint('addon_total', { mode: 'number' }).notNull().default(0),
    total: bigint('total', { mode: 'number' }).notNull(), // cents
    platformFeePercent: real('platform_fee_percent').notNull().default(20),
    platformFee: bigint('platform_fee', { mode: 'number' }).notNull().default(0),
    sellerEarnings: bigint('seller_earnings', { mode: 'number' }).notNull().default(0),
    // Stripe
    stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 100 }),
    stripeTransferId: varchar('stripe_transfer_id', { length: 100 }),
    // Delivery
    requirements: text('requirements'),
    deliveryDays: integer('delivery_days').notNull(),
    deliveryDueAt: timestamp('delivery_due_at'),
    revisionsAllowed: integer('revisions_allowed').notNull().default(1),
    revisionsUsed: integer('revisions_used').notNull().default(0),
    // Delivery files
    deliveryFileKeys: jsonb('delivery_file_keys').$type().default([]),
    deliveryMessage: text('delivery_message'),
    deliveredAt: timestamp('delivered_at'),
    // Completion
    completedAt: timestamp('completed_at'),
    autoCompleteAt: timestamp('auto_complete_at'),
    cancelledAt: timestamp('cancelled_at'),
    cancellationReason: text('cancellation_reason'),
    addonIds: jsonb('addon_ids').$type().default([]),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
export const escrowHolds = pgTable('escrow_holds', {
    id: uuid('id').primaryKey().defaultRandom(),
    orderId: uuid('order_id').notNull().references(() => orders.id).unique(),
    amountCents: bigint('amount_cents', { mode: 'number' }).notNull(),
    status: varchar('status', { length: 50 }).notNull().default('held'), // held | released | refunded
    heldAt: timestamp('held_at').notNull().defaultNow(),
    releasedAt: timestamp('released_at'),
    refundedAt: timestamp('refunded_at'),
});
export const disputes = pgTable('disputes', {
    id: uuid('id').primaryKey().defaultRandom(),
    orderId: uuid('order_id').notNull().references(() => orders.id),
    raisedBy: uuid('raised_by').notNull().references(() => users.id),
    status: disputeStatusEnum('status').notNull().default('open'),
    reason: varchar('reason', { length: 100 }).notNull(),
    description: text('description').notNull(),
    evidence: jsonb('evidence').$type().default([]),
    aiRecommendation: jsonb('ai_recommendation'),
    outcome: disputeOutcomeEnum('outcome'),
    resolvedBy: uuid('resolved_by').references(() => users.id),
    resolvedAt: timestamp('resolved_at'),
    refundAmountCents: bigint('refund_amount_cents', { mode: 'number' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
export const reviews = pgTable('reviews', {
    id: uuid('id').primaryKey().defaultRandom(),
    orderId: uuid('order_id').notNull().references(() => orders.id).unique(),
    gigId: uuid('gig_id').notNull().references(() => gigs.id),
    buyerId: uuid('buyer_id').notNull().references(() => users.id),
    sellerId: uuid('seller_id').notNull().references(() => users.id),
    rating: integer('rating').notNull(), // 1-5
    comment: text('comment'),
    sellerResponse: text('seller_response'),
    sellerRespondedAt: timestamp('seller_responded_at'),
    isVisible: boolean('is_visible').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});
//# sourceMappingURL=orders.js.map