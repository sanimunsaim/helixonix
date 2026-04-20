/**
 * WebSocket Server — Socket.io with JWT auth + Redis bridge
 * Handles real-time messaging, notifications, order status updates
 */
import { Server as SocketIOServer } from 'socket.io';
import type { Server as HttpServer } from 'node:http';
export interface WsRoom {
    room: string;
    event: string;
    data: Record<string, unknown>;
}
export declare function createWebSocketServer(httpServer: HttpServer): SocketIOServer;
export declare function getIO(): SocketIOServer;
//# sourceMappingURL=server.d.ts.map