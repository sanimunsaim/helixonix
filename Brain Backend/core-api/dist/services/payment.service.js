/**
 * Payment Service — Stripe checkout, webhooks, subscriptions, payouts
 */
import { eq, and } from 'drizzle-orm';
import { db } from '../lib/db.js';
import { payments, assetPurchases, subscriptions, payoutRequests, orders, assets, users, escrowHolds } from '../schemas/db/index.js';
import { createAssetPaymentIntent, createGigPaymentIntent, getOrCreateStripeCustomer, constructStripeEvent } from '../lib/stripe.js';
import { addCredits, getCredits } from '../lib/redis.js';
import { publishEvent, notifyUser, notifyAdmins } from '../lib/events.js';
import { writeAuditLog } from '../lib/audit.js';
import { AppError, ErrorCodes } from '../types/index.js';
import { creditPackMap } from '../config.js';
import { Queue } from 'bullmq';
import { bullmqConnection } from '../lib/redis.js';
const emailQueue = new Queue('email-dispatch', { connection: bullmqConnection });
// ── Asset Checkout ─────────────────────────────────────────────────────────────
export async function checkoutAsset(params) {
    const asset = await db.query.assets.findFirst({ where: eq(assets.id, params.assetId) });
    if (!asset || asset.status !== 'approved')
        throw new AppError(ErrorCodes.NOT_FOUND, 'Asset not found', 404);
    if (asset.isFree)
        throw new AppError(ErrorCodes.VALIDATION_ERROR, 'This asset is free — no purchase required', 400);
    // Check not already purchased
    const existing = await db.query.assetPurchases.findFirst({
        where: and(eq(assetPurchases.assetId, params.assetId), eq(assetPurchases.buyerId, params.buyerId)),
    });
    if (existing)
        throw new AppError(ErrorCodes.ALREADY_EXISTS, 'You already own this asset', 409);
    const buyer = await db.query.users.findFirst({ where: eq(users.id, params.buyerId) });
    if (!buyer)
        throw new AppError(ErrorCodes.NOT_FOUND, 'User not found', 404);
    const amount = params.licenseType === 'extended' ? (asset.extendedPrice ?? asset.price) : asset.price;
    const customerId = await getOrCreateStripeCustomer(buyer.id, buyer.email, buyer.displayName, buyer.stripeCustomerId ?? undefined);
    if (!buyer.stripeCustomerId) {
        await db.update(users).set({ stripeCustomerId: customerId }).where(eq(users.id, buyer.id));
    }
    const paymentIntent = await createAssetPaymentIntent({
        amountCents: amount,
        assetId: params.assetId,
        buyerId: params.buyerId,
        licenseType: params.licenseType,
        customerId,
    });
    return { clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id, amount };
}
// ── Gig Checkout ──────────────────────────────────────────────────────────────
export async function checkoutGig(params) {
    const { gigs, gigPackages, gigAddons } = await import('../schemas/db/index.js');
    const gig = await db.query.gigs.findFirst({ where: eq(gigs.id, params.gigId) });
    if (!gig || gig.status !== 'active')
        throw new AppError(ErrorCodes.NOT_FOUND, 'Gig not found', 404);
    const pkg = await db.query.gigPackages.findFirst({
        where: and(eq(gigPackages.gigId, params.gigId), eq(gigPackages.packageType, params.packageType)),
    });
    if (!pkg)
        throw new AppError(ErrorCodes.NOT_FOUND, 'Package not found', 404);
    let addonTotal = 0;
    if (params.addonIds.length > 0) {
        const addons = await db.select().from(gigAddons).where(eq(gigAddons.gigId, params.gigId));
        addonTotal = addons.filter(a => params.addonIds.includes(a.id)).reduce((s, a) => s + a.price, 0);
    }
    const total = pkg.price + addonTotal;
    const buyer = await db.query.users.findFirst({ where: eq(users.id, params.buyerId) });
    if (!buyer)
        throw new AppError(ErrorCodes.NOT_FOUND, 'User not found', 404);
    const customerId = await getOrCreateStripeCustomer(buyer.id, buyer.email, buyer.displayName, buyer.stripeCustomerId ?? undefined);
    const paymentIntent = await createGigPaymentIntent({
        amountCents: total,
        gigId: params.gigId,
        sellerId: gig.sellerId,
        buyerId: params.buyerId,
        packageType: params.packageType,
        customerId,
    });
    return { clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id, total, packageDetails: pkg };
}
// ── Stripe Webhook Handler ────────────────────────────────────────────────────
export async function handleStripeWebhook(rawBody, signature) {
    let event;
    try {
        event = constructStripeEvent(rawBody, signature);
    }
    catch {
        throw new AppError(ErrorCodes.INVALID_WEBHOOK, 'Invalid Stripe webhook signature', 400);
    }
    switch (event.type) {
        case 'payment_intent.succeeded':
            await handlePaymentSucceeded(event.data.object);
            break;
        case 'payment_intent.payment_failed':
            await handlePaymentFailed(event.data.object);
            break;
        case 'invoice.payment_succeeded':
            await handleInvoiceSucceeded(event.data.object);
            break;
        case 'invoice.payment_failed':
            await handleInvoiceFailed(event.data.object);
            break;
        case 'customer.subscription.deleted':
            await handleSubscriptionDeleted(event.data.object);
            break;
        case 'customer.subscription.updated':
            await handleSubscriptionUpdated(event.data.object);
            break;
        case 'transfer.paid':
            await handleTransferPaid(event.data.object);
            break;
        case 'transfer.failed':
            await handleTransferFailed(event.data.object);
            break;
        case 'charge.dispute.created':
            await handleDisputeCreated(event.data.object);
            break;
    }
}
async function handlePaymentSucceeded(pi) {
    const { order_type, asset_id, buyer_id, license_type, gig_id, seller_id, package_type } = pi.metadata;
    if (order_type === 'asset' && asset_id && buyer_id) {
        const asset = await db.query.assets.findFirst({ where: eq(assets.id, asset_id) });
        if (!asset)
            return;
        const platformFee = Math.floor(pi.amount * 0.20);
        const sellerShare = pi.amount - platformFee;
        await db.transaction(async (tx) => {
            await tx.insert(payments).values({
                userId: buyer_id,
                type: 'asset_purchase',
                status: 'succeeded',
                amountCents: pi.amount,
                stripePaymentIntentId: pi.id,
                metadata: { asset_id, license_type },
            });
            await tx.insert(assetPurchases).values({
                buyerId: buyer_id,
                assetId: asset_id,
                licenseType: license_type ?? 'standard',
                amountPaid: pi.amount,
            });
            // Credit seller earnings
            await tx.update(users)
                .set({ availableBalance: db.execute }) // simplified — update via raw SQL
                .where(eq(users.id, asset.sellerId));
        });
        await publishEvent('asset.purchased', { assetId: asset_id, buyerId: buyer_id });
        await notifyUser(buyer_id, 'notification:new', { type: 'payment_received', title: 'Purchase Complete', message: 'Your asset is ready to download' });
        await writeAuditLog({ action: 'asset.purchase', actorId: buyer_id, targetId: asset_id, targetType: 'asset', metadata: { amount: pi.amount } });
    }
    if (order_type === 'gig' && gig_id && buyer_id && seller_id) {
        const { gigs, gigPackages } = await import('../schemas/db/index.js');
        const gig = await db.query.gigs.findFirst({ where: eq(gigs.id, gig_id) });
        if (!gig)
            return;
        const platformFee = Math.floor(pi.amount * 0.20);
        const sellerEarnings = pi.amount - platformFee;
        const [order] = await db.insert(orders).values({
            buyerId: buyer_id,
            sellerId: seller_id,
            gigId: gig_id,
            packageType: package_type ?? 'basic',
            subtotal: pi.amount,
            total: pi.amount,
            platformFeePercent: 20,
            platformFee,
            sellerEarnings,
            deliveryDays: 3,
            stripePaymentIntentId: pi.id,
            status: 'pending',
        }).returning();
        await db.insert(escrowHolds).values({ orderId: order.id, amountCents: pi.amount });
        await publishEvent('order.created', { orderId: order.id, gigId: gig_id, buyerId: buyer_id, sellerId: seller_id });
        await notifyUser(seller_id, 'notification:new', { type: 'order_new', title: 'New Order!', message: `You have a new order for: ${gig.title}` });
        await emailQueue.add('new-order', { template: 'new_order', sellerId: seller_id, orderId: order.id });
        await writeAuditLog({ action: 'order.create', actorId: buyer_id, targetId: order.id, targetType: 'order' });
    }
    if (order_type === 'credits' && buyer_id) {
        const pack = creditPackMap[pi.metadata.pack_id ?? ''];
        if (pack) {
            await addCredits(buyer_id, pack.credits);
            await notifyUser(buyer_id, 'credits:updated', { newBalance: await getCredits(buyer_id), changeAmount: pack.credits, reason: 'Credit pack purchase' });
        }
    }
}
async function handlePaymentFailed(pi) {
    await publishEvent('payment.failed', { paymentIntentId: pi.id });
}
async function handleInvoiceSucceeded(invoice) {
    const customerId = invoice.customer;
    const user = await db.query.users.findFirst({ where: eq(users.stripeCustomerId, customerId) });
    if (!user)
        return;
    const sub = invoice.subscription;
    await db.update(subscriptions)
        .set({ status: 'active', currentPeriodEnd: new Date((invoice.lines.data[0]?.period.end ?? 0) * 1000) })
        .where(eq(subscriptions.stripeSubscriptionId, sub));
    await notifyUser(user.id, 'notification:new', { type: 'payment_received', title: 'Subscription Active', message: 'Your subscription has been renewed' });
}
async function handleInvoiceFailed(invoice) {
    const customerId = invoice.customer;
    const user = await db.query.users.findFirst({ where: eq(users.stripeCustomerId, customerId) });
    if (!user)
        return;
    await emailQueue.add('dunning', { template: 'payment_failed', userId: user.id, to: user.email });
}
async function handleSubscriptionDeleted(sub) {
    await db.update(subscriptions)
        .set({ status: 'cancelled', cancelledAt: new Date() })
        .where(eq(subscriptions.stripeSubscriptionId, sub.id));
    const user = await db.query.users.findFirst({ where: eq(users.stripeCustomerId, sub.customer) });
    if (user) {
        await db.update(users).set({ subscriptionPlan: 'free', subscriptionStatus: 'inactive' }).where(eq(users.id, user.id));
    }
}
async function handleSubscriptionUpdated(sub) {
    await db.update(subscriptions)
        .set({ status: sub.status, currentPeriodEnd: new Date(sub.current_period_end * 1000) })
        .where(eq(subscriptions.stripeSubscriptionId, sub.id));
}
async function handleTransferPaid(transfer) {
    const payoutId = transfer.metadata.payout_request_id;
    if (payoutId) {
        await db.update(payoutRequests).set({ status: 'paid', paidAt: new Date(), stripeTransferId: transfer.id }).where(eq(payoutRequests.id, payoutId));
        const payout = await db.query.payoutRequests.findFirst({ where: eq(payoutRequests.id, payoutId) });
        if (payout)
            await notifyUser(payout.sellerId, 'payout:processed', { amount: transfer.amount, reference: transfer.id });
    }
}
async function handleTransferFailed(transfer) {
    const payoutId = transfer.metadata.payout_request_id;
    if (payoutId) {
        await db.update(payoutRequests).set({ status: 'failed' }).where(eq(payoutRequests.id, payoutId));
        await notifyAdmins('alert:system', { component: 'payout', severity: 'high', message: `Payout transfer failed: ${transfer.id}` });
    }
}
async function handleDisputeCreated(dispute) {
    await notifyAdmins('alert:fraud', { disputeId: dispute.id, paymentIntent: dispute.payment_intent });
}
//# sourceMappingURL=payment.service.js.map