/**
 * Notification Service — create, list, mark read
 */
export declare function createNotification(params: {
    userId: string;
    type: string;
    title: string;
    message: string;
    actionUrl?: string;
    metadata?: Record<string, unknown>;
}): Promise<{
    message: string;
    type: "order_new" | "order_delivered" | "order_completed" | "order_cancelled" | "order_disputed" | "message_new" | "payment_received" | "payout_processed" | "asset_approved" | "asset_rejected" | "review_received" | "credits_updated" | "ai_generation_complete" | "system_alert";
    id: string;
    createdAt: Date;
    title: string;
    userId: string;
    metadata: unknown;
    isRead: boolean;
    readAt: Date | null;
    actionUrl: string | null;
}>;
export declare function listNotifications(userId: string, page?: number, perPage?: number): Promise<{
    id: string;
    userId: string;
    type: "order_new" | "order_delivered" | "order_completed" | "order_cancelled" | "order_disputed" | "message_new" | "payment_received" | "payout_processed" | "asset_approved" | "asset_rejected" | "review_received" | "credits_updated" | "ai_generation_complete" | "system_alert";
    title: string;
    message: string;
    actionUrl: string | null;
    isRead: boolean;
    readAt: Date | null;
    metadata: unknown;
    createdAt: Date;
}[]>;
export declare function markNotificationRead(notificationId: string, userId: string): Promise<{
    id: string;
    userId: string;
    type: "order_new" | "order_delivered" | "order_completed" | "order_cancelled" | "order_disputed" | "message_new" | "payment_received" | "payout_processed" | "asset_approved" | "asset_rejected" | "review_received" | "credits_updated" | "ai_generation_complete" | "system_alert";
    title: string;
    message: string;
    actionUrl: string | null;
    isRead: boolean;
    readAt: Date | null;
    metadata: unknown;
    createdAt: Date;
}>;
export declare function markAllRead(userId: string): Promise<void>;
export declare function getUnreadCount(userId: string): Promise<number>;
//# sourceMappingURL=notification.service.d.ts.map