/**
 * Routes — Internal (HELIX-BRAIN → Core API)
 * Protected by X-Internal-Secret header
 */
import { z } from 'zod';
import { verifyHelixBrainKey } from '../../middleware/auth.js';
import { db } from '../../lib/db.js';
import { users, assets, orders, disputes } from '../../schemas/db/index.js';
import { eq, sql } from 'drizzle-orm';
import { publishEvent } from '../../lib/events.js';
import { approveAsset } from '../../services/asset.service.js';
import { completeOrder } from '../../services/order.service.js';
export async function internalHelixBrainRoutes(app) {
    const auth = [verifyHelixBrainKey];
    // ── HELIX-BRAIN auto-approves an asset ────────────────────────────────────
    app.post('/assets/:assetId/auto-approve', { preHandler: auth }, async (request, reply) => {
        const { assetId } = request.params;
        const asset = await approveAsset(assetId, 'helix-brain');
        return reply.send({ success: true, data: asset });
    });
    // ── HELIX-BRAIN updates asset moderation scores ────────────────────────────
    app.patch('/assets/:assetId/moderation-scores', { preHandler: auth }, async (request, reply) => {
        const { assetId } = request.params;
        const body = z.object({
            moderation_score: z.number().min(0).max(100),
            copyright_risk: z.number().min(0).max(100),
            quality_score: z.number().min(0).max(100),
            auto_moderation_passed: z.boolean(),
            moderation_notes: z.string().optional(),
        }).parse(request.body);
        const [asset] = await db.update(assets).set({
            moderationScore: body.moderation_score,
            copyrightRisk: body.copyright_risk,
            qualityScore: body.quality_score,
            autoModerationPassed: body.auto_moderation_passed,
            moderationNotes: body.moderation_notes,
            status: body.auto_moderation_passed ? 'approved' : 'pending_review',
        }).where(eq(assets.id, assetId)).returning();
        await publishEvent('asset.approved', { assetId, autoApproved: true });
        return reply.send({ success: true, data: asset });
    });
    // ── HELIX-BRAIN auto-completes overdue orders ─────────────────────────────
    app.post('/orders/:orderId/auto-complete', { preHandler: auth }, async (request, reply) => {
        const { orderId } = request.params;
        await completeOrder(orderId);
        return reply.send({ success: true, data: { message: 'Order auto-completed' } });
    });
    // ── HELIX-BRAIN attaches dispute AI recommendation ────────────────────────
    app.patch('/disputes/:disputeId/ai-recommendation', { preHandler: auth }, async (request, reply) => {
        const { disputeId } = request.params;
        const { recommendation } = z.object({ recommendation: z.record(z.unknown()) }).parse(request.body);
        const [dispute] = await db.update(disputes)
            .set({ aiRecommendation: recommendation })
            .where(eq(disputes.id, disputeId))
            .returning();
        return reply.send({ success: true, data: dispute });
    });
    // ── HELIX-BRAIN updates seller level ─────────────────────────────────────
    app.patch('/users/:userId/seller-level', { preHandler: auth }, async (request, reply) => {
        const { userId } = request.params;
        const { level } = z.object({ level: z.enum(['new', 'level_1', 'level_2', 'top_rated']) }).parse(request.body);
        const [user] = await db.update(users).set({ sellerLevel: level }).where(eq(users.id, userId)).returning();
        await publishEvent('seller.level_changed', { userId, level });
        return reply.send({ success: true, data: user });
    });
    // ── HELIX-BRAIN queries orders/users for AI jobs ──────────────────────────
    app.get('/overdue-orders', { preHandler: auth }, async (_request, reply) => {
        const overdue = await db.select().from(orders)
            .where(sql `status = 'delivered' AND auto_complete_at < NOW()`)
            .limit(100);
        return reply.send({ success: true, data: overdue });
    });
    app.get('/pending-payouts', { preHandler: auth }, async (_request, reply) => {
        const { payoutRequests } = await import('../../schemas/db/index.js');
        const pending = await db.select().from(payoutRequests).where(eq(payoutRequests.status, 'pending')).limit(50);
        return reply.send({ success: true, data: pending });
    });
    // ── Health ────────────────────────────────────────────────────────────────
    app.get('/health', { preHandler: auth }, async (_request, reply) => {
        return reply.send({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
    });
}
//# sourceMappingURL=helixbrain.js.map