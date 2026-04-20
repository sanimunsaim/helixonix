/**
 * Stripe SDK — singleton instance + helper utilities
 */
import Stripe from 'stripe';
export declare const stripe: Stripe;
export declare function constructStripeEvent(rawBody: string | Buffer, signature: string): Stripe.Event;
export declare function getOrCreateStripeCustomer(userId: string, email: string, name: string, existingCustomerId?: string): Promise<string>;
export declare function createAssetPaymentIntent(params: {
    amountCents: number;
    currency?: string;
    assetId: string;
    buyerId: string;
    licenseType: string;
    customerId?: string;
}): Promise<Stripe.PaymentIntent>;
export declare function createGigPaymentIntent(params: {
    amountCents: number;
    gigId: string;
    sellerId: string;
    buyerId: string;
    packageType: string;
    customerId?: string;
}): Promise<Stripe.PaymentIntent>;
export declare function createSubscription(params: {
    customerId: string;
    priceId: string;
    userId: string;
}): Promise<Stripe.Subscription>;
export declare function transferToSeller(params: {
    amountCents: number;
    sellerId: string;
    stripeConnectAccountId: string;
    payoutRequestId: string;
}): Promise<Stripe.Transfer>;
export declare function createRefund(params: {
    paymentIntentId: string;
    amountCents?: number;
    reason?: Stripe.RefundCreateParams.Reason;
}): Promise<Stripe.Refund>;
export { Stripe };
//# sourceMappingURL=stripe.d.ts.map