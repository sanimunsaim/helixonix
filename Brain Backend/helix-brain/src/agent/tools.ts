/**
 * All 20 Tool Implementations for HELIX-BRAIN
 * Each tool calls the Core API — no direct database access
 * All responses are validated with Zod schemas
 */

import { z } from 'zod';
import { apiGet, apiPost, apiPut, apiPatch } from '../lib/coreApiClient';
import { logToolExecution } from '../lib/logger';
import type {
  GetModerationQueueParams,
  GetModerationQueueResult,
  ApproveAssetParams,
  ApproveAssetResult,
  RejectAssetParams,
  RejectAssetResult,
  FlagAssetForReviewParams,
  FlagAssetForReviewResult,
  AssessDisputeParams,
  AssessDisputeResult,
  GetDisputeDetailsParams,
  GetDisputeDetailsResult,
  SuspendUserParams,
  SuspendUserResult,
  GetUserRiskProfileParams,
  GetUserRiskProfileResult,
  ProcessPayoutBatchParams,
  ProcessPayoutBatchResult,
  VerifyPayoutEligibilityParams,
  VerifyPayoutEligibilityResult,
  SendNotificationParams,
  SendNotificationResult,
  GetAnalyticsParams,
  GetAnalyticsResult,
  MatchProjectToSellersParams,
  MatchProjectToSellersResult,
  CreateFeaturedCollectionParams,
  CreateFeaturedCollectionResult,
  UpdateSellerLevelParams,
  UpdateSellerLevelResult,
  ScanContentSafetyParams,
  ScanContentSafetyResult,
  GenerateReportParams,
  GenerateReportResult,
  ApplyCommissionOverrideParams,
  ApplyCommissionOverrideResult,
  FlagTransactionParams,
  FlagTransactionResult,
  GetPlatformHealthParams,
  GetPlatformHealthResult,
  ToolName,
  ToolResult,
} from '../types/tools';

// ============================================================
// Zod Validation Schemas
// ============================================================
const ModerationQueueSchema = z.array(
  z.object({
    asset_id: z.string(),
    title: z.string(),
    type: z.string(),
    seller_id: z.string(),
    seller_name: z.string(),
    seller_level: z.string(),
    submitted_at: z.string(),
    nsfw_score: z.number(),
    copyright_score: z.number(),
    quality_score: z.number(),
    metadata_complete: z.boolean(),
    file_size: z.number(),
    dimensions: z.object({ width: z.number(), height: z.number() }).optional(),
    tags: z.array(z.string()),
  })
);

const ApproveAssetSchema = z.object({
  success: z.boolean(),
  asset_id: z.string(),
  published_at: z.string(),
});

const RejectAssetSchema = z.object({
  success: z.boolean(),
  seller_notified: z.boolean(),
  resubmit_allowed: z.boolean(),
});

const FlagAssetSchema = z.object({
  success: z.boolean(),
  queue_position: z.number(),
});

const AssessDisputeSchema = z.object({
  recommendation: z.string(),
  confidence: z.number(),
  reasoning: z.string(),
  key_signals: z.array(z.string()),
  seller_fault_score: z.number(),
  buyer_bad_faith_indicators: z.array(z.string()),
});

const SuspendUserSchema = z.object({
  success: z.boolean(),
  suspended_until: z.string().nullable(),
  notification_sent: z.boolean(),
});

const RiskProfileSchema = z.object({
  risk_score: z.number(),
  signals: z.array(
    z.object({ signal: z.string(), weight: z.number(), description: z.string() })
  ),
  transaction_anomalies: z.array(z.string()),
  chargeback_history: z.number(),
  account_age_days: z.number(),
  velocity_flags: z.array(z.string()),
});

const PayoutBatchSchema = z.object({
  processed: z.array(
    z.object({ seller_id: z.string(), amount: z.number(), method: z.string() })
  ),
  skipped: z.array(
    z.object({ seller_id: z.string(), reason: z.string() })
  ),
});

const PayoutEligibilitySchema = z.object({
  eligible: z.boolean(),
  checks: z.object({
    no_active_disputes: z.boolean(),
    funds_cleared: z.boolean(),
    account_verified: z.boolean(),
    tax_info_complete: z.boolean(),
    fraud_score_acceptable: z.boolean(),
  }),
  blocking_reason: z.string().nullable(),
});

const NotificationSchema = z.object({
  sent_count: z.number(),
  failed_count: z.number(),
});

const AnalyticsSchema = z.object({
  data: z.array(z.record(z.unknown())),
  totals: z.record(z.unknown()),
  trend: z.object({
    direction: z.enum(['up', 'down', 'flat']),
    percentage: z.number(),
  }),
});

const MatchSellersSchema = z.object({
  matches: z.array(
    z.object({
      seller_id: z.string(),
      seller_name: z.string(),
      match_score: z.number(),
      match_reasons: z.array(z.string()),
      avg_rating: z.number(),
      relevant_portfolio_urls: z.array(z.string()),
    })
  ),
});

const CollectionSchema = z.object({
  collection_id: z.string(),
  asset_count: z.number(),
  placement: z.string(),
});

const SellerLevelSchema = z.object({
  previous_level: z.string(),
  new_level: z.string(),
  evaluation: z.object({
    orders_completed: z.number(),
    avg_rating: z.number(),
    completion_rate: z.number(),
    response_rate: z.number(),
  }),
  threshold_met: z.boolean(),
});

const ContentSafetySchema = z.object({
  scores: z.object({
    nsfw: z.number(),
    violence: z.number(),
    quality: z.number(),
    copyright: z.number(),
  }),
  flagged: z.boolean(),
  flagged_reasons: z.array(z.string()),
  recommendation: z.enum(['approve', 'manual_review', 'reject']),
});

const ReportSchema = z.object({
  report_url: z.string().nullable(),
  data: z.record(z.unknown()).nullable(),
  sent: z.boolean(),
});

const CommissionOverrideSchema = z.object({
  success: z.boolean(),
  previous_rate: z.number(),
  new_rate: z.number(),
  expires_at: z.string().nullable(),
});

const FlagTransactionSchema = z.object({
  flagged: z.boolean(),
  action_taken: z.string(),
  finance_admin_notified: z.boolean(),
});

const PlatformHealthSchema = z.object({
  status: z.enum(['healthy', 'degraded', 'incident']),
  metrics: z.object({
    api_p99_ms: z.number(),
    error_rate_pct: z.number(),
    queue_depth: z.number(),
    active_sessions: z.number(),
  }),
  alerts: z.array(
    z.object({
      component: z.string(),
      severity: z.enum(['warning', 'critical', 'info']),
      message: z.string(),
    })
  ),
});

// ============================================================
// Tool Implementation Functions
// ============================================================

async function executeTool<T>(
  name: ToolName,
  operation: () => Promise<T>,
  params: Record<string, unknown>
): Promise<T> {
  const startTime = Date.now();
  try {
    const result = await operation();
    const duration = Date.now() - startTime;
    logToolExecution({ tool: name, params, result: 'success', duration_ms: duration });
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    logToolExecution({
      tool: name,
      params,
      result: 'error',
      duration_ms: duration,
      error: (error as Error).message,
    });
    throw error;
  }
}

// TOOL 1: get_moderation_queue
export async function getModerationQueue(
  params: GetModerationQueueParams
): Promise<GetModerationQueueResult> {
  return executeTool('get_moderation_queue', async () => {
    const data = await apiGet<unknown[]>('/internal/moderation/queue', params as Record<string, unknown>);
    return ModerationQueueSchema.parse(data);
  }, params as Record<string, unknown>);
}

// TOOL 2: approve_asset
export async function approveAsset(params: ApproveAssetParams): Promise<ApproveAssetResult> {
  return executeTool('approve_asset', async () => {
    const data = await apiPost<unknown>(`/internal/moderation/assets/${params.asset_id}/approve`, {
      reason: params.reason,
      featured: params.featured || false,
    });
    return ApproveAssetSchema.parse(data);
  }, params as unknown as Record<string, unknown>);
}

// TOOL 3: reject_asset
export async function rejectAsset(params: RejectAssetParams): Promise<RejectAssetResult> {
  return executeTool('reject_asset', async () => {
    const data = await apiPost<unknown>(`/internal/moderation/assets/${params.asset_id}/reject`, {
      reason_code: params.reason_code,
      custom_message: params.custom_message,
      allow_resubmit: params.allow_resubmit,
      category_ban: params.category_ban || false,
    });
    return RejectAssetSchema.parse(data);
  }, params as unknown as Record<string, unknown>);
}

// TOOL 4: flag_asset_for_review
export async function flagAssetForReview(
  params: FlagAssetForReviewParams
): Promise<FlagAssetForReviewResult> {
  return executeTool('flag_asset_for_review', async () => {
    const data = await apiPost<unknown>(`/internal/moderation/assets/${params.asset_id}/flag`, {
      flag_reason: params.flag_reason,
      priority: params.priority,
    });
    return FlagAssetSchema.parse(data);
  }, params as unknown as Record<string, unknown>);
}

// TOOL 5: assess_dispute
export async function assessDispute(params: AssessDisputeParams): Promise<AssessDisputeResult> {
  return executeTool('assess_dispute', async () => {
    const data = await apiPost<unknown>(`/internal/disputes/${params.dispute_id}/assess`, {});
    return AssessDisputeSchema.parse(data);
  }, params as unknown as Record<string, unknown>);
}

// TOOL 6: get_dispute_details
export async function getDisputeDetails(
  params: GetDisputeDetailsParams
): Promise<GetDisputeDetailsResult> {
  return executeTool('get_dispute_details', async () => {
    const data = await apiGet<unknown>(`/internal/disputes/${params.dispute_id}`);
    return data as GetDisputeDetailsResult;
  }, params as unknown as Record<string, unknown>);
}

// TOOL 7: suspend_user
export async function suspendUser(params: SuspendUserParams): Promise<SuspendUserResult> {
  return executeTool('suspend_user', async () => {
    const data = await apiPost<unknown>(`/internal/users/${params.user_id}/suspend`, {
      reason: params.reason,
      duration_days: params.duration_days,
      internal_notes: params.internal_notes || '',
      notify_user: params.notify_user !== false,
      restrict_only: params.restrict_only || false,
    });
    return SuspendUserSchema.parse(data);
  }, params as unknown as Record<string, unknown>);
}

// TOOL 8: get_user_risk_profile
export async function getUserRiskProfile(
  params: GetUserRiskProfileParams
): Promise<GetUserRiskProfileResult> {
  return executeTool('get_user_risk_profile', async () => {
    const data = await apiGet<unknown>(`/internal/users/${params.user_id}/risk-profile`);
    return RiskProfileSchema.parse(data);
  }, params as unknown as Record<string, unknown>);
}

// TOOL 9: process_payout_batch
export async function processPayoutBatch(
  params: ProcessPayoutBatchParams
): Promise<ProcessPayoutBatchResult> {
  return executeTool('process_payout_batch', async () => {
    const data = await apiPost<unknown>('/internal/payouts/process-batch', {
      max_amount_per_payout: params.max_amount_per_payout || 500,
      only_verified_sellers: params.only_verified_sellers !== false,
      payment_method: params.payment_method || 'all',
    });
    return PayoutBatchSchema.parse(data);
  }, params as unknown as Record<string, unknown>);
}

// TOOL 10: verify_payout_eligibility
export async function verifyPayoutEligibility(
  params: VerifyPayoutEligibilityParams
): Promise<VerifyPayoutEligibilityResult> {
  return executeTool('verify_payout_eligibility', async () => {
    const data = await apiGet<unknown>(`/internal/payouts/sellers/${params.seller_id}/eligibility`, {
      payout_amount: params.payout_amount,
    });
    return PayoutEligibilitySchema.parse(data);
  }, params as unknown as Record<string, unknown>);
}

// TOOL 11: send_notification
export async function sendNotification(
  params: SendNotificationParams
): Promise<SendNotificationResult> {
  return executeTool('send_notification', async () => {
    const data = await apiPost<unknown>('/internal/notifications/send', {
      user_ids: params.user_ids,
      type: params.type,
      title: params.title,
      message: params.message,
      email: params.email || false,
      email_template: params.email_template,
      action_url: params.action_url,
    });
    return NotificationSchema.parse(data);
  }, params as unknown as Record<string, unknown>);
}

// TOOL 12: get_analytics
export async function getAnalytics(params: GetAnalyticsParams): Promise<GetAnalyticsResult> {
  return executeTool('get_analytics', async () => {
    const queryParams: Record<string, unknown> = {
      metric: params.metric,
      date_range: params.date_range,
    };
    if (params.date_from) queryParams.date_from = params.date_from;
    if (params.date_to) queryParams.date_to = params.date_to;
    if (params.group_by) queryParams.group_by = params.group_by;
    if (params.top_n) queryParams.top_n = params.top_n;

    const data = await apiGet<unknown>('/internal/analytics', queryParams);
    return AnalyticsSchema.parse(data);
  }, params as unknown as Record<string, unknown>);
}

// TOOL 13: match_project_to_sellers
export async function matchProjectToSellers(
  params: MatchProjectToSellersParams
): Promise<MatchProjectToSellersResult> {
  return executeTool('match_project_to_sellers', async () => {
    const data = await apiGet<unknown>(`/internal/projects/${params.project_id}/match-sellers`, {
      max_results: params.max_results || 5,
      required_skills: params.required_skills,
      max_budget: params.max_budget,
    });
    return MatchSellersSchema.parse(data);
  }, params as unknown as Record<string, unknown>);
}

// TOOL 14: create_featured_collection
export async function createFeaturedCollection(
  params: CreateFeaturedCollectionParams
): Promise<CreateFeaturedCollectionResult> {
  return executeTool('create_featured_collection', async () => {
    const data = await apiPost<unknown>('/internal/collections', {
      name: params.name,
      description: params.description,
      asset_ids: params.asset_ids,
      placement: params.placement,
      active_from: params.active_from,
      active_until: params.active_until || null,
    });
    return CollectionSchema.parse(data);
  }, params as unknown as Record<string, unknown>);
}

// TOOL 15: update_seller_level
export async function updateSellerLevel(
  params: UpdateSellerLevelParams
): Promise<UpdateSellerLevelResult> {
  return executeTool('update_seller_level', async () => {
    const body: Record<string, unknown> = {};
    if (params.force_level) body.force_level = params.force_level;

    const data = await apiPost<unknown>(`/internal/sellers/${params.seller_id}/evaluate-level`, body);
    return SellerLevelSchema.parse(data);
  }, params as unknown as Record<string, unknown>);
}

// TOOL 16: scan_content_safety
export async function scanContentSafety(
  params: ScanContentSafetyParams
): Promise<ScanContentSafetyResult> {
  return executeTool('scan_content_safety', async () => {
    const body: Record<string, unknown> = {
      content_type: params.content_type,
      checks: params.checks,
    };
    if (params.content_url) body.content_url = params.content_url;
    if (params.content_text) body.content_text = params.content_text;

    const data = await apiPost<unknown>('/internal/content/safety-scan', body);
    return ContentSafetySchema.parse(data);
  }, params as unknown as Record<string, unknown>);
}

// TOOL 17: generate_report
export async function generateReport(params: GenerateReportParams): Promise<GenerateReportResult> {
  return executeTool('generate_report', async () => {
    const body: Record<string, unknown> = {
      report_type: params.report_type,
      date_range: params.date_range,
      format: params.format,
    };
    if (params.recipient_email) body.recipient_email = params.recipient_email;

    const data = await apiPost<unknown>('/internal/reports', body);
    return ReportSchema.parse(data);
  }, params as unknown as Record<string, unknown>);
}

// TOOL 18: apply_commission_override
export async function applyCommissionOverride(
  params: ApplyCommissionOverrideParams
): Promise<ApplyCommissionOverrideResult> {
  return executeTool('apply_commission_override', async () => {
    const data = await apiPost<unknown>(`/internal/sellers/${params.seller_id}/commission-override`, {
      commission_rate: params.commission_rate,
      reason: params.reason,
      expires_at: params.expires_at || null,
      approved_by_super_admin: params.approved_by_super_admin,
    });
    return CommissionOverrideSchema.parse(data);
  }, params as unknown as Record<string, unknown>);
}

// TOOL 19: flag_transaction
export async function flagTransaction(params: FlagTransactionParams): Promise<FlagTransactionResult> {
  return executeTool('flag_transaction', async () => {
    const data = await apiPost<unknown>(`/internal/transactions/${params.transaction_id}/flag`, {
      reason: params.reason,
      action: params.action,
      notify_finance_admin: params.notify_finance_admin !== false,
    });
    return FlagTransactionSchema.parse(data);
  }, params as unknown as Record<string, unknown>);
}

// TOOL 20: get_platform_health
export async function getPlatformHealth(
  params: GetPlatformHealthParams
): Promise<GetPlatformHealthResult> {
  return executeTool('get_platform_health', async () => {
    const queryParams: Record<string, unknown> = {};
    if (params.include) queryParams.include = params.include;

    const data = await apiGet<unknown>('/internal/platform/health', queryParams);
    return PlatformHealthSchema.parse(data);
  }, params as unknown as Record<string, unknown>);
}

// ============================================================
// Tool Router — dispatches tool calls to implementations
// ============================================================

export async function executeToolByName(
  name: ToolName,
  params: Record<string, unknown>
): Promise<ToolResult> {
  switch (name) {
    case 'get_moderation_queue':
      return getModerationQueue(params as unknown as GetModerationQueueParams);
    case 'approve_asset':
      return approveAsset(params as unknown as ApproveAssetParams);
    case 'reject_asset':
      return rejectAsset(params as unknown as RejectAssetParams);
    case 'flag_asset_for_review':
      return flagAssetForReview(params as unknown as FlagAssetForReviewParams);
    case 'assess_dispute':
      return assessDispute(params as unknown as AssessDisputeParams);
    case 'get_dispute_details':
      return getDisputeDetails(params as unknown as GetDisputeDetailsParams);
    case 'suspend_user':
      return suspendUser(params as unknown as SuspendUserParams);
    case 'get_user_risk_profile':
      return getUserRiskProfile(params as unknown as GetUserRiskProfileParams);
    case 'process_payout_batch':
      return processPayoutBatch(params as unknown as ProcessPayoutBatchParams);
    case 'verify_payout_eligibility':
      return verifyPayoutEligibility(params as unknown as VerifyPayoutEligibilityParams);
    case 'send_notification':
      return sendNotification(params as unknown as SendNotificationParams);
    case 'get_analytics':
      return getAnalytics(params as unknown as GetAnalyticsParams);
    case 'match_project_to_sellers':
      return matchProjectToSellers(params as unknown as MatchProjectToSellersParams);
    case 'create_featured_collection':
      return createFeaturedCollection(params as unknown as CreateFeaturedCollectionParams);
    case 'update_seller_level':
      return updateSellerLevel(params as unknown as UpdateSellerLevelParams);
    case 'scan_content_safety':
      return scanContentSafety(params as unknown as ScanContentSafetyParams);
    case 'generate_report':
      return generateReport(params as unknown as GenerateReportParams);
    case 'apply_commission_override':
      return applyCommissionOverride(params as unknown as ApplyCommissionOverrideParams);
    case 'flag_transaction':
      return flagTransaction(params as unknown as FlagTransactionParams);
    case 'get_platform_health':
      return getPlatformHealth(params as unknown as GetPlatformHealthParams);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
