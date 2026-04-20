/**
 * Email Client — Resend SDK
 * Transactional email templates for all platform events
 */
import { Resend } from 'resend';
import { config } from '../config.js';
export const resend = new Resend(config.RESEND_API_KEY);
async function send(to, subject, html) {
    const { data, error } = await resend.emails.send({
        from: config.EMAIL_FROM,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
    });
    if (error)
        throw new Error(`Email send failed: ${error.message}`);
    return { id: data.id };
}
// ── Templates ─────────────────────────────────────────────────────────────────
function wrap(content) {
    return `<!DOCTYPE html><html><body style="font-family:Inter,sans-serif;background:#0a0a0f;color:#e2e8f0;padding:40px 20px;max-width:600px;margin:0 auto">
<div style="background:#13131a;border:1px solid #1e1e2e;border-radius:12px;padding:32px">
  <div style="margin-bottom:24px"><span style="background:linear-gradient(135deg,#6366f1,#8b5cf6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-size:24px;font-weight:700">HelixOnix</span></div>
  ${content}
  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #1e1e2e;font-size:12px;color:#64748b">
    © 2025 HelixOnix. <a href="mailto:${config.EMAIL_SUPPORT}" style="color:#6366f1">${config.EMAIL_SUPPORT}</a>
  </div>
</div></body></html>`;
}
function btn(text, url) {
    return `<a href="${url}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:16px">${text}</a>`;
}
export async function sendWelcomeEmail(to, name) {
    return send(to, 'Welcome to HelixOnix 🚀', wrap(`
    <h2 style="color:#e2e8f0">Welcome, ${name}!</h2>
    <p>You've joined the most powerful creative ecosystem — marketplace, AI studio, and freelance platform in one.</p>
    <p>You've received <strong style="color:#6366f1">50 free AI credits</strong> to get started.</p>
    ${btn('Explore the Platform', config.BUYER_URL)}
  `));
}
export async function sendOrderConfirmationEmail(to, params) {
    return send(to, `Order Confirmed — ${params.gigTitle}`, wrap(`
    <h2 style="color:#e2e8f0">Order Confirmed! ✅</h2>
    <p>Hi ${params.buyerName}, your order has been placed successfully.</p>
    <div style="background:#0a0a0f;border-radius:8px;padding:16px;margin:16px 0">
      <p><strong>Service:</strong> ${params.gigTitle}</p>
      <p><strong>Amount:</strong> ${params.amount}</p>
      <p><strong>Delivery:</strong> Up to ${params.deliveryDays} days</p>
      <p><strong>Order ID:</strong> ${params.orderId}</p>
    </div>
    ${btn('View Order', `${config.BUYER_URL}/dashboard/orders`)}
  `));
}
export async function sendNewOrderEmail(to, params) {
    return send(to, `New Order Received — ${params.gigTitle}`, wrap(`
    <h2 style="color:#e2e8f0">New Order! 🎉</h2>
    <p>Hi ${params.sellerName}, you have a new order from <strong>${params.buyerName}</strong>.</p>
    <div style="background:#0a0a0f;border-radius:8px;padding:16px;margin:16px 0">
      <p><strong>Service:</strong> ${params.gigTitle}</p>
      <p><strong>Earnings:</strong> ${params.earnings}</p>
      <p><strong>Order ID:</strong> ${params.orderId}</p>
    </div>
    ${btn('View Order', `${config.CREATOR_URL}/orders`)}
  `));
}
export async function sendDeliveryEmail(to, params) {
    return send(to, `Delivery Received — ${params.gigTitle}`, wrap(`
    <h2 style="color:#e2e8f0">Your delivery is ready! 📦</h2>
    <p>Hi ${params.buyerName}, ${params.gigTitle} has been delivered.</p>
    <p>You have <strong>3 days</strong> to review and request revisions. After that, the order auto-completes.</p>
    ${btn('Review Delivery', `${config.BUYER_URL}/dashboard/orders`)}
  `));
}
export async function sendPasswordResetEmail(to, name, resetUrl) {
    return send(to, 'Reset Your Password', wrap(`
    <h2 style="color:#e2e8f0">Password Reset Request</h2>
    <p>Hi ${name}, we received a request to reset your password.</p>
    <p>This link expires in <strong>1 hour</strong>.</p>
    ${btn('Reset Password', resetUrl)}
    <p style="margin-top:16px;font-size:12px;color:#64748b">If you didn't request this, ignore this email.</p>
  `));
}
export async function sendPayoutEmail(to, params) {
    return send(to, 'Payout Processed 💰', wrap(`
    <h2 style="color:#e2e8f0">Payout Processed!</h2>
    <p>Hi ${params.sellerName}, your payout has been processed.</p>
    <div style="background:#0a0a0f;border-radius:8px;padding:16px;margin:16px 0">
      <p><strong>Amount:</strong> ${params.amount}</p>
      <p><strong>Reference:</strong> ${params.reference}</p>
    </div>
    <p>Funds typically arrive within 2-5 business days.</p>
  `));
}
export async function sendDisputeEmail(to, params) {
    return send(to, `Dispute Opened — Order ${params.orderId}`, wrap(`
    <h2 style="color:#e2e8f0">Dispute Notification</h2>
    <p>Hi ${params.name}, a dispute has been opened for order <strong>${params.orderId}</strong>.</p>
    <p>Our team will review the case within <strong>24-48 hours</strong>. Both parties will be notified of the outcome.</p>
    <p>Please do not make any additional payments outside the platform.</p>
    ${btn('View Dispute', params.role === 'buyer' ? `${config.BUYER_URL}/dashboard/orders` : `${config.CREATOR_URL}/orders`)}
  `));
}
export async function sendAssetApprovedEmail(to, params) {
    return send(to, `Asset Approved — ${params.assetTitle}`, wrap(`
    <h2 style="color:#e2e8f0">Asset Approved! ✅</h2>
    <p>Hi ${params.sellerName}, your asset <strong>${params.assetTitle}</strong> has been approved and is now live on the marketplace.</p>
    ${btn('View Asset', `${config.CREATOR_URL}/assets`)}
  `));
}
//# sourceMappingURL=email.js.map