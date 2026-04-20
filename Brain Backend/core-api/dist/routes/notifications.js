/**
 * Routes — Notifications
 */
import { verifyJwt } from '../middleware/auth.js';
import { listNotifications, markNotificationRead, markAllRead, getUnreadCount } from '../services/notification.service.js';
export async function notificationRoutes(app) {
    app.get('/', { preHandler: [verifyJwt] }, async (request, reply) => {
        const { page = '1' } = request.query;
        const [list, unread] = await Promise.all([
            listNotifications(request.user.userId, parseInt(page, 10) || 1),
            getUnreadCount(request.user.userId),
        ]);
        return reply.send({ success: true, data: list, meta: { unreadCount: unread } });
    });
    app.patch('/:id/read', { preHandler: [verifyJwt] }, async (request, reply) => {
        const { id } = request.params;
        const n = await markNotificationRead(id, request.user.userId);
        return reply.send({ success: true, data: n });
    });
    app.patch('/read-all', { preHandler: [verifyJwt] }, async (request, reply) => {
        await markAllRead(request.user.userId);
        return reply.send({ success: true, data: { message: 'All notifications marked as read' } });
    });
}
//# sourceMappingURL=notifications.js.map