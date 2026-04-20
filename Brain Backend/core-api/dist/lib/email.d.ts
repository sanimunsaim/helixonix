/**
 * Email Client — Resend SDK
 * Transactional email templates for all platform events
 */
import { Resend } from 'resend';
export declare const resend: Resend;
export interface EmailResult {
    id: string;
}
export declare function sendWelcomeEmail(to: string, name: string): Promise<EmailResult>;
export declare function sendOrderConfirmationEmail(to: string, params: {
    buyerName: string;
    orderId: string;
    gigTitle: string;
    amount: string;
    deliveryDays: number;
}): Promise<EmailResult>;
export declare function sendNewOrderEmail(to: string, params: {
    sellerName: string;
    orderId: string;
    gigTitle: string;
    buyerName: string;
    earnings: string;
}): Promise<EmailResult>;
export declare function sendDeliveryEmail(to: string, params: {
    buyerName: string;
    orderId: string;
    gigTitle: string;
}): Promise<EmailResult>;
export declare function sendPasswordResetEmail(to: string, name: string, resetUrl: string): Promise<EmailResult>;
export declare function sendPayoutEmail(to: string, params: {
    sellerName: string;
    amount: string;
    reference: string;
}): Promise<EmailResult>;
export declare function sendDisputeEmail(to: string, params: {
    name: string;
    orderId: string;
    role: 'buyer' | 'seller';
}): Promise<EmailResult>;
export declare function sendAssetApprovedEmail(to: string, params: {
    sellerName: string;
    assetTitle: string;
}): Promise<EmailResult>;
//# sourceMappingURL=email.d.ts.map