/**
 * TypeScript Type Definitions for All Event Payloads
 * Used by Redis pub/sub event handlers
 */

// ============================================================
// EVENT: order.completed
// ============================================================
export interface OrderCompletedPayload {
  order_id: string;
  buyer_id: string;
  seller_id: string;
  total_amount: number;
  commission_amount: number;
  completed_at: string;
}

// ============================================================
// EVENT: user.registered
// ============================================================
export interface UserRegisteredPayload {
  user_id: string;
  email: string;
  name: string;
  signup_source: string;
  utm_campaign?: string;
  device_fingerprint?: string;
  ip_address?: string;
}

// ============================================================
// EVENT: seller.onboarding_complete
// ============================================================
export interface SellerOnboardingCompletePayload {
  seller_id: string;
  user_id: string;
  seller_name: string;
  categories: string[];
  portfolio_url?: string;
  completed_at: string;
}

// ============================================================
// EVENT: dispute.opened
// ============================================================
export interface DisputeOpenedPayload {
  dispute_id: string;
  order_id: string;
  buyer_id: string;
  seller_id: string;
  reason: string;
  amount: number;
  opened_at: string;
}

// ============================================================
// EVENT: payment.failed
// ============================================================
export interface PaymentFailedPayload {
  payment_id: string;
  order_id?: string;
  user_id: string;
  amount: number;
  payment_type: 'order' | 'subscription';
  failure_reason: string;
  retry_count: number;
  failed_at: string;
}

// ============================================================
// EVENT: asset.quality_score_below_threshold
// ============================================================
export interface AssetQualityBelowThresholdPayload {
  asset_id: string;
  seller_id: string;
  quality_score: number;
  threshold: number;
  asset_type: string;
  details: Record<string, unknown>;
}

// ============================================================
// EVENT: seller.fraud_signal_detected
// ============================================================
export interface SellerFraudSignalPayload {
  seller_id: string;
  signal_type: string;
  signal_details: Record<string, unknown>;
  detected_at: string;
}

// ============================================================
// Union Type for All Events
// ============================================================
export type HelixonixEvent =
  | { type: 'order.completed'; payload: OrderCompletedPayload }
  | { type: 'user.registered'; payload: UserRegisteredPayload }
  | { type: 'seller.onboarding_complete'; payload: SellerOnboardingCompletePayload }
  | { type: 'dispute.opened'; payload: DisputeOpenedPayload }
  | { type: 'payment.failed'; payload: PaymentFailedPayload }
  | { type: 'asset.quality_score_below_threshold'; payload: AssetQualityBelowThresholdPayload }
  | { type: 'seller.fraud_signal_detected'; payload: SellerFraudSignalPayload };

export type HelixonixEventType = HelixonixEvent['type'];
