/**
 * Notification Service — create, list, mark read
 */
import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '../lib/db.js';
import { notifications } from '../schemas/db/index.js';
import { notifyUser } from '../lib/events.js';
import { AppError, ErrorCodes } from '../types/index.js';
export async function createNotification(params) {
    const [notification] = await db.insert(notifications).values({
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        actionUrl: params.actionUrl,
        metadata: params.metadata,
    }).returning();
    // Push to WebSocket
    await notifyUser(params.userId, 'notification:new', {
        notificationId: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        actionUrl: notification.actionUrl,
    });
    return notification;
}
export async function listNotifications(userId, page = 1, perPage = 20) {
    const offset = (page - 1) * perPage;
    return db.select().from(notifications)
        .where(eq(notifications.userId, userId))
        .orderBy(desc(notifications.createdAt))
        .limit(perPage)
        .offset(offset);
}
export async function markNotificationRead(notificationId, userId) {
    const [n] = await db.update(notifications)
        .set({ isRead: true, readAt: new Date() })
        .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)))
        .returning();
    if (!n)
        throw new AppError(ErrorCodes.NOT_FOUND, 'Notification not found', 404);
    return n;
}
export async function markAllRead(userId) {
    await db.update(notifications)
        .set({ isRead: true, readAt: new Date() })
        .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
}
export async function getUnreadCount(userId) {
    const result = await db.select({ count: sql `count(*)::int` })
        .from(notifications)
        .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    return result[0]?.count ?? 0;
}
//# sourceMappingURL=notification.service.js.map