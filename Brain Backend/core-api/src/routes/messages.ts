/**
 * Messages Routes — threads and messages for order conversations
 */

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { verifyJwt } from '../middleware/auth.js';
import { db } from '../lib/db.js';
import { messageThreads, messages } from '../schemas/db/index.js';
import { eq, desc, and, sql } from 'drizzle-orm';
import { notifyOrder } from '../lib/events.js';

export async function messageRoutes(app: FastifyInstance) {

  // Get thread for an order
  app.get('/thread/:orderId', { preHandler: [verifyJwt] }, async (request, reply) => {
    const { orderId } = request.params as { orderId: string };
    let thread = await db.query.messageThreads.findFirst({ where: eq(messageThreads.orderId, orderId) });

    if (!thread) {
      // Create thread on first access
      [thread] = await db.insert(messageThreads).values({
        orderId,
        participantIds: [request.user.userId],
        type: 'order',
      }).returning();
    }

    const msgs = await db.select().from(messages)
      .where(eq(messages.threadId, thread.id))
      .orderBy(messages.createdAt)
      .limit(100);

    return reply.send({ success: true, data: { thread, messages: msgs } });
  });

  // Send a message
  app.post('/thread/:orderId/send', { preHandler: [verifyJwt] }, async (request, reply) => {
    const { orderId } = request.params as { orderId: string };
    const body = z.object({
      content: z.string().min(1).max(5000),
      attachment_keys: z.array(z.string()).max(5).default([]),
    }).parse(request.body);

    const thread = await db.query.messageThreads.findFirst({ where: eq(messageThreads.orderId, orderId) });
    if (!thread) return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Thread not found' } });

    const [message] = await db.insert(messages).values({
      threadId: thread.id,
      senderId: request.user.userId,
      content: body.content,
      attachmentKeys: body.attachment_keys,
    }).returning();

    // Update thread preview
    await db.update(messageThreads).set({
      lastMessageAt: new Date(),
      lastMessagePreview: body.content.slice(0, 255),
    }).where(eq(messageThreads.id, thread.id));

    // Real-time notify
    await notifyOrder(orderId, 'message:new', {
      messageId: message.id,
      senderId: message.senderId,
      content: message.content,
      attachments: message.attachmentKeys,
      timestamp: message.createdAt,
    });

    return reply.status(201).send({ success: true, data: message });
  });

  // Mark messages as read
  app.patch('/thread/:orderId/read', { preHandler: [verifyJwt] }, async (request, reply) => {
    const { orderId } = request.params as { orderId: string };
    const thread = await db.query.messageThreads.findFirst({ where: eq(messageThreads.orderId, orderId) });
    if (!thread) return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Thread not found' } });

    await db.update(messages).set({ isRead: true, readAt: new Date() })
      .where(and(eq(messages.threadId, thread.id), eq(messages.isRead, false)));

    return reply.send({ success: true, data: { message: 'Messages marked as read' } });
  });
}
