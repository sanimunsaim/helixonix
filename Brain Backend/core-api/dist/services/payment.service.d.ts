/**
 * Payment Service — Stripe checkout, webhooks, subscriptions, payouts
 */
export declare function checkoutAsset(params: {
    assetId: string;
    buyerId: string;
    licenseType: string;
}): Promise<{
    clientSecret: string | null;
    paymentIntentId: string;
    amount: number;
}>;
export declare function checkoutGig(params: {
    gigId: string;
    buyerId: string;
    packageType: string;
    addonIds: string[];
    requirements?: string;
}): Promise<{
    clientSecret: string | null;
    paymentIntentId: string;
    total: number;
    packageDetails: {
        id: string;
        name: string;
        createdAt: Date;
        description: string;
        price: number;
        gigId: string;
        packageType: "standard" | "basic" | "premium";
        deliveryDays: number;
        revisions: number;
        features: string[] | null;
    };
}>;
export declare function handleStripeWebhook(rawBody: Buffer, signature: string): Promise<void>;
//# sourceMappingURL=payment.service.d.ts.map