/**
 * Routes — Admin: Content Moderation, Users, Finance, Analytics, System
 */

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { verifyJwt } from '../../middleware/auth.js';
import { requireAdmin } from '../../middleware/rbac.js';
import { db } from '../../lib/db.js';
import { assets, users, orders, disputes, payoutRequests } from '../../schemas/db/index.js';
import { eq, desc, and, sql } from 'drizzle-orm';
import { approveAsset, rejectAsset } from '../../services/asset.service.js';
import { notifyUser } from '../../lib/events.js';
import { writeAuditLog } from '../../lib/audit.js';
import { transferToSeller } from '../../lib/stripe.js';
import { completeOrder } from '../../services/order.service.js';

export async function adminRoutes(app: FastifyInstance) {

  const auth = [verifyJwt, requireAdmin];

  // ── Content: Moderation Queue ─────────────────────────────────────────────

  app.get('/content/queue', { preHandler: auth }, async (request, reply) => {
    const pending = await db.select().from(assets)
      .where(eq(assets.status, 'pending_review'))
      .orderBy(desc(assets.createdAt))
      .limit(50);
    return reply.send({ success: true, data: pending });
  });

  app.patch('/content/:assetId/approve', { preHandler: auth }, async (request, reply) => {
    const { assetId } = request.params as { assetId: string };
    const asset = await approveAsset(assetId, request.user.userId);
    return reply.send({ success: true, data: asset });
  });

  app.patch('/content/:assetId/reject', { preHandler: auth }, async (request, reply) => {
    const { assetId } = request.params as { assetId: string };
    const { reason } = z.object({ reason: z.string().min(5) }).parse(request.body);
    const asset = await rejectAsset(assetId, request.user.userId, reason);
    return reply.send({ success: true, data: asset });
  });

  // ── Users ────────────────────────────────────────────────────────────────

  app.get('/users', { preHandler: auth }, async (request, reply) => {
    const { page = '1', search = '' } = request.query as { page?: string; search?: string };
    const p = parseInt(page, 10) || 1;
    const list = await db.select().from(users)
      .orderBy(desc(users.createdAt))
      .limit(50).offset((p - 1) * 50);
    return reply.send({ success: true, data: list });
  });

  app.patch('/users/:userId/ban', { preHandler: auth }, async (request, reply) => {
    const { userId } = request.params as { userId: string };
    const { reason } = z.object({ reason: z.string().min(5) }).parse(request.body);
    await db.update(users).set({ status: 'banned', bannedAt: new Date(), bannedReason: reason, adminNotes: reason }).where(eq(users.id, userId));
    await writeAuditLog({ action: 'user.ban', actorId: request.user.userId, targetId: userId, targetType: 'user', metadata: { reason } });
    return reply.send({ success: true, data: { message: 'User banned' } });
  });

  app.patch('/users/:userId/unban', { preHandler: auth }, async (request, reply) => {
    const { userId } = request.params as { userId: string };
    await db.update(users).set({ status: 'active', bannedAt: null, bannedReason: null }).where(eq(users.id, userId));
    await writeAuditLog({ action: 'user.unban', actorId: request.user.userId, targetId: userId, targetType: 'user' });
    return reply.send({ success: true, data: { message: 'User unbanned' } });
  });

  // ── Orders ────────────────────────────────────────────────────────────────

  app.get('/orders', { preHandler: auth }, async (request, reply) => {
    const { page = '1', status = '' } = request.query as { page?: string; status?: string };
    const p = parseInt(page, 10) || 1;
    const list = await db.select().from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(50).offset((p - 1) * 50);
    return reply.send({ success: true, data: list });
  });

  // ── Disputes ───────────────────────────────────────────────────────────────

  app.get('/disputes', { preHandler: auth }, async (request, reply) => {
    const list = await db.select().from(disputes)
      .where(eq(disputes.status, 'open'))
      .orderBy(desc(disputes.createdAt))
      .limit(50);
    return reply.send({ success: true, data: list });
  });

  app.patch('/disputes/:disputeId/resolve', { preHandler: auth }, async (request, reply) => {
    const { disputeId } = request.params as { disputeId: string };
    const body = z.object({
      outcome: z.enum(['refund_buyer', 'release_seller', 'partial_refund', 'no_action']),
      refund_amount_cents: z.number().optional(),
      notes: z.string().optional(),
    }).parse(request.body);

    const dispute = await db.query.disputes.findFirst({ where: eq(disputes.id, disputeId) });
    if (!dispute) return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Dispute not found' } });

    await db.update(disputes).set({
      status: 'resolved', outcome: body.outcome as any,
      resolvedBy: request.user.userId, resolvedAt: new Date(),
      refundAmountCents: body.refund_amount_cents,
    }).where(eq(disputes.id, disputeId));

    if (body.outcome === 'release_seller') {
      await completeOrder(dispute.orderId);
    }

    await writeAuditLog({ action: 'admin.action', actorId: request.user.userId, targetId: disputeId, targetType: 'dispute', metadata: { outcome: body.outcome } });
    return reply.send({ success: true, data: { message: `Dispute resolved: ${body.outcome}` } });
  });

  // ── Finance: Payouts ──────────────────────────────────────────────────────

  app.get('/finance/payouts', { preHandler: auth }, async (request, reply) => {
    const list = await db.select().from(payoutRequests).orderBy(desc(payoutRequests.createdAt)).limit(50);
    return reply.send({ success: true, data: list });
  });

  app.post('/finance/payouts/:payoutId/process', { preHandler: auth }, async (request, reply) => {
    const { payoutId } = request.params as { payoutId: string };
    const payout = await db.query.payoutRequests.findFirst({ where: eq(payoutRequests.id, payoutId) });
    if (!payout || payout.status !== 'pending') {
      return reply.status(400).send({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Payout not pending' } });
    }
    const seller = await db.query.users.findFirst({ where: eq(users.id, payout.sellerId) });
    if (!seller?.stripeConnectAccountId) {
      return reply.status(400).send({ success: false, error: { code: 'SELLER_NOT_ONBOARDED', message: 'Seller not onboarded' } });
    }

    await db.update(payoutRequests).set({ status: 'processing', processedAt: new Date() }).where(eq(payoutRequests.id, payoutId));
    await transferToSeller({
      amountCents: payout.netAmountCents,
      sellerId: payout.sellerId,
      stripeConnectAccountId: seller.stripeConnectAccountId,
      payoutRequestId: payoutId,
    });

    await writeAuditLog({ action: 'payout.process', actorId: request.user.userId, targetId: payoutId, targetType: 'payout' });
    return reply.send({ success: true, data: { message: 'Payout processing initiated' } });
  });

  // ── Analytics ─────────────────────────────────────────────────────────────

  app.get('/analytics/overview', { preHandler: auth }, async (request, reply) => {
    const [userCount] = await db.select({ count: sql<number>`count(*)::int` }).from(users);
    const [orderCount] = await db.select({ count: sql<number>`count(*)::int` }).from(orders);
    const [assetCount] = await db.select({ count: sql<number>`count(*)::int` }).from(assets).where(eq(assets.status, 'approved'));
    return reply.send({ success: true, data: { users: userCount.count, orders: orderCount.count, assets: assetCount.count } });
  });

  // ── System: Health ────────────────────────────────────────────────────────

  app.get('/system/health-full', { preHandler: auth }, async (request, reply) => {
    const { pingDatabase } = await import('../../lib/db.js');
    const { pingRedis } = await import('../../lib/redis.js');
    const { pingTypesense } = await import('../../lib/typesense.js');
    const [db_ok, redis_ok, typesense_ok] = await Promise.allSettled([pingDatabase(), pingRedis(), pingTypesense()]);
    return reply.send({ success: true, data: {
      database: db_ok.status === 'fulfilled' && db_ok.value,
      redis: redis_ok.status === 'fulfilled' && redis_ok.value,
      typesense: typesense_ok.status === 'fulfilled' && typesense_ok.value,
    }});
  });
}
