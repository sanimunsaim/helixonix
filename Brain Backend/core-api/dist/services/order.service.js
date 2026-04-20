/**
 * Order Service — lifecycle management for gig orders
 */
import { eq } from 'drizzle-orm';
import { db } from '../lib/db.js';
import { orders, escrowHolds, users, gigs, disputes, reviews } from '../schemas/db/index.js';
import { publishEvent, notifyUser, notifyOrder, notifyAdmins } from '../lib/events.js';
import { writeAuditLog } from '../lib/audit.js';
import { AppError, ErrorCodes } from '../types/index.js';
import { Queue } from 'bullmq';
import { bullmqConnection } from '../lib/redis.js';
import { sql } from 'drizzle-orm';
const emailQueue = new Queue('email-dispatch', { connection: bullmqConnection });
// ── Deliver Order ─────────────────────────────────────────────────────────────
export async function deliverOrder(params) {
    const order = await db.query.orders.findFirst({ where: eq(orders.id, params.orderId) });
    if (!order)
        throw new AppError(ErrorCodes.NOT_FOUND, 'Order not found', 404);
    if (order.sellerId !== params.sellerId)
        throw new AppError(ErrorCodes.FORBIDDEN, 'Not your order', 403);
    if (!['active', 'revision_requested'].includes(order.status)) {
        throw new AppError(ErrorCodes.ORDER_STATUS_INVALID, `Cannot deliver order in status: ${order.status}`, 400);
    }
    const autoCompleteAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days
    const [updated] = await db.update(orders)
        .set({ status: 'delivered', deliveredAt: new Date(), deliveryFileKeys: params.fileKeys, deliveryMessage: params.message, autoCompleteAt })
        .where(eq(orders.id, params.orderId))
        .returning();
    await Promise.all([
        notifyOrder(params.orderId, 'order:delivered', { deliveredAt: updated.deliveredAt, fileKeys: params.fileKeys, message: params.message }),
        notifyUser(order.buyerId, 'notification:new', { type: 'order_delivered', title: 'Delivery Received', message: 'Your order has been delivered. Please review.' }),
        emailQueue.add('delivery', { template: 'delivery_received', buyerId: order.buyerId, orderId: params.orderId }),
        publishEvent('order.delivered', { orderId: params.orderId, buyerId: order.buyerId, sellerId: params.sellerId }),
        writeAuditLog({ action: 'order.deliver', actorId: params.sellerId, targetId: params.orderId, targetType: 'order' }),
    ]);
    return updated;
}
// ── Request Revision ──────────────────────────────────────────────────────────
export async function requestRevision(params) {
    const order = await db.query.orders.findFirst({ where: eq(orders.id, params.orderId) });
    if (!order)
        throw new AppError(ErrorCodes.NOT_FOUND, 'Order not found', 404);
    if (order.buyerId !== params.buyerId)
        throw new AppError(ErrorCodes.FORBIDDEN, 'Not your order', 403);
    if (order.status !== 'delivered')
        throw new AppError(ErrorCodes.ORDER_STATUS_INVALID, 'Order not in delivered status', 400);
    if (order.revisionsUsed >= order.revisionsAllowed) {
        throw new AppError(ErrorCodes.VALIDATION_ERROR, 'No revisions remaining', 400);
    }
    await db.update(orders)
        .set({ status: 'revision_requested', revisionsUsed: sql `${orders.revisionsUsed} + 1` })
        .where(eq(orders.id, params.orderId));
    await Promise.all([
        notifyOrder(params.orderId, 'order:revision_req', { notes: params.notes, files: params.fileKeys }),
        notifyUser(order.sellerId, 'notification:new', { type: 'order_new', title: 'Revision Requested', message: 'Buyer requested a revision' }),
        publishEvent('order.accepted', { orderId: params.orderId }),
    ]);
}
// ── Complete Order ─────────────────────────────────────────────────────────────
export async function completeOrder(orderId, buyerId) {
    const order = await db.query.orders.findFirst({ where: eq(orders.id, orderId) });
    if (!order)
        throw new AppError(ErrorCodes.NOT_FOUND, 'Order not found', 404);
    if (buyerId && order.buyerId !== buyerId)
        throw new AppError(ErrorCodes.FORBIDDEN, 'Not your order', 403);
    if (order.status !== 'delivered')
        throw new AppError(ErrorCodes.ORDER_STATUS_INVALID, 'Order not delivered yet', 400);
    // Release escrow → credit seller
    await db.transaction(async (tx) => {
        await tx.update(orders).set({ status: 'completed', completedAt: new Date() }).where(eq(orders.id, orderId));
        await tx.update(escrowHolds).set({ status: 'released', releasedAt: new Date() }).where(eq(escrowHolds.orderId, orderId));
        await tx.update(users)
            .set({
            availableBalance: sql `available_balance + ${order.sellerEarnings}`,
            pendingBalance: sql `pending_balance - ${order.sellerEarnings}`,
            completedOrders: sql `completed_orders + 1`,
        })
            .where(eq(users.id, order.sellerId));
        await tx.update(gigs)
            .set({ completedOrdersCount: sql `completed_orders_count + 1`, totalRevenue: sql `total_revenue + ${order.sellerEarnings}` })
            .where(eq(gigs.id, order.gigId));
    });
    await Promise.all([
        notifyUser(order.sellerId, 'notification:new', { type: 'payment_received', title: 'Order Completed!', message: `$${(order.sellerEarnings / 100).toFixed(2)} has been credited to your wallet` }),
        notifyOrder(orderId, 'order:completed', { completedAt: new Date() }),
        publishEvent('order.completed', { orderId, sellerId: order.sellerId, buyerId: order.buyerId, amount: order.sellerEarnings }),
        writeAuditLog({ action: 'order.complete', actorId: buyerId ?? 'system', targetId: orderId, targetType: 'order' }),
    ]);
}
// ── Open Dispute ──────────────────────────────────────────────────────────────
export async function openDispute(params) {
    const order = await db.query.orders.findFirst({ where: eq(orders.id, params.orderId) });
    if (!order)
        throw new AppError(ErrorCodes.NOT_FOUND, 'Order not found', 404);
    if (!['delivered', 'active'].includes(order.status)) {
        throw new AppError(ErrorCodes.ORDER_STATUS_INVALID, 'Cannot open dispute in current order status', 400);
    }
    await db.update(orders).set({ status: 'disputed' }).where(eq(orders.id, params.orderId));
    const [dispute] = await db.insert(disputes).values({
        orderId: params.orderId,
        raisedBy: params.raisedBy,
        reason: params.reason,
        description: params.description,
        evidence: params.evidence ?? [],
    }).returning();
    await Promise.all([
        notifyAdmins('alert:dispute', { disputeId: dispute.id, orderId: params.orderId, priority: 'high' }),
        emailQueue.add('dispute-buyer', { template: 'dispute_opened', userId: order.buyerId, orderId: params.orderId, role: 'buyer' }),
        emailQueue.add('dispute-seller', { template: 'dispute_opened', userId: order.sellerId, orderId: params.orderId, role: 'seller' }),
        publishEvent('dispute.opened', { disputeId: dispute.id, orderId: params.orderId }),
        writeAuditLog({ action: 'order.dispute', actorId: params.raisedBy, targetId: params.orderId, targetType: 'order' }),
    ]);
    return dispute;
}
// ── Submit Review ──────────────────────────────────────────────────────────────
export async function submitReview(params) {
    const order = await db.query.orders.findFirst({ where: eq(orders.id, params.orderId) });
    if (!order)
        throw new AppError(ErrorCodes.NOT_FOUND, 'Order not found', 404);
    if (order.buyerId !== params.buyerId)
        throw new AppError(ErrorCodes.FORBIDDEN, 'Not your order', 403);
    if (order.status !== 'completed')
        throw new AppError(ErrorCodes.ORDER_STATUS_INVALID, 'Order not completed', 400);
    const [review] = await db.insert(reviews).values({
        orderId: params.orderId,
        gigId: order.gigId,
        buyerId: params.buyerId,
        sellerId: order.sellerId,
        rating: params.rating,
        comment: params.comment,
    }).returning();
    // Update gig avg rating
    const allReviews = await db.select().from(reviews).where(eq(reviews.gigId, order.gigId));
    const avg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
    await db.update(gigs).set({ avgRating: avg, totalReviews: allReviews.length }).where(eq(gigs.id, order.gigId));
    await db.update(users).set({ avgRating: avg.toFixed(2), totalReviews: allReviews.length }).where(eq(users.id, order.sellerId));
    await notifyUser(order.sellerId, 'notification:new', { type: 'review_received', title: 'New Review', message: `You received a ${params.rating}★ review` });
    return review;
}
//# sourceMappingURL=order.service.js.map