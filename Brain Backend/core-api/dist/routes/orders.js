/**
 * Routes — Orders
 * POST /orders/:id/deliver, /revision, /complete, /dispute, /review
 */
import { z } from 'zod';
import { verifyJwt } from '../middleware/auth.js';
import { deliverOrder, requestRevision, completeOrder, openDispute, submitReview } from '../services/order.service.js';
import { db } from '../lib/db.js';
import { orders } from '../schemas/db/index.js';
import { eq, desc } from 'drizzle-orm';
export async function orderRoutes(app) {
    app.get('/', { preHandler: [verifyJwt] }, async (request, reply) => {
        const { page = '1', role = 'buyer' } = request.query;
        const p = parseInt(page, 10) || 1;
        const column = role === 'seller' ? orders.sellerId : orders.buyerId;
        const list = await db.select().from(orders)
            .where(eq(column, request.user.userId))
            .orderBy(desc(orders.createdAt))
            .limit(20).offset((p - 1) * 20);
        return reply.send({ success: true, data: list });
    });
    app.get('/:id', { preHandler: [verifyJwt] }, async (request, reply) => {
        const { id } = request.params;
        const order = await db.query.orders.findFirst({ where: eq(orders.id, id) });
        if (!order || (order.buyerId !== request.user.userId && order.sellerId !== request.user.userId && request.user.role !== 'admin')) {
            return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } });
        }
        return reply.send({ success: true, data: order });
    });
    app.post('/:id/deliver', { preHandler: [verifyJwt] }, async (request, reply) => {
        const { id } = request.params;
        const body = z.object({
            file_keys: z.array(z.string()).min(1),
            message: z.string().max(2000),
        }).parse(request.body);
        const order = await deliverOrder({ orderId: id, sellerId: request.user.userId, fileKeys: body.file_keys, message: body.message });
        return reply.send({ success: true, data: order });
    });
    app.post('/:id/revision', { preHandler: [verifyJwt] }, async (request, reply) => {
        const { id } = request.params;
        const body = z.object({
            notes: z.string().min(10).max(2000),
            file_keys: z.array(z.string()).optional(),
        }).parse(request.body);
        await requestRevision({ orderId: id, buyerId: request.user.userId, notes: body.notes, fileKeys: body.file_keys });
        return reply.send({ success: true, data: { message: 'Revision requested' } });
    });
    app.post('/:id/complete', { preHandler: [verifyJwt] }, async (request, reply) => {
        const { id } = request.params;
        await completeOrder(id, request.user.userId);
        return reply.send({ success: true, data: { message: 'Order completed' } });
    });
    app.post('/:id/dispute', { preHandler: [verifyJwt] }, async (request, reply) => {
        const { id } = request.params;
        const body = z.object({
            reason: z.string().min(3).max(100),
            description: z.string().min(20).max(3000),
            evidence: z.array(z.string()).max(5).optional(),
        }).parse(request.body);
        const dispute = await openDispute({ orderId: id, raisedBy: request.user.userId, ...body });
        return reply.status(201).send({ success: true, data: dispute });
    });
    app.post('/:id/review', { preHandler: [verifyJwt] }, async (request, reply) => {
        const { id } = request.params;
        const body = z.object({
            rating: z.number().int().min(1).max(5),
            comment: z.string().max(1000).optional(),
        }).parse(request.body);
        const review = await submitReview({ orderId: id, buyerId: request.user.userId, ...body });
        return reply.status(201).send({ success: true, data: review });
    });
}
//# sourceMappingURL=orders.js.map