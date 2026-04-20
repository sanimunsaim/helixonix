/**
 * Anthropic Function Calling JSON Schemas
 * All 20 tools with complete parameter definitions for Claude
 */

import type Anthropic from '@anthropic-ai/sdk';

/**
 * All tool definitions for Anthropic function calling
 */
export const toolSchemas: Anthropic.Tool[] = [
  // ============================================================
  // TOOL 1: get_moderation_queue
  // ============================================================
  {
    name: 'get_moderation_queue',
    description: 'Fetch assets pending content moderation review with AI-generated quality scores and seller metadata. Use this to see what needs moderation action.',
    input_schema: {
      type: 'object' as const,
      properties: {
        limit: { type: 'integer', minimum: 1, maximum: 100, default: 50, description: 'Number of assets to fetch (1-100)' },
        type: { type: 'string', enum: ['all', 'template', 'stock_image', 'stock_video', 'audio', 'font', '3d'], default: 'all', description: 'Filter by asset type' },
        min_quality_score: { type: 'number', minimum: 0, maximum: 1, description: 'Minimum quality score threshold (0-1)' },
        max_quality_score: { type: 'number', minimum: 0, maximum: 1, description: 'Maximum quality score threshold (0-1)' },
        seller_level: { type: 'string', enum: ['all', 'new', 'rising', 'pro'], default: 'all', description: 'Filter by seller tier (new sellers need higher scrutiny)' },
        oldest_first: { type: 'boolean', default: true, description: 'Order by oldest submissions first' },
      },
    },
  },

  // ============================================================
  // TOOL 2: approve_asset
  // ============================================================
  {
    name: 'approve_asset',
    description: 'Approve an asset for publication on the marketplace. Use when all quality checks pass and content is safe. Requires a clear approval reason.',
    input_schema: {
      type: 'object' as const,
      properties: {
        asset_id: { type: 'string', description: 'Unique identifier of the asset to approve' },
        reason: { type: 'string', description: 'Detailed explanation of why the asset is approved (e.g., "Quality score 0.89, no NSFW/copyright flags, metadata complete")' },
        featured: { type: 'boolean', description: 'Mark this asset as featured for prominent placement' },
      },
      required: ['asset_id', 'reason'],
    },
  },

  // ============================================================
  // TOOL 3: reject_asset
  // ============================================================
  {
    name: 'reject_asset',
    description: 'Reject an asset and send notification to the seller with the rejection reason. Use for clear policy violations, poor quality, or copyright issues. Be specific in the custom message so the seller understands what to fix.',
    input_schema: {
      type: 'object' as const,
      properties: {
        asset_id: { type: 'string', description: 'Unique identifier of the asset to reject' },
        reason_code: { type: 'string', enum: ['nsfw', 'copyright', 'quality', 'incomplete', 'policy_violation', 'duplicate'], description: 'Category of rejection reason' },
        custom_message: { type: 'string', description: 'Human-readable message sent to the seller explaining why it was rejected and how to improve' },
        allow_resubmit: { type: 'boolean', description: 'Whether the seller can fix the issues and resubmit the asset' },
        category_ban: { type: 'boolean', default: false, description: 'Temporarily ban seller from this category for 30 days (for repeated violations)' },
      },
      required: ['asset_id', 'reason_code', 'custom_message', 'allow_resubmit'],
    },
  },

  // ============================================================
  // TOOL 4: flag_asset_for_review
  // ============================================================
  {
    name: 'flag_asset_for_review',
    description: 'Move an asset to the manual human review queue when the AI is uncertain about a decision. Use when scores are borderline or the content requires human judgment.',
    input_schema: {
      type: 'object' as const,
      properties: {
        asset_id: { type: 'string', description: 'Unique identifier of the asset to flag' },
        flag_reason: { type: 'string', description: 'Detailed explanation for the moderator about why this needs human review' },
        priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'], description: 'Priority level in the review queue' },
      },
      required: ['asset_id', 'flag_reason', 'priority'],
    },
  },

  // ============================================================
  // TOOL 5: assess_dispute
  // ============================================================
  {
    name: 'assess_dispute',
    description: 'Analyze an order dispute using AI to provide a recommendation. Reviews order details, messages, timeline, and evidence to suggest refund amount and fault attribution.',
    input_schema: {
      type: 'object' as const,
      properties: {
        dispute_id: { type: 'string', description: 'Unique identifier of the dispute to assess' },
      },
      required: ['dispute_id'],
    },
  },

  // ============================================================
  // TOOL 6: get_dispute_details
  // ============================================================
  {
    name: 'get_dispute_details',
    description: 'Fetch complete dispute data including order information, all messages between parties, uploaded evidence files, and the full order timeline. Use before making dispute decisions.',
    input_schema: {
      type: 'object' as const,
      properties: {
        dispute_id: { type: 'string', description: 'Unique identifier of the dispute' },
      },
      required: ['dispute_id'],
    },
  },

  // ============================================================
  // TOOL 7: suspend_user
  // ============================================================
  {
    name: 'suspend_user',
    description: 'Suspend or restrict a user account. DESTRUCTIVE ACTION — use conservatively. For fraud score 81+ auto-suspend with restrict_only:true. For permanent bans, requires super_admin confirmation (duration_days: 0).',
    input_schema: {
      type: 'object' as const,
      properties: {
        user_id: { type: 'string', description: 'Unique identifier of the user to suspend' },
        reason: { type: 'string', description: 'Clear explanation of why the suspension is being applied' },
        duration_days: { type: 'integer', minimum: 0, description: 'Number of days to suspend (0 = permanent, requires super_admin confirmation)' },
        internal_notes: { type: 'string', description: 'Internal-only notes for admin reference' },
        notify_user: { type: 'boolean', default: true, description: 'Whether to send notification to the user' },
        restrict_only: { type: 'boolean', default: false, description: 'If true, only restrict new purchases (soft restriction), do not ban from platform' },
      },
      required: ['user_id', 'reason', 'duration_days'],
    },
  },

  // ============================================================
  // TOOL 8: get_user_risk_profile
  // ============================================================
  {
    name: 'get_user_risk_profile',
    description: 'Get comprehensive fraud risk assessment for a user including behavioral signals, transaction anomalies, chargeback history, and velocity flags. Use before processing payouts or when fraud signals detected.',
    input_schema: {
      type: 'object' as const,
      properties: {
        user_id: { type: 'string', description: 'Unique identifier of the user to assess' },
      },
      required: ['user_id'],
    },
  },

  // ============================================================
  // TOOL 9: process_payout_batch
  // ============================================================
  {
    name: 'process_payout_batch',
    description: 'Process a batch of pending payout requests that pass verification checks. Auto-processes payouts up to the max_amount threshold. Larger payouts require manual finance admin approval.',
    input_schema: {
      type: 'object' as const,
      properties: {
        max_amount_per_payout: { type: 'number', default: 500, description: 'Maximum dollar amount to auto-process per payout ($500 default)' },
        only_verified_sellers: { type: 'boolean', default: true, description: 'Only process payouts for verified sellers' },
        payment_method: { type: 'string', enum: ['all', 'paypal', 'stripe', 'wise'], default: 'all', description: 'Filter by payment method' },
      },
    },
  },

  // ============================================================
  // TOOL 10: verify_payout_eligibility
  // ============================================================
  {
    name: 'verify_payout_eligibility',
    description: 'Check if a seller\'s specific payout request should be approved. Verifies no active disputes, funds cleared, account verified, tax info complete, and fraud score acceptable.',
    input_schema: {
      type: 'object' as const,
      properties: {
        seller_id: { type: 'string', description: 'Unique identifier of the seller' },
        payout_amount: { type: 'number', description: 'Amount of the payout request in USD' },
      },
      required: ['seller_id', 'payout_amount'],
    },
  },

  // ============================================================
  // TOOL 11: send_notification
  // ============================================================
  {
    name: 'send_notification',
    description: 'Send in-app and/or email notifications to users. Supports magic strings for bulk sends: "all_sellers", "all_buyers", "all_admins". Use for alerts, warnings, and informational messages.',
    input_schema: {
      type: 'object' as const,
      properties: {
        user_ids: { type: 'array', items: { type: 'string' }, description: 'Array of user IDs, or magic strings: "all_sellers", "all_buyers", "all_admins"' },
        type: { type: 'string', enum: ['info', 'warning', 'alert', 'success', 'promotional'], description: 'Notification severity/type' },
        title: { type: 'string', description: 'Notification title/headline' },
        message: { type: 'string', description: 'Notification body message' },
        email: { type: 'boolean', default: false, description: 'Also send as email' },
        email_template: { type: 'string', description: 'Email template name (required if email=true)' },
        action_url: { type: 'string', description: 'Optional call-to-action link URL' },
      },
      required: ['user_ids', 'type', 'title', 'message'],
    },
  },

  // ============================================================
  // TOOL 12: get_analytics
  // ============================================================
  {
    name: 'get_analytics',
    description: 'Query platform analytics and metrics including revenue, orders, users, GMV, commission, refunds, seller performance, and category breakdowns. Use for reporting and decision-making.',
    input_schema: {
      type: 'object' as const,
      properties: {
        metric: { type: 'string', enum: ['revenue', 'orders', 'users', 'gmv', 'commission', 'refunds', 'ai_usage', 'seller_performance', 'buyer_ltv', 'category_performance'], description: 'Metric to query' },
        date_range: { type: 'string', enum: ['today', 'yesterday', 'last_7d', 'last_30d', 'last_90d', 'last_year', 'custom'], description: 'Predefined date range' },
        date_from: { type: 'string', description: 'Start date (ISO 8601, required if date_range=custom)' },
        date_to: { type: 'string', description: 'End date (ISO 8601, required if date_range=custom)' },
        group_by: { type: 'string', enum: ['day', 'week', 'month', 'category', 'seller_tier', 'plan'], description: 'Optional grouping dimension' },
        top_n: { type: 'integer', description: 'Return top N results only' },
      },
      required: ['metric', 'date_range'],
    },
  },

  // ============================================================
  // TOOL 13: match_project_to_sellers
  // ============================================================
  {
    name: 'match_project_to_sellers',
    description: 'Find the best matching sellers for a posted project brief. Uses skills matching, portfolio relevance, ratings, and budget fit to rank sellers. Returns top matches with match scores and reasoning.',
    input_schema: {
      type: 'object' as const,
      properties: {
        project_id: { type: 'string', description: 'Unique identifier of the project brief' },
        max_results: { type: 'integer', default: 5, description: 'Maximum number of seller matches to return' },
        required_skills: { type: 'array', items: { type: 'string' }, description: 'Optional override list of required skills' },
        max_budget: { type: 'number', description: 'Optional budget ceiling filter' },
      },
      required: ['project_id'],
    },
  },

  // ============================================================
  // TOOL 14: create_featured_collection
  // ============================================================
  {
    name: 'create_featured_collection',
    description: 'Create a curated asset collection for prominent marketplace placement. Used for seasonal themes, editor picks, trending collections, or category spotlights.',
    input_schema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string', description: 'Display name of the collection' },
        description: { type: 'string', description: 'Description shown to users' },
        asset_ids: { type: 'array', items: { type: 'string' }, description: 'List of asset IDs to include in the collection' },
        placement: { type: 'string', enum: ['homepage', 'category', 'sidebar'], description: 'Where the collection appears on the site' },
        active_from: { type: 'string', description: 'When the collection goes live (ISO 8601)' },
        active_until: { type: 'string', description: 'When the collection expires (ISO 8601, omit for permanent)' },
      },
      required: ['name', 'description', 'asset_ids', 'placement', 'active_from'],
    },
  },

  // ============================================================
  // TOOL 15: update_seller_level
  // ============================================================
  {
    name: 'update_seller_level',
    description: 'Evaluate and update a seller\'s tier level (new, rising, pro, top_rated, elite) based on performance metrics. Auto-evaluates using orders, ratings, completion rate, and response rate. Optionally force a specific level.',
    input_schema: {
      type: 'object' as const,
      properties: {
        seller_id: { type: 'string', description: 'Unique identifier of the seller to evaluate' },
        force_level: { type: 'string', enum: ['new', 'rising', 'pro', 'top_rated', 'elite'], description: 'Manually override the auto-determined level' },
      },
      required: ['seller_id'],
    },
  },

  // ============================================================
  // TOOL 16: scan_content_safety
  // ============================================================
  {
    name: 'scan_content_safety',
    description: 'Run AI safety scan on content (image, video, text, or audio). Checks for NSFW, violence, copyright similarity, quality issues, and policy violations. Returns individual scores and an overall recommendation.',
    input_schema: {
      type: 'object' as const,
      properties: {
        content_type: { type: 'string', enum: ['image', 'video', 'text', 'audio'], description: 'Type of content to scan' },
        content_url: { type: 'string', description: 'URL of the media file (for image/video/audio)' },
        content_text: { type: 'string', description: 'Text content to scan (for text type)' },
        checks: { type: 'array', items: { type: 'string', enum: ['nsfw', 'violence', 'copyright_similarity', 'quality', 'policy_violation'] }, description: 'Which safety checks to run' },
      },
      required: ['content_type', 'checks'],
    },
  },

  // ============================================================
  // TOOL 17: generate_report
  // ============================================================
  {
    name: 'generate_report',
    description: 'Generate formatted performance reports (weekly platform summary, monthly revenue, seller performance, buyer cohort analysis, AI usage, moderation summary). Can output as JSON, PDF URL, or send via email.',
    input_schema: {
      type: 'object' as const,
      properties: {
        report_type: { type: 'string', enum: ['weekly_platform', 'monthly_revenue', 'seller_performance', 'buyer_cohort', 'ai_usage', 'moderation_summary'], description: 'Type of report to generate' },
        date_range: { type: 'string', description: 'Date range for the report (e.g., "last_7d", "last_30d", or ISO dates)' },
        format: { type: 'string', enum: ['json', 'pdf_url', 'email'], description: 'Output format' },
        recipient_email: { type: 'string', description: 'Required if format=email' },
      },
      required: ['report_type', 'date_range', 'format'],
    },
  },

  // ============================================================
  // TOOL 18: apply_commission_override
  // ============================================================
  {
    name: 'apply_commission_override',
    description: 'Apply a custom commission rate to a specific seller. DESTRUCTIVE ACTION — rates below 10%% require super_admin approval. Use for negotiated enterprise deals or promotional periods.',
    input_schema: {
      type: 'object' as const,
      properties: {
        seller_id: { type: 'string', description: 'Unique identifier of the seller' },
        commission_rate: { type: 'number', minimum: 0, maximum: 1, description: 'Commission rate as decimal (e.g., 0.12 = 12%%)' },
        reason: { type: 'string', description: 'Business justification for the override' },
        expires_at: { type: 'string', description: 'Optional expiration date (ISO 8601). Omit for permanent.' },
        approved_by_super_admin: { type: 'boolean', description: 'Confirmation that super admin has approved (required for rates < 10%%)' },
      },
      required: ['seller_id', 'commission_rate', 'reason', 'approved_by_super_admin'],
    },
  },

  // ============================================================
  // TOOL 19: flag_transaction
  // ============================================================
  {
    name: 'flag_transaction',
    description: 'Flag a suspicious transaction for fraud review. Actions: monitor (watch closely), freeze (block processing), or reverse_request (initiate chargeback reversal). Notifies finance admin by default.',
    input_schema: {
      type: 'object' as const,
      properties: {
        transaction_id: { type: 'string', description: 'Unique identifier of the transaction' },
        reason: { type: 'string', description: 'Detailed explanation of why the transaction is suspicious' },
        action: { type: 'string', enum: ['monitor', 'freeze', 'reverse_request'], description: 'Immediate action to take' },
        notify_finance_admin: { type: 'boolean', default: true, description: 'Notify finance team' },
      },
      required: ['transaction_id', 'reason', 'action'],
    },
  },

  // ============================================================
  // TOOL 20: get_platform_health
  // ============================================================
  {
    name: 'get_platform_health',
    description: 'Get real-time platform operational health metrics including API response times, error rates, queue depths, active sessions, AI generation queue status, and storage usage. Returns overall status and any active alerts.',
    input_schema: {
      type: 'object' as const,
      properties: {
        include: { type: 'array', items: { type: 'string', enum: ['api_response_times', 'error_rates', 'queue_depth', 'active_sessions', 'ai_generation_queue', 'storage_usage'] }, description: 'Specific metrics to include (omit for all)' },
      },
    },
  },
];
