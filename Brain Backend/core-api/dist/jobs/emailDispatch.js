/**
 * BullMQ Worker — Email Dispatch
 * Processes all email sending jobs with template routing
 */
import { Worker } from 'bullmq';
import { bullmqConnection } from '../lib/redis.js';
import { sendNewOrderEmail, sendOrderConfirmationEmail, sendDeliveryEmail, sendPayoutEmail, sendDisputeEmail, sendAssetApprovedEmail, sendPasswordResetEmail, sendWelcomeEmail } from '../lib/email.js';
import { db } from '../lib/db.js';
import { users } from '../schemas/db/index.js';
import { eq } from 'drizzle-orm';
async function getUserEmail(userId) {
    const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
    return user ? { email: user.email, displayName: user.displayName } : null;
}
async function processEmailDispatch(job) {
    const { template, ...data } = job.data;
    switch (template) {
        case 'welcome': {
            if (!data.userId)
                return;
            const user = await getUserEmail(data.userId);
            if (user)
                await sendWelcomeEmail(user.email, user.displayName);
            break;
        }
        case 'new_order': {
            if (!data.sellerId || !data.orderId)
                return;
            const seller = await getUserEmail(data.sellerId);
            if (seller)
                await sendNewOrderEmail(seller.email, {
                    sellerName: seller.displayName,
                    orderId: data.orderId,
                    gigTitle: data.gigTitle ?? 'Your service',
                    buyerName: data.buyerName ?? 'A buyer',
                    earnings: data.earnings ?? '$0.00',
                });
            break;
        }
        case 'order_confirmed': {
            if (!data.buyerId || !data.orderId)
                return;
            const buyer = await getUserEmail(data.buyerId);
            if (buyer)
                await sendOrderConfirmationEmail(buyer.email, {
                    buyerName: buyer.displayName,
                    orderId: data.orderId,
                    gigTitle: data.gigTitle ?? 'Service',
                    amount: data.amount ?? '$0.00',
                    deliveryDays: data.deliveryDays ?? 3,
                });
            break;
        }
        case 'delivery_received': {
            if (!data.buyerId || !data.orderId)
                return;
            const buyer = await getUserEmail(data.buyerId);
            if (buyer)
                await sendDeliveryEmail(buyer.email, { buyerName: buyer.displayName, orderId: data.orderId, gigTitle: data.gigTitle ?? 'Service' });
            break;
        }
        case 'payout_processed': {
            if (!data.sellerId)
                return;
            const seller = await getUserEmail(data.sellerId);
            if (seller)
                await sendPayoutEmail(seller.email, { sellerName: seller.displayName, amount: data.amount ?? '$0.00', reference: data.reference ?? '' });
            break;
        }
        case 'dispute_opened': {
            const targetId = (data.buyerId ?? data.sellerId);
            const role = data.role ?? 'buyer';
            if (!targetId || !data.orderId)
                return;
            const user = await getUserEmail(targetId);
            if (user)
                await sendDisputeEmail(user.email, { name: user.displayName, orderId: data.orderId, role });
            break;
        }
        case 'asset_approved': {
            if (!data.sellerId)
                return;
            const seller = await getUserEmail(data.sellerId);
            if (seller)
                await sendAssetApprovedEmail(seller.email, { sellerName: seller.displayName, assetTitle: data.assetTitle ?? 'Your asset' });
            break;
        }
        case 'password_reset': {
            if (!data.to || !data.resetUrl)
                return;
            const user = await getUserEmail(data.userId);
            await sendPasswordResetEmail(data.to, user?.displayName ?? 'User', data.resetUrl);
            break;
        }
    }
}
export function startEmailWorker() {
    return new Worker('email-dispatch', processEmailDispatch, {
        connection: bullmqConnection,
        concurrency: 20,
        limiter: { max: 100, duration: 60000 },
    });
}
//# sourceMappingURL=emailDispatch.js.map