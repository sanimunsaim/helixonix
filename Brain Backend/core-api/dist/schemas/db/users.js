/**
 * DB Schema — users table
 */
import { pgTable, uuid, varchar, text, boolean, integer, bigint, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core';
export const userRoleEnum = pgEnum('user_role', ['buyer', 'seller', 'admin', 'super_admin']);
export const userStatusEnum = pgEnum('user_status', ['active', 'suspended', 'banned', 'pending_verification']);
export const subscriptionPlanEnum = pgEnum('subscription_plan', ['free', 'pro', 'team', 'creator', 'pro_creator', 'studio']);
export const sellerLevelEnum = pgEnum('seller_level', ['new', 'level_1', 'level_2', 'top_rated']);
export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    username: varchar('username', { length: 50 }).notNull().unique(),
    displayName: varchar('display_name', { length: 100 }).notNull(),
    passwordHash: varchar('password_hash', { length: 255 }),
    role: userRoleEnum('role').notNull().default('buyer'),
    status: userStatusEnum('status').notNull().default('active'),
    avatarUrl: text('avatar_url'),
    bio: text('bio'),
    location: varchar('location', { length: 100 }),
    website: text('website'),
    // Subscription
    subscriptionPlan: subscriptionPlanEnum('subscription_plan').notNull().default('free'),
    subscriptionStatus: varchar('subscription_status', { length: 50 }).default('inactive'),
    subscriptionExpiresAt: timestamp('subscription_expires_at'),
    // Stripe
    stripeCustomerId: varchar('stripe_customer_id', { length: 100 }).unique(),
    stripeConnectAccountId: varchar('stripe_connect_account_id', { length: 100 }).unique(),
    stripeConnectOnboarded: boolean('stripe_connect_onboarded').notNull().default(false),
    // AI Credits
    aiCredits: integer('ai_credits').notNull().default(50),
    totalCreditsUsed: integer('total_credits_used').notNull().default(0),
    // Seller profile
    isSeller: boolean('is_seller').notNull().default(false),
    sellerLevel: sellerLevelEnum('seller_level').default('new'),
    sellerOnboardedAt: timestamp('seller_onboarded_at'),
    sellerVerified: boolean('seller_verified').notNull().default(false),
    skills: jsonb('skills').$type().default([]),
    // Seller earnings
    availableBalance: bigint('available_balance', { mode: 'number' }).notNull().default(0), // cents
    pendingBalance: bigint('pending_balance', { mode: 'number' }).notNull().default(0),
    totalEarned: bigint('total_earned', { mode: 'number' }).notNull().default(0),
    // Stats
    totalOrders: integer('total_orders').notNull().default(0),
    completedOrders: integer('completed_orders').notNull().default(0),
    avgRating: varchar('avg_rating', { length: 5 }).default('0.00'),
    totalReviews: integer('total_reviews').notNull().default(0),
    // OAuth
    googleId: varchar('google_id', { length: 100 }).unique(),
    // Auth
    emailVerified: boolean('email_verified').notNull().default(false),
    emailVerifiedAt: timestamp('email_verified_at'),
    twoFactorEnabled: boolean('two_factor_enabled').notNull().default(false),
    twoFactorSecret: varchar('two_factor_secret', { length: 100 }),
    lastLoginAt: timestamp('last_login_at'),
    lastLoginIp: varchar('last_login_ip', { length: 50 }),
    // Admin notes
    adminNotes: text('admin_notes'),
    bannedAt: timestamp('banned_at'),
    bannedReason: text('banned_reason'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
//# sourceMappingURL=users.js.map