/**
 * BullMQ Worker — Email Dispatch
 * Processes all email sending jobs with template routing
 */

import { Worker, type Job } from 'bullmq';
import { bullmqConnection } from '../lib/redis.js';
import {
  sendNewOrderEmail, sendOrderConfirmationEmail, sendDeliveryEmail,
  sendPayoutEmail, sendDisputeEmail, sendAssetApprovedEmail,
  sendPasswordResetEmail, sendWelcomeEmail
} from '../lib/email.js';
import { db } from '../lib/db.js';
import { users } from '../schemas/db/index.js';
import { eq } from 'drizzle-orm';

interface EmailJobData {
  template: string;
  to?: string;
  userId?: string;
  buyerId?: string;
  sellerId?: string;
  orderId?: string;
  role?: string;
  [key: string]: unknown;
}

async function getUserEmail(userId: string): Promise<{ email: string; displayName: string } | null> {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  return user ? { email: user.email, displayName: user.displayName } : null;
}

async function processEmailDispatch(job: Job<EmailJobData>): Promise<void> {
  const { template, ...data } = job.data;

  switch (template) {
    case 'welcome': {
      if (!data.userId) return;
      const user = await getUserEmail(data.userId as string);
      if (user) await sendWelcomeEmail(user.email, user.displayName);
      break;
    }
    case 'new_order': {
      if (!data.sellerId || !data.orderId) return;
      const seller = await getUserEmail(data.sellerId as string);
      if (seller) await sendNewOrderEmail(seller.email, {
        sellerName: seller.displayName,
        orderId: data.orderId as string,
        gigTitle: (data.gigTitle as string) ?? 'Your service',
        buyerName: (data.buyerName as string) ?? 'A buyer',
        earnings: (data.earnings as string) ?? '$0.00',
      });
      break;
    }
    case 'order_confirmed': {
      if (!data.buyerId || !data.orderId) return;
      const buyer = await getUserEmail(data.buyerId as string);
      if (buyer) await sendOrderConfirmationEmail(buyer.email, {
        buyerName: buyer.displayName,
        orderId: data.orderId as string,
        gigTitle: (data.gigTitle as string) ?? 'Service',
        amount: (data.amount as string) ?? '$0.00',
        deliveryDays: (data.deliveryDays as number) ?? 3,
      });
      break;
    }
    case 'delivery_received': {
      if (!data.buyerId || !data.orderId) return;
      const buyer = await getUserEmail(data.buyerId as string);
      if (buyer) await sendDeliveryEmail(buyer.email, { buyerName: buyer.displayName, orderId: data.orderId as string, gigTitle: (data.gigTitle as string) ?? 'Service' });
      break;
    }
    case 'payout_processed': {
      if (!data.sellerId) return;
      const seller = await getUserEmail(data.sellerId as string);
      if (seller) await sendPayoutEmail(seller.email, { sellerName: seller.displayName, amount: (data.amount as string) ?? '$0.00', reference: (data.reference as string) ?? '' });
      break;
    }
    case 'dispute_opened': {
      const targetId = (data.buyerId ?? data.sellerId) as string;
      const role = data.role as 'buyer' | 'seller' ?? 'buyer';
      if (!targetId || !data.orderId) return;
      const user = await getUserEmail(targetId);
      if (user) await sendDisputeEmail(user.email, { name: user.displayName, orderId: data.orderId as string, role });
      break;
    }
    case 'asset_approved': {
      if (!data.sellerId) return;
      const seller = await getUserEmail(data.sellerId as string);
      if (seller) await sendAssetApprovedEmail(seller.email, { sellerName: seller.displayName, assetTitle: (data.assetTitle as string) ?? 'Your asset' });
      break;
    }
    case 'password_reset': {
      if (!data.to || !data.resetUrl) return;
      const user = await getUserEmail(data.userId as string);
      await sendPasswordResetEmail(data.to as string, user?.displayName ?? 'User', data.resetUrl as string);
      break;
    }
  }
}

export function startEmailWorker() {
  return new Worker<EmailJobData>('email-dispatch', processEmailDispatch, {
    connection: bullmqConnection,
    concurrency: 20,
    limiter: { max: 100, duration: 60000 },
  });
}
