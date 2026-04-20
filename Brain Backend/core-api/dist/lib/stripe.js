/**
 * Stripe SDK — singleton instance + helper utilities
 */
import Stripe from 'stripe';
import { config } from '../config.js';
export const stripe = new Stripe(config.STRIPE_SECRET_KEY, {
    apiVersion: '2025-02-24.acacia',
    typescript: true,
    telemetry: false,
});
// ── Webhook Verification ──────────────────────────────────────────────────────
export function constructStripeEvent(rawBody, signature) {
    return stripe.webhooks.constructEvent(rawBody, signature, config.STRIPE_WEBHOOK_SECRET);
}
// ── Customer Helpers ──────────────────────────────────────────────────────────
export async function getOrCreateStripeCustomer(userId, email, name, existingCustomerId) {
    if (existingCustomerId) {
        return existingCustomerId;
    }
    const customer = await stripe.customers.create({
        email,
        name,
        metadata: { user_id: userId },
    });
    return customer.id;
}
// ── Payment Intent Helpers ─────────────────────────────────────────────────────
export async function createAssetPaymentIntent(params) {
    return stripe.paymentIntents.create({
        amount: params.amountCents,
        currency: params.currency ?? 'usd',
        customer: params.customerId,
        automatic_payment_methods: { enabled: true },
        metadata: {
            asset_id: params.assetId,
            buyer_id: params.buyerId,
            license_type: params.licenseType,
            order_type: 'asset',
        },
    });
}
export async function createGigPaymentIntent(params) {
    return stripe.paymentIntents.create({
        amount: params.amountCents,
        currency: 'usd',
        customer: params.customerId,
        automatic_payment_methods: { enabled: true },
        capture_method: 'automatic',
        metadata: {
            gig_id: params.gigId,
            seller_id: params.sellerId,
            buyer_id: params.buyerId,
            package_type: params.packageType,
            order_type: 'gig',
        },
    });
}
// ── Subscription Helpers ──────────────────────────────────────────────────────
export async function createSubscription(params) {
    return stripe.subscriptions.create({
        customer: params.customerId,
        items: [{ price: params.priceId }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
        metadata: { user_id: params.userId },
    });
}
// ── Connect (Seller Payout) ───────────────────────────────────────────────────
export async function transferToSeller(params) {
    return stripe.transfers.create({
        amount: params.amountCents,
        currency: 'usd',
        destination: params.stripeConnectAccountId,
        metadata: {
            seller_id: params.sellerId,
            payout_request_id: params.payoutRequestId,
        },
    });
}
export async function createRefund(params) {
    return stripe.refunds.create({
        payment_intent: params.paymentIntentId,
        amount: params.amountCents,
        reason: params.reason,
    });
}
export { Stripe };
//# sourceMappingURL=stripe.js.map