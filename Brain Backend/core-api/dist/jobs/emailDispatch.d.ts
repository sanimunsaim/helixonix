/**
 * BullMQ Worker — Email Dispatch
 * Processes all email sending jobs with template routing
 */
import { Worker } from 'bullmq';
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
export declare function startEmailWorker(): Worker<EmailJobData, any, string>;
export {};
//# sourceMappingURL=emailDispatch.d.ts.map