/**
 * Order Service — lifecycle management for gig orders
 */
export declare function deliverOrder(params: {
    orderId: string;
    sellerId: string;
    fileKeys: string[];
    message: string;
}): Promise<{
    id: string;
    buyerId: string;
    sellerId: string;
    gigId: string;
    packageId: string | null;
    packageType: string;
    status: "active" | "pending" | "delivered" | "revision_requested" | "completed" | "cancelled" | "disputed" | "refunded";
    subtotal: number;
    addonTotal: number;
    total: number;
    platformFeePercent: number;
    platformFee: number;
    sellerEarnings: number;
    stripePaymentIntentId: string | null;
    stripeTransferId: string | null;
    requirements: string | null;
    deliveryDays: number;
    deliveryDueAt: Date | null;
    revisionsAllowed: number;
    revisionsUsed: number;
    deliveryFileKeys: string[] | null;
    deliveryMessage: string | null;
    deliveredAt: Date | null;
    completedAt: Date | null;
    autoCompleteAt: Date | null;
    cancelledAt: Date | null;
    cancellationReason: string | null;
    addonIds: string[] | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function requestRevision(params: {
    orderId: string;
    buyerId: string;
    notes: string;
    fileKeys?: string[];
}): Promise<void>;
export declare function completeOrder(orderId: string, buyerId?: string): Promise<void>;
export declare function openDispute(params: {
    orderId: string;
    raisedBy: string;
    reason: string;
    description: string;
    evidence?: string[];
}): Promise<{
    status: "open" | "under_review" | "resolved" | "escalated";
    id: string;
    createdAt: Date;
    updatedAt: Date;
    description: string;
    orderId: string;
    raisedBy: string;
    reason: string;
    evidence: string[] | null;
    aiRecommendation: unknown;
    outcome: "refund_buyer" | "release_seller" | "partial_refund" | "no_action" | null;
    resolvedBy: string | null;
    resolvedAt: Date | null;
    refundAmountCents: number | null;
}>;
export declare function submitReview(params: {
    orderId: string;
    buyerId: string;
    rating: number;
    comment?: string;
}): Promise<{
    id: string;
    createdAt: Date;
    sellerId: string;
    gigId: string;
    buyerId: string;
    orderId: string;
    rating: number;
    comment: string | null;
    sellerResponse: string | null;
    sellerRespondedAt: Date | null;
    isVisible: boolean;
}>;
//# sourceMappingURL=order.service.d.ts.map