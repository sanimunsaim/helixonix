CREATE TYPE "public"."seller_level" AS ENUM('new', 'level_1', 'level_2', 'top_rated');--> statement-breakpoint
CREATE TYPE "public"."subscription_plan" AS ENUM('free', 'pro', 'team', 'creator', 'pro_creator', 'studio');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('buyer', 'seller', 'admin', 'super_admin');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'suspended', 'banned', 'pending_verification');--> statement-breakpoint
CREATE TYPE "public"."asset_status" AS ENUM('draft', 'pending_review', 'approved', 'rejected', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."asset_type" AS ENUM('image', 'video', 'audio', 'template', 'vector', 'font', 'ui_kit', 'other');--> statement-breakpoint
CREATE TYPE "public"."license_type" AS ENUM('free', 'standard', 'extended', 'custom');--> statement-breakpoint
CREATE TYPE "public"."gig_status" AS ENUM('draft', 'active', 'paused', 'suspended', 'deleted');--> statement-breakpoint
CREATE TYPE "public"."package_type" AS ENUM('basic', 'standard', 'premium');--> statement-breakpoint
CREATE TYPE "public"."dispute_outcome" AS ENUM('refund_buyer', 'release_seller', 'partial_refund', 'no_action');--> statement-breakpoint
CREATE TYPE "public"."dispute_status" AS ENUM('open', 'under_review', 'resolved', 'escalated');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'active', 'delivered', 'revision_requested', 'completed', 'cancelled', 'disputed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'succeeded', 'failed', 'refunded', 'disputed');--> statement-breakpoint
CREATE TYPE "public"."payment_type" AS ENUM('asset_purchase', 'gig_order', 'subscription', 'credit_pack', 'payout');--> statement-breakpoint
CREATE TYPE "public"."payout_status" AS ENUM('pending', 'approved', 'processing', 'paid', 'failed');--> statement-breakpoint
CREATE TYPE "public"."ai_status" AS ENUM('queued', 'processing', 'completed', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."credit_tx_type" AS ENUM('purchase', 'award', 'deduct', 'refund', 'expire');--> statement-breakpoint
CREATE TYPE "public"."thread_type" AS ENUM('order', 'support', 'custom_offer');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('order_new', 'order_delivered', 'order_completed', 'order_cancelled', 'order_disputed', 'message_new', 'payment_received', 'payout_processed', 'asset_approved', 'asset_rejected', 'review_received', 'credits_updated', 'ai_generation_complete', 'system_alert');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"username" varchar(50) NOT NULL,
	"display_name" varchar(100) NOT NULL,
	"password_hash" varchar(255),
	"role" "user_role" DEFAULT 'buyer' NOT NULL,
	"status" "user_status" DEFAULT 'active' NOT NULL,
	"avatar_url" text,
	"bio" text,
	"location" varchar(100),
	"website" text,
	"subscription_plan" "subscription_plan" DEFAULT 'free' NOT NULL,
	"subscription_status" varchar(50) DEFAULT 'inactive',
	"subscription_expires_at" timestamp,
	"stripe_customer_id" varchar(100),
	"stripe_connect_account_id" varchar(100),
	"stripe_connect_onboarded" boolean DEFAULT false NOT NULL,
	"ai_credits" integer DEFAULT 50 NOT NULL,
	"total_credits_used" integer DEFAULT 0 NOT NULL,
	"is_seller" boolean DEFAULT false NOT NULL,
	"seller_level" "seller_level" DEFAULT 'new',
	"seller_onboarded_at" timestamp,
	"seller_verified" boolean DEFAULT false NOT NULL,
	"skills" jsonb DEFAULT '[]'::jsonb,
	"available_balance" bigint DEFAULT 0 NOT NULL,
	"pending_balance" bigint DEFAULT 0 NOT NULL,
	"total_earned" bigint DEFAULT 0 NOT NULL,
	"total_orders" integer DEFAULT 0 NOT NULL,
	"completed_orders" integer DEFAULT 0 NOT NULL,
	"avg_rating" varchar(5) DEFAULT '0.00',
	"total_reviews" integer DEFAULT 0 NOT NULL,
	"google_id" varchar(100),
	"email_verified" boolean DEFAULT false NOT NULL,
	"email_verified_at" timestamp,
	"two_factor_enabled" boolean DEFAULT false NOT NULL,
	"two_factor_secret" varchar(100),
	"last_login_at" timestamp,
	"last_login_ip" varchar(50),
	"admin_notes" text,
	"banned_at" timestamp,
	"banned_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_stripe_customer_id_unique" UNIQUE("stripe_customer_id"),
	CONSTRAINT "users_stripe_connect_account_id_unique" UNIQUE("stripe_connect_account_id"),
	CONSTRAINT "users_google_id_unique" UNIQUE("google_id")
);
--> statement-breakpoint
CREATE TABLE "assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"seller_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"type" "asset_type" NOT NULL,
	"category" varchar(100) NOT NULL,
	"subcategory" varchar(100),
	"tags" jsonb DEFAULT '[]'::jsonb,
	"license_type" "license_type" DEFAULT 'standard' NOT NULL,
	"is_free" boolean DEFAULT false NOT NULL,
	"price" bigint DEFAULT 0 NOT NULL,
	"extended_price" bigint DEFAULT 0,
	"original_key" text,
	"thumbnail_key" text,
	"preview_keys" jsonb DEFAULT '[]'::jsonb,
	"watermarked_key" text,
	"file_size" bigint,
	"file_mime_type" varchar(100),
	"file_extension" varchar(20),
	"status" "asset_status" DEFAULT 'draft' NOT NULL,
	"moderation_score" real,
	"copyright_risk" real,
	"quality_score" real,
	"auto_moderation_passed" boolean,
	"moderation_notes" text,
	"rejection_reason" text,
	"approved_at" timestamp,
	"approved_by" uuid,
	"download_count" integer DEFAULT 0 NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"favorite_count" integer DEFAULT 0 NOT NULL,
	"purchase_count" integer DEFAULT 0 NOT NULL,
	"total_revenue" bigint DEFAULT 0 NOT NULL,
	"seo_title" varchar(255),
	"seo_description" text,
	"is_featured" boolean DEFAULT false NOT NULL,
	"featured_until" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "assets_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "gig_addons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gig_id" uuid NOT NULL,
	"title" varchar(100) NOT NULL,
	"description" text,
	"price" bigint NOT NULL,
	"delivery_days" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gig_packages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gig_id" uuid NOT NULL,
	"package_type" "package_type" NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text NOT NULL,
	"price" bigint NOT NULL,
	"delivery_days" integer NOT NULL,
	"revisions" integer DEFAULT 1 NOT NULL,
	"features" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gigs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"seller_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"category" varchar(100) NOT NULL,
	"subcategory" varchar(100),
	"tags" jsonb DEFAULT '[]'::jsonb,
	"status" "gig_status" DEFAULT 'draft' NOT NULL,
	"basic_price" bigint DEFAULT 0 NOT NULL,
	"standard_price" bigint,
	"premium_price" bigint,
	"thumbnail_url" text,
	"gallery_urls" jsonb DEFAULT '[]'::jsonb,
	"video_url" text,
	"avg_rating" real DEFAULT 0 NOT NULL,
	"total_reviews" integer DEFAULT 0 NOT NULL,
	"orders_count" integer DEFAULT 0 NOT NULL,
	"completed_orders_count" integer DEFAULT 0 NOT NULL,
	"total_revenue" bigint DEFAULT 0 NOT NULL,
	"seo_title" varchar(255),
	"is_featured" boolean DEFAULT false NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "gigs_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "disputes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"raised_by" uuid NOT NULL,
	"status" "dispute_status" DEFAULT 'open' NOT NULL,
	"reason" varchar(100) NOT NULL,
	"description" text NOT NULL,
	"evidence" jsonb DEFAULT '[]'::jsonb,
	"ai_recommendation" jsonb,
	"outcome" "dispute_outcome",
	"resolved_by" uuid,
	"resolved_at" timestamp,
	"refund_amount_cents" bigint,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "escrow_holds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"amount_cents" bigint NOT NULL,
	"status" varchar(50) DEFAULT 'held' NOT NULL,
	"held_at" timestamp DEFAULT now() NOT NULL,
	"released_at" timestamp,
	"refunded_at" timestamp,
	CONSTRAINT "escrow_holds_order_id_unique" UNIQUE("order_id")
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"buyer_id" uuid NOT NULL,
	"seller_id" uuid NOT NULL,
	"gig_id" uuid NOT NULL,
	"package_id" uuid,
	"package_type" varchar(20) NOT NULL,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"subtotal" bigint NOT NULL,
	"addon_total" bigint DEFAULT 0 NOT NULL,
	"total" bigint NOT NULL,
	"platform_fee_percent" real DEFAULT 20 NOT NULL,
	"platform_fee" bigint DEFAULT 0 NOT NULL,
	"seller_earnings" bigint DEFAULT 0 NOT NULL,
	"stripe_payment_intent_id" varchar(100),
	"stripe_transfer_id" varchar(100),
	"requirements" text,
	"delivery_days" integer NOT NULL,
	"delivery_due_at" timestamp,
	"revisions_allowed" integer DEFAULT 1 NOT NULL,
	"revisions_used" integer DEFAULT 0 NOT NULL,
	"delivery_file_keys" jsonb DEFAULT '[]'::jsonb,
	"delivery_message" text,
	"delivered_at" timestamp,
	"completed_at" timestamp,
	"auto_complete_at" timestamp,
	"cancelled_at" timestamp,
	"cancellation_reason" text,
	"addon_ids" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"gig_id" uuid NOT NULL,
	"buyer_id" uuid NOT NULL,
	"seller_id" uuid NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"seller_response" text,
	"seller_responded_at" timestamp,
	"is_visible" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "reviews_order_id_unique" UNIQUE("order_id")
);
--> statement-breakpoint
CREATE TABLE "asset_purchases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"buyer_id" uuid NOT NULL,
	"asset_id" uuid NOT NULL,
	"payment_id" uuid,
	"license_type" varchar(50) NOT NULL,
	"amount_paid" bigint DEFAULT 0 NOT NULL,
	"download_count" integer DEFAULT 0 NOT NULL,
	"last_downloaded_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "payment_type" NOT NULL,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"amount_cents" bigint NOT NULL,
	"currency" varchar(10) DEFAULT 'usd' NOT NULL,
	"stripe_payment_intent_id" varchar(100),
	"stripe_invoice_id" varchar(100),
	"metadata" jsonb,
	"description" text,
	"failure_reason" text,
	"refunded_at" timestamp,
	"refund_amount_cents" bigint,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payments_stripe_payment_intent_id_unique" UNIQUE("stripe_payment_intent_id"),
	CONSTRAINT "payments_stripe_invoice_id_unique" UNIQUE("stripe_invoice_id")
);
--> statement-breakpoint
CREATE TABLE "payout_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"seller_id" uuid NOT NULL,
	"amount_cents" bigint NOT NULL,
	"status" "payout_status" DEFAULT 'pending' NOT NULL,
	"stripe_transfer_id" varchar(100),
	"platform_fee_percent" real DEFAULT 5 NOT NULL,
	"net_amount_cents" bigint NOT NULL,
	"processed_at" timestamp,
	"paid_at" timestamp,
	"failure_reason" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"plan" varchar(50) NOT NULL,
	"status" varchar(50) DEFAULT 'inactive' NOT NULL,
	"stripe_subscription_id" varchar(100),
	"stripe_price_id" varchar(100),
	"current_period_start" timestamp,
	"current_period_end" timestamp,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"cancelled_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscriptions_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "subscriptions_stripe_subscription_id_unique" UNIQUE("stripe_subscription_id")
);
--> statement-breakpoint
CREATE TABLE "ai_generations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"tool_type" varchar(50) NOT NULL,
	"prompt" text,
	"parameters" jsonb,
	"model_version" varchar(255),
	"replicate_prediction_id" varchar(100),
	"status" "ai_status" DEFAULT 'queued' NOT NULL,
	"output_urls" jsonb DEFAULT '[]'::jsonb,
	"output_keys" jsonb DEFAULT '[]'::jsonb,
	"credits_used" integer DEFAULT 0 NOT NULL,
	"processing_time_ms" integer,
	"error_message" text,
	"is_published" varchar(10) DEFAULT 'false',
	"published_asset_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "credit_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "credit_tx_type" NOT NULL,
	"amount" integer NOT NULL,
	"balance_after" integer NOT NULL,
	"reason" text NOT NULL,
	"reference_id" uuid,
	"reference_type" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "message_threads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid,
	"type" "thread_type" DEFAULT 'order' NOT NULL,
	"participant_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"last_message_at" timestamp,
	"last_message_preview" varchar(255),
	"buyer_unread_count" integer DEFAULT 0 NOT NULL,
	"seller_unread_count" integer DEFAULT 0 NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"thread_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"content" text NOT NULL,
	"attachment_keys" jsonb DEFAULT '[]'::jsonb,
	"is_read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp,
	"is_system_message" boolean DEFAULT false NOT NULL,
	"edited_at" timestamp,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"action" varchar(100) NOT NULL,
	"actor_id" uuid,
	"actor_role" varchar(50),
	"target_id" uuid,
	"target_type" varchar(50),
	"metadata" jsonb,
	"ip" varchar(50),
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"action_url" text,
	"is_read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gig_addons" ADD CONSTRAINT "gig_addons_gig_id_gigs_id_fk" FOREIGN KEY ("gig_id") REFERENCES "public"."gigs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gig_packages" ADD CONSTRAINT "gig_packages_gig_id_gigs_id_fk" FOREIGN KEY ("gig_id") REFERENCES "public"."gigs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gigs" ADD CONSTRAINT "gigs_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_raised_by_users_id_fk" FOREIGN KEY ("raised_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "escrow_holds" ADD CONSTRAINT "escrow_holds_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_gig_id_gigs_id_fk" FOREIGN KEY ("gig_id") REFERENCES "public"."gigs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_package_id_gig_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."gig_packages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_gig_id_gigs_id_fk" FOREIGN KEY ("gig_id") REFERENCES "public"."gigs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_purchases" ADD CONSTRAINT "asset_purchases_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_purchases" ADD CONSTRAINT "asset_purchases_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_purchases" ADD CONSTRAINT "asset_purchases_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payout_requests" ADD CONSTRAINT "payout_requests_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_generations" ADD CONSTRAINT "ai_generations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_transactions" ADD CONSTRAINT "credit_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_threads" ADD CONSTRAINT "message_threads_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_thread_id_message_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."message_threads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;