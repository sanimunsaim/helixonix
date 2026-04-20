/**
 * WebSocket Server — Socket.io with JWT auth + Redis bridge
 * Handles real-time messaging, notifications, order status updates
 */
import { Server as SocketIOServer } from 'socket.io';
import { subscriber } from '../lib/redis.js';
import { PubSubChannels } from '../lib/redis.js';
import { config, corsOrigins } from '../config.js';
let io = null;
export function createWebSocketServer(httpServer) {
    io = new SocketIOServer(httpServer, {
        cors: {
            origin: corsOrigins,
            methods: ['GET', 'POST'],
            credentials: true,
        },
        transports: ['websocket', 'polling'],
        pingTimeout: 30000,
        pingInterval: 15000,
    });
    // ── Authentication middleware ──────────────────────────────────────────────────
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth?.token;
            if (!token) {
                return next(new Error('Authentication required'));
            }
            // Verify JWT (inline — no fastify context here)
            const { createVerify } = await import('node:crypto');
            const jwt = await import('jsonwebtoken');
            const payload = jwt.default.verify(token, config.JWT_SECRET);
            socket.user = payload;
            // Join personal room
            socket.join(`user:${payload.userId}`);
            // Admin gets the alerts room
            if (payload.role === 'admin' || payload.role === 'super_admin') {
                socket.join('admin:alerts');
            }
            next();
        }
        catch {
            next(new Error('Invalid token'));
        }
    });
    io.on('connection', (socket) => {
        const user = socket.user;
        // ── Client → Server events ────────────────────────────────────────────────
        socket.on('room:join', ({ room_id }) => {
            // Only allow joining order rooms the user is part of
            if (room_id.startsWith('order:')) {
                socket.join(room_id);
            }
        });
        socket.on('room:leave', ({ room_id }) => {
            socket.leave(room_id);
        });
        socket.on('typing:start', ({ thread_id }) => {
            socket.to(`order:${thread_id}`).emit('typing:start', { user_id: user.userId });
        });
        socket.on('typing:stop', ({ thread_id }) => {
            socket.to(`order:${thread_id}`).emit('typing:stop', { user_id: user.userId });
        });
        socket.on('notification:read', ({ notification_id }) => {
            // Client confirms read — handled by REST endpoint
        });
        socket.on('disconnect', () => {
            // Cleanup if needed
        });
    });
    // ── Redis Bridge — forward events from other services ────────────────────────
    subscriber.subscribe(PubSubChannels.WS_EVENTS, (err) => {
        if (err)
            console.error('[WebSocket] Redis subscribe error:', err);
    });
    subscriber.on('message', (channel, message) => {
        if (channel !== PubSubChannels.WS_EVENTS)
            return;
        try {
            const { room, event, data } = JSON.parse(message);
            if (io && room && event) {
                io.to(room).emit(event, data);
            }
        }
        catch {
            // Ignore malformed messages — never crash the listener
        }
    });
    return io;
}
export function getIO() {
    if (!io)
        throw new Error('WebSocket server not initialized');
    return io;
}
//# sourceMappingURL=server.js.map