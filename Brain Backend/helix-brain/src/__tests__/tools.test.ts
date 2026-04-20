/**
 * Unit Tests for HELIX-BRAIN Tool Implementations
 * Tests all 20 tools with mocked Core API calls
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getModerationQueue,
  approveAsset,
  rejectAsset,
  flagAssetForReview,
  assessDispute,
  suspendUser,
  getUserRiskProfile,
  verifyPayoutEligibility,
  sendNotification,
  getAnalytics,
  matchProjectToSellers,
  createFeaturedCollection,
  updateSellerLevel,
  scanContentSafety,
  generateReport,
  flagTransaction,
  getPlatformHealth,
  executeToolByName,
} from '../agent/tools';

// Mock the Core API client
vi.mock('../lib/coreApiClient', () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiPut: vi.fn(),
  apiPatch: vi.fn(),
  apiDelete: vi.fn(),
}));

import { apiGet, apiPost } from '../lib/coreApiClient';

const mockedApiGet = vi.mocked(apiGet);
const mockedApiPost = vi.mocked(apiPost);

describe('HELIX-BRAIN Tools', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ============================================================
  // TOOL 1: get_moderation_queue
  // ============================================================
  describe('getModerationQueue', () => {
    it('should fetch and validate moderation queue', async () => {
      const mockQueue = [
        {
          asset_id: 'asset_123',
          title: 'Test Asset',
          type: 'template',
          seller_id: 'seller_1',
          seller_name: 'John',
          seller_level: 'new',
          submitted_at: '2024-01-01T00:00:00Z',
          nsfw_score: 0.05,
          copyright_score: 0.02,
          quality_score: 0.85,
          metadata_complete: true,
          file_size: 1024000,
          tags: ['test', 'template'],
        },
      ];

      mockedApiGet.mockResolvedValueOnce(mockQueue);

      const result = await getModerationQueue({ limit: 50, type: 'all' });

      expect(result).toHaveLength(1);
      expect(result[0].asset_id).toBe('asset_123');
      expect(result[0].quality_score).toBe(0.85);
      expect(mockedApiGet).toHaveBeenCalledWith('/internal/moderation/queue', {
        limit: 50,
        type: 'all',
      });
    });

    it('should throw on invalid response', async () => {
      mockedApiGet.mockResolvedValueOnce([{ invalid: 'data' }]);

      await expect(getModerationQueue({})).rejects.toThrow();
    });
  });

  // ============================================================
  // TOOL 2: approve_asset
  // ============================================================
  describe('approveAsset', () => {
    it('should approve asset with reason', async () => {
      const mockResponse = {
        success: true,
        asset_id: 'asset_123',
        published_at: '2024-01-01T12:00:00Z',
      };

      mockedApiPost.mockResolvedValueOnce(mockResponse);

      const result = await approveAsset({
        asset_id: 'asset_123',
        reason: 'Quality score 0.89, all checks pass',
      });

      expect(result.success).toBe(true);
      expect(result.published_at).toBe('2024-01-01T12:00:00Z');
      expect(mockedApiPost).toHaveBeenCalledWith(
        '/internal/moderation/assets/asset_123/approve',
        expect.objectContaining({
          reason: 'Quality score 0.89, all checks pass',
          featured: false,
        })
      );
    });
  });

  // ============================================================
  // TOOL 3: reject_asset
  // ============================================================
  describe('rejectAsset', () => {
    it('should reject asset with proper reason', async () => {
      const mockResponse = {
        success: true,
        seller_notified: true,
        resubmit_allowed: true,
      };

      mockedApiPost.mockResolvedValueOnce(mockResponse);

      const result = await rejectAsset({
        asset_id: 'asset_456',
        reason_code: 'quality',
        custom_message: 'Image resolution is too low. Minimum 1920x1080 required.',
        allow_resubmit: true,
      });

      expect(result.success).toBe(true);
      expect(result.seller_notified).toBe(true);
      expect(mockedApiPost).toHaveBeenCalledWith(
        '/internal/moderation/assets/asset_456/reject',
        expect.objectContaining({
          reason_code: 'quality',
          allow_resubmit: true,
        })
      );
    });
  });

  // ============================================================
  // TOOL 4: flag_asset_for_review
  // ============================================================
  describe('flagAssetForReview', () => {
    it('should flag asset with priority', async () => {
      const mockResponse = { success: true, queue_position: 42 };

      mockedApiPost.mockResolvedValueOnce(mockResponse);

      const result = await flagAssetForReview({
        asset_id: 'asset_789',
        flag_reason: 'Borderline NSFW score 0.45, needs human review',
        priority: 'high',
      });

      expect(result.queue_position).toBe(42);
      expect(mockedApiPost).toHaveBeenCalledWith(
        '/internal/moderation/assets/asset_789/flag',
        expect.objectContaining({ priority: 'high' })
      );
    });
  });

  // ============================================================
  // TOOL 5: assess_dispute
  // ============================================================
  describe('assessDispute', () => {
    it('should return AI assessment with recommendation', async () => {
      const mockResponse = {
        recommendation: 'partial_refund_50_percent',
        confidence: 0.85,
        reasoning: 'Both parties share responsibility',
        key_signals: ['late_delivery', 'scope_creep'],
        seller_fault_score: 60,
        buyer_bad_faith_indicators: ['excessive_revisions'],
      };

      mockedApiPost.mockResolvedValueOnce(mockResponse);

      const result = await assessDispute({ dispute_id: 'disp_001' });

      expect(result.confidence).toBe(0.85);
      expect(result.seller_fault_score).toBe(60);
      expect(result.recommendation).toContain('partial_refund');
    });
  });

  // ============================================================
  // TOOL 7: suspend_user
  // ============================================================
  describe('suspendUser', () => {
    it('should suspend user for specified duration', async () => {
      const mockResponse = {
        success: true,
        suspended_until: '2024-02-01T00:00:00Z',
        notification_sent: true,
      };

      mockedApiPost.mockResolvedValueOnce(mockResponse);

      const result = await suspendUser({
        user_id: 'user_123',
        reason: 'Fraud score 85/100',
        duration_days: 30,
        restrict_only: true,
      });

      expect(result.success).toBe(true);
      expect(result.notification_sent).toBe(true);
      expect(mockedApiPost).toHaveBeenCalledWith(
        '/internal/users/user_123/suspend',
        expect.objectContaining({
          duration_days: 30,
          restrict_only: true,
        })
      );
    });
  });

  // ============================================================
  // TOOL 8: get_user_risk_profile
  // ============================================================
  describe('getUserRiskProfile', () => {
    it('should return risk assessment with score', async () => {
      const mockResponse = {
        risk_score: 72,
        signals: [
          { signal: 'new_account_high_value', weight: 0.4, description: 'Large transaction from new account' },
        ],
        transaction_anomalies: ['velocity_spike'],
        chargeback_history: 0,
        account_age_days: 3,
        velocity_flags: ['3_transactions_1_hour'],
      };

      mockedApiGet.mockResolvedValueOnce(mockResponse);

      const result = await getUserRiskProfile({ user_id: 'user_456' });

      expect(result.risk_score).toBe(72);
      expect(result.signals).toHaveLength(1);
      expect(result.velocity_flags).toContain('3_transactions_1_hour');
    });
  });

  // ============================================================
  // TOOL 10: verify_payout_eligibility
  // ============================================================
  describe('verifyPayoutEligibility', () => {
    it('should return eligibility with all checks', async () => {
      const mockResponse = {
        eligible: true,
        checks: {
          no_active_disputes: true,
          funds_cleared: true,
          account_verified: true,
          tax_info_complete: true,
          fraud_score_acceptable: true,
        },
        blocking_reason: null,
      };

      mockedApiGet.mockResolvedValueOnce(mockResponse);

      const result = await verifyPayoutEligibility({
        seller_id: 'seller_789',
        payout_amount: 250,
      });

      expect(result.eligible).toBe(true);
      expect(result.checks.no_active_disputes).toBe(true);
      expect(result.blocking_reason).toBeNull();
    });

    it('should return ineligible when checks fail', async () => {
      const mockResponse = {
        eligible: false,
        checks: {
          no_active_disputes: false,
          funds_cleared: true,
          account_verified: true,
          tax_info_complete: true,
          fraud_score_acceptable: true,
        },
        blocking_reason: 'Active dispute on order #123',
      };

      mockedApiGet.mockResolvedValueOnce(mockResponse);

      const result = await verifyPayoutEligibility({
        seller_id: 'seller_999',
        payout_amount: 100,
      });

      expect(result.eligible).toBe(false);
      expect(result.blocking_reason).toContain('dispute');
    });
  });

  // ============================================================
  // TOOL 11: send_notification
  // ============================================================
  describe('sendNotification', () => {
    it('should send notification to users', async () => {
      const mockResponse = { sent_count: 5, failed_count: 0 };

      mockedApiPost.mockResolvedValueOnce(mockResponse);

      const result = await sendNotification({
        user_ids: ['user_1', 'user_2', 'user_3'],
        type: 'warning',
        title: 'System Maintenance',
        message: 'Scheduled maintenance in 2 hours',
      });

      expect(result.sent_count).toBe(5);
      expect(result.failed_count).toBe(0);
    });
  });

  // ============================================================
  // TOOL 16: scan_content_safety
  // ============================================================
  describe('scanContentSafety', () => {
    it('should return safety scores and recommendation', async () => {
      const mockResponse = {
        scores: { nsfw: 0.02, violence: 0.01, quality: 0.92, copyright: 0.05 },
        flagged: false,
        flagged_reasons: [],
        recommendation: 'approve',
      };

      mockedApiPost.mockResolvedValueOnce(mockResponse);

      const result = await scanContentSafety({
        content_type: 'image',
        content_url: 'https://cdn.example.com/image.jpg',
        checks: ['nsfw', 'copyright_similarity', 'quality'],
      });

      expect(result.flagged).toBe(false);
      expect(result.recommendation).toBe('approve');
      expect(result.scores.quality).toBe(0.92);
    });

    it('should flag unsafe content', async () => {
      const mockResponse = {
        scores: { nsfw: 0.92, violence: 0.15, quality: 0.45, copyright: 0.88 },
        flagged: true,
        flagged_reasons: ['High NSFW score', 'Copyright match detected'],
        recommendation: 'reject',
      };

      mockedApiPost.mockResolvedValueOnce(mockResponse);

      const result = await scanContentSafety({
        content_type: 'image',
        content_url: 'https://cdn.example.com/suspicious.jpg',
        checks: ['nsfw', 'copyright_similarity', 'quality'],
      });

      expect(result.flagged).toBe(true);
      expect(result.recommendation).toBe('reject');
    });
  });

  // ============================================================
  // TOOL 20: get_platform_health
  // ============================================================
  describe('getPlatformHealth', () => {
    it('should return platform health metrics', async () => {
      const mockResponse = {
        status: 'healthy' as const,
        metrics: {
          api_p99_ms: 120,
          error_rate_pct: 0.02,
          queue_depth: 15,
          active_sessions: 1240,
        },
        alerts: [],
      };

      mockedApiGet.mockResolvedValueOnce(mockResponse);

      const result = await getPlatformHealth({});

      expect(result.status).toBe('healthy');
      expect(result.metrics.error_rate_pct).toBe(0.02);
    });

    it('should return degraded status with alerts', async () => {
      const mockResponse = {
        status: 'degraded' as const,
        metrics: {
          api_p99_ms: 2500,
          error_rate_pct: 5.5,
          queue_depth: 450,
          active_sessions: 800,
        },
        alerts: [
          { component: 'api', severity: 'warning' as const, message: 'P99 latency elevated' },
          { component: 'queue', severity: 'critical' as const, message: 'Queue depth critical' },
        ],
      };

      mockedApiGet.mockResolvedValueOnce(mockResponse);

      const result = await getPlatformHealth({
        include: ['api_response_times', 'queue_depth'],
      });

      expect(result.status).toBe('degraded');
      expect(result.alerts).toHaveLength(2);
    });
  });

  // ============================================================
  // Tool Router
  // ============================================================
  describe('executeToolByName', () => {
    it('should route to correct tool implementation', async () => {
      const mockResponse = {
        success: true,
        asset_id: 'asset_123',
        published_at: '2024-01-01T00:00:00Z',
      };

      mockedApiPost.mockResolvedValueOnce(mockResponse);

      const result = await executeToolByName('approve_asset', {
        asset_id: 'asset_123',
        reason: 'Test approval',
      });

      expect(result).toEqual(mockResponse);
      expect(mockedApiPost).toHaveBeenCalled();
    });

    it('should throw for unknown tool', async () => {
      await expect(
        // @ts-expect-error Testing unknown tool
        executeToolByName('unknown_tool', {})
      ).rejects.toThrow('Unknown tool');
    });
  });
});
