/**
 * TypeScript Type Definitions for All HELIX-BRAIN Tools
 * Ensures type safety across all 20 tool implementations
 */

// ============================================================
// TOOL 1: get_moderation_queue
// ============================================================
export interface GetModerationQueueParams {
  limit?: number;
  type?: 'all' | 'template' | 'stock_image' | 'stock_video' | 'audio' | 'font' | '3d';
  min_quality_score?: number;
  max_quality_score?: number;
  seller_level?: 'all' | 'new' | 'rising' | 'pro';
  oldest_first?: boolean;
}

export interface ModerationAsset {
  asset_id: string;
  title: string;
  type: string;
  seller_id: string;
  seller_name: string;
  seller_level: string;
  submitted_at: string;
  nsfw_score: number;
  copyright_score: number;
  quality_score: number;
  metadata_complete: boolean;
  file_size: number;
  dimensions?: { width: number; height: number };
  tags: string[];
}

export type GetModerationQueueResult = ModerationAsset[];

// ============================================================
// TOOL 2: approve_asset
// ============================================================
export interface ApproveAssetParams {
  asset_id: string;
  reason: string;
  featured?: boolean;
}

export interface ApproveAssetResult {
  success: boolean;
  asset_id: string;
  published_at: string;
}

// ============================================================
// TOOL 3: reject_asset
// ============================================================
export interface RejectAssetParams {
  asset_id: string;
  reason_code: 'nsfw' | 'copyright' | 'quality' | 'incomplete' | 'policy_violation' | 'duplicate';
  custom_message: string;
  allow_resubmit: boolean;
  category_ban?: boolean;
}

export interface RejectAssetResult {
  success: boolean;
  seller_notified: boolean;
  resubmit_allowed: boolean;
}

// ============================================================
// TOOL 4: flag_asset_for_review
// ============================================================
export interface FlagAssetForReviewParams {
  asset_id: string;
  flag_reason: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface FlagAssetForReviewResult {
  success: boolean;
  queue_position: number;
}

// ============================================================
// TOOL 5: assess_dispute
// ============================================================
export interface AssessDisputeParams {
  dispute_id: string;
}

export interface AssessDisputeResult {
  recommendation: string;
  confidence: number;
  reasoning: string;
  key_signals: string[];
  seller_fault_score: number;
  buyer_bad_faith_indicators: string[];
}

// ============================================================
// TOOL 6: get_dispute_details
// ============================================================
export interface GetDisputeDetailsParams {
  dispute_id: string;
}

export interface DisputeMessage {
  id: string;
  sender: 'buyer' | 'seller' | 'system';
  content: string;
  timestamp: string;
}

export interface GetDisputeDetailsResult {
  dispute: {
    id: string;
    status: string;
    opened_at: string;
    reason: string;
    amount: number;
  };
  order: {
    id: string;
    status: string;
    total_amount: number;
    created_at: string;
    deadline_at: string;
  };
  buyer: { id: string; name: string; email: string };
  seller: { id: string; name: string; email: string };
  messages: DisputeMessage[];
  evidence_files: string[];
  order_timeline: { event: string; timestamp: string }[];
}

// ============================================================
// TOOL 7: suspend_user
// ============================================================
export interface SuspendUserParams {
  user_id: string;
  reason: string;
  duration_days: number;
  internal_notes?: string;
  notify_user?: boolean;
  restrict_only?: boolean;
}

export interface SuspendUserResult {
  success: boolean;
  suspended_until: string | null;
  notification_sent: boolean;
}

// ============================================================
// TOOL 8: get_user_risk_profile
// ============================================================
export interface GetUserRiskProfileParams {
  user_id: string;
}

export interface RiskSignal {
  signal: string;
  weight: number;
  description: string;
}

export interface GetUserRiskProfileResult {
  risk_score: number;
  signals: RiskSignal[];
  transaction_anomalies: string[];
  chargeback_history: number;
  account_age_days: number;
  velocity_flags: string[];
}

// ============================================================
// TOOL 9: process_payout_batch
// ============================================================
export interface ProcessPayoutBatchParams {
  max_amount_per_payout?: number;
  only_verified_sellers?: boolean;
  payment_method?: 'all' | 'paypal' | 'stripe' | 'wise';
}

export interface PayoutProcessed {
  seller_id: string;
  amount: number;
  method: string;
}

export interface PayoutSkipped {
  seller_id: string;
  reason: string;
}

export interface ProcessPayoutBatchResult {
  processed: PayoutProcessed[];
  skipped: PayoutSkipped[];
}

// ============================================================
// TOOL 10: verify_payout_eligibility
// ============================================================
export interface VerifyPayoutEligibilityParams {
  seller_id: string;
  payout_amount: number;
}

export interface PayoutChecks {
  no_active_disputes: boolean;
  funds_cleared: boolean;
  account_verified: boolean;
  tax_info_complete: boolean;
  fraud_score_acceptable: boolean;
}

export interface VerifyPayoutEligibilityResult {
  eligible: boolean;
  checks: PayoutChecks;
  blocking_reason: string | null;
}

// ============================================================
// TOOL 11: send_notification
// ============================================================
export interface SendNotificationParams {
  user_ids: string[];
  type: 'info' | 'warning' | 'alert' | 'success' | 'promotional';
  title: string;
  message: string;
  email?: boolean;
  email_template?: string;
  action_url?: string;
}

export interface SendNotificationResult {
  sent_count: number;
  failed_count: number;
}

// ============================================================
// TOOL 12: get_analytics
// ============================================================
export interface GetAnalyticsParams {
  metric: string;
  date_range: string;
  date_from?: string;
  date_to?: string;
  group_by?: string;
  top_n?: number;
}

export interface GetAnalyticsResult {
  data: Array<Record<string, unknown>>;
  totals: Record<string, unknown>;
  trend: { direction: 'up' | 'down' | 'flat'; percentage: number };
}

// ============================================================
// TOOL 13: match_project_to_sellers
// ============================================================
export interface MatchProjectToSellersParams {
  project_id: string;
  max_results?: number;
  required_skills?: string[];
  max_budget?: number;
}

export interface SellerMatch {
  seller_id: string;
  seller_name: string;
  match_score: number;
  match_reasons: string[];
  avg_rating: number;
  relevant_portfolio_urls: string[];
}

export interface MatchProjectToSellersResult {
  matches: SellerMatch[];
}

// ============================================================
// TOOL 14: create_featured_collection
// ============================================================
export interface CreateFeaturedCollectionParams {
  name: string;
  description: string;
  asset_ids: string[];
  placement: 'homepage' | 'category' | 'sidebar';
  active_from: string;
  active_until?: string | null;
}

export interface CreateFeaturedCollectionResult {
  collection_id: string;
  asset_count: number;
  placement: string;
}

// ============================================================
// TOOL 15: update_seller_level
// ============================================================
export interface UpdateSellerLevelParams {
  seller_id: string;
  force_level?: 'new' | 'rising' | 'pro' | 'top_rated' | 'elite';
}

export interface UpdateSellerLevelResult {
  previous_level: string;
  new_level: string;
  evaluation: {
    orders_completed: number;
    avg_rating: number;
    completion_rate: number;
    response_rate: number;
  };
  threshold_met: boolean;
}

// ============================================================
// TOOL 16: scan_content_safety
// ============================================================
export interface ScanContentSafetyParams {
  content_type: 'image' | 'video' | 'text' | 'audio';
  content_url?: string;
  content_text?: string;
  checks: string[];
}

export interface ContentSafetyScores {
  nsfw: number;
  violence: number;
  quality: number;
  copyright: number;
}

export interface ScanContentSafetyResult {
  scores: ContentSafetyScores;
  flagged: boolean;
  flagged_reasons: string[];
  recommendation: 'approve' | 'manual_review' | 'reject';
}

// ============================================================
// TOOL 17: generate_report
// ============================================================
export interface GenerateReportParams {
  report_type: string;
  date_range: string;
  format: 'json' | 'pdf_url' | 'email';
  recipient_email?: string;
}

export interface GenerateReportResult {
  report_url: string | null;
  data: Record<string, unknown> | null;
  sent: boolean;
}

// ============================================================
// TOOL 18: apply_commission_override
// ============================================================
export interface ApplyCommissionOverrideParams {
  seller_id: string;
  commission_rate: number;
  reason: string;
  expires_at?: string | null;
  approved_by_super_admin: boolean;
}

export interface ApplyCommissionOverrideResult {
  success: boolean;
  previous_rate: number;
  new_rate: number;
  expires_at: string | null;
}

// ============================================================
// TOOL 19: flag_transaction
// ============================================================
export interface FlagTransactionParams {
  transaction_id: string;
  reason: string;
  action: 'monitor' | 'freeze' | 'reverse_request';
  notify_finance_admin?: boolean;
}

export interface FlagTransactionResult {
  flagged: boolean;
  action_taken: string;
  finance_admin_notified: boolean;
}

// ============================================================
// TOOL 20: get_platform_health
// ============================================================
export interface GetPlatformHealthParams {
  include?: string[];
}

export interface PlatformHealthAlert {
  component: string;
  severity: 'warning' | 'critical' | 'info';
  message: string;
}

export interface GetPlatformHealthResult {
  status: 'healthy' | 'degraded' | 'incident';
  metrics: {
    api_p99_ms: number;
    error_rate_pct: number;
    queue_depth: number;
    active_sessions: number;
  };
  alerts: PlatformHealthAlert[];
}

// ============================================================
// Union Types for Tool Handling
// ============================================================
export type ToolName =
  | 'get_moderation_queue'
  | 'approve_asset'
  | 'reject_asset'
  | 'flag_asset_for_review'
  | 'assess_dispute'
  | 'get_dispute_details'
  | 'suspend_user'
  | 'get_user_risk_profile'
  | 'process_payout_batch'
  | 'verify_payout_eligibility'
  | 'send_notification'
  | 'get_analytics'
  | 'match_project_to_sellers'
  | 'create_featured_collection'
  | 'update_seller_level'
  | 'scan_content_safety'
  | 'generate_report'
  | 'apply_commission_override'
  | 'flag_transaction'
  | 'get_platform_health';

export interface ToolCall {
  name: ToolName;
  arguments: Record<string, unknown>;
}

export type ToolResult =
  | GetModerationQueueResult
  | ApproveAssetResult
  | RejectAssetResult
  | FlagAssetForReviewResult
  | AssessDisputeResult
  | GetDisputeDetailsResult
  | SuspendUserResult
  | GetUserRiskProfileResult
  | ProcessPayoutBatchResult
  | VerifyPayoutEligibilityResult
  | SendNotificationResult
  | GetAnalyticsResult
  | MatchProjectToSellersResult
  | CreateFeaturedCollectionResult
  | UpdateSellerLevelResult
  | ScanContentSafetyResult
  | GenerateReportResult
  | ApplyCommissionOverrideResult
  | FlagTransactionResult
  | GetPlatformHealthResult;
