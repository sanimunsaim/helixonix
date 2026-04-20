/**
 * Routes — Payments
 * POST /payments/checkout/asset, /checkout/gig, /subscription/create, /webhooks/stripe
 */

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { verifyJwt } from '../middleware/auth.js';
import { checkoutAsset, checkoutGig, handleStripeWebhook } from '../services/payment.service.js';
import { stripe, createSubscription, getOrCreateStripeCustomer, transferToSeller } from '../lib/stripe.js';
import { db } from '../lib/db.js';
import { users, subscriptions, payoutRequests } from '../schemas/db/index.js';
import { eq } from 'drizzle-orm';
import { stripePriceMap, creditPackMap } from '../config.js';

export async function paymentRoutes(app: FastifyInstance) {

  // ── Asset Checkout ────────────────────────────────────────────────────────

  app.post('/checkout/asset', { preHandler: [verifyJwt] }, async (request, reply) => {
    const body = z.object({
      asset_id: z.string().uuid(),
      license_type: z.enum(['standard', 'extended']).default('standard'),
    }).parse(request.body);

    const result = await checkoutAsset({
      assetId: body.asset_id,
      buyerId: request.user.userId,
      licenseType: body.license_type,
    });
    return reply.send({ success: true, data: result });
  });

  // ── Gig Checkout ──────────────────────────────────────────────────────────

  app.post('/checkout/gig', { preHandler: [verifyJwt] }, async (request, reply) => {
    const body = z.object({
      gig_id: z.string().uuid(),
      package_type: z.enum(['basic', 'standard', 'premium']),
      addon_ids: z.array(z.string().uuid()).default([]),
      requirements: z.string().max(5000).optional(),
    }).parse(request.body);

    const result = await checkoutGig({
      gigId: body.gig_id,
      buyerId: request.user.userId,
      packageType: body.package_type,
      addonIds: body.addon_ids,
      requirements: body.requirements,
    });
    return reply.send({ success: true, data: result });
  });

  // ── Subscription Create ───────────────────────────────────────────────────

  app.post('/subscription/create', { preHandler: [verifyJwt] }, async (request, reply) => {
    const { plan } = z.object({
      plan: z.enum(['pro', 'team', 'creator', 'pro_creator', 'studio']),
    }).parse(request.body);

    const priceId = stripePriceMap[plan];
    if (!priceId) return reply.status(400).send({ success: false, error: { code: 'VALIDATION_ERROR', message: `No price configured for plan: ${plan}` } });

    const user = await db.query.users.findFirst({ where: eq(users.id, request.user.userId) });
    if (!user) return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });

    const customerId = await getOrCreateStripeCustomer(user.id, user.email, user.displayName, user.stripeCustomerId ?? undefined);
    if (!user.stripeCustomerId) {
      await db.update(users).set({ stripeCustomerId: customerId }).where(eq(users.id, user.id));
    }

    const sub = await createSubscription({ customerId, priceId, userId: user.id });
    const latestInvoice = sub.latest_invoice as any;
    const clientSecret = latestInvoice?.payment_intent?.client_secret;

    await db.insert(subscriptions).values({
      userId: user.id,
      plan,
      status: 'incomplete',
      stripeSubscriptionId: sub.id,
      stripePriceId: priceId,
    }).onConflictDoUpdate({ target: subscriptions.userId, set: { plan, stripeSubscriptionId: sub.id, status: 'incomplete' } });

    return reply.send({ success: true, data: { clientSecret, subscriptionId: sub.id } });
  });

  // ── Credits Purchase ──────────────────────────────────────────────────────

  app.post('/credits/purchase', { preHandler: [verifyJwt] }, async (request, reply) => {
    const { pack_id } = z.object({ pack_id: z.enum(['100', '500', '2000']) }).parse(request.body);
    const pack = creditPackMap[pack_id];
    if (!pack) return reply.status(400).send({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid pack' } });

    const user = await db.query.users.findFirst({ where: eq(users.id, request.user.userId) });
    if (!user) return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });

    const customerId = await getOrCreateStripeCustomer(user.id, user.email, user.displayName, user.stripeCustomerId ?? undefined);
    const pi = await stripe.paymentIntents.create({
      amount: pack.amount,
      currency: 'usd',
      customer: customerId,
      automatic_payment_methods: { enabled: true },
      metadata: { order_type: 'credits', buyer_id: user.id, pack_id, credits: pack.credits.toString() },
    });

    return reply.send({ success: true, data: { clientSecret: pi.client_secret, amount: pack.amount, credits: pack.credits } });
  });

  // ── Payout Request ────────────────────────────────────────────────────────

  app.post('/payout/request', { preHandler: [verifyJwt] }, async (request, reply) => {
    const { amount_cents } = z.object({ amount_cents: z.number().min(1000) }).parse(request.body);
    const user = await db.query.users.findFirst({ where: eq(users.id, request.user.userId) });
    if (!user) return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
    if (!user.stripeConnectOnboarded) {
      return reply.status(400).send({ success: false, error: { code: 'SELLER_NOT_ONBOARDED', message: 'Complete Stripe onboarding first' } });
    }
    if (user.availableBalance < amount_cents) {
      return reply.status(400).send({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Insufficient balance' } });
    }

    const netAmount = Math.floor(amount_cents * 0.95); // 5% payout fee
    const [payout] = await db.insert(payoutRequests).values({
      sellerId: user.id,
      amountCents: amount_cents,
      netAmountCents: netAmount,
      platformFeePercent: 5,
      status: 'pending',
    }).returning();

    return reply.send({ success: true, data: payout });
  });

  // ── Stripe Webhook (raw body required) ───────────────────────────────────

  app.post('/webhooks/stripe', {
    config: { rawBody: true },
  }, async (request, reply) => {
    const sig = request.headers['stripe-signature'] as string;
    if (!sig) return reply.status(400).send({ success: false, error: { code: 'INVALID_WEBHOOK', message: 'Missing signature' } });

    await handleStripeWebhook((request as any).rawBody as Buffer, sig);
    return reply.send({ received: true });
  });
}
