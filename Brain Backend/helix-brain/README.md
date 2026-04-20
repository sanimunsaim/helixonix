# HELIX-BRAIN

**Autonomous AI Operational Intelligence for HelixOnix**

HELIX-BRAIN is a fully functional, action-capable AI agent microservice that autonomously manages platform operations for the HelixOnix creative-tech SaaS marketplace. Built on Claude (Anthropic API) with function calling, it runs as a standalone Node.js service and integrates with the entire HelixOnix ecosystem via internal APIs.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    HELIX-BRAIN SERVICE                       │
│                   (Node.js 20 + TypeScript)                  │
├─────────────────────────────────────────────────────────────┤
│  Agent Core          │  brain.ts — Main orchestrator         │
│                      │  systemPrompt.ts — AI system prompt    │
│                      │  toolSchemas.ts — 20 tool definitions  │
│                      │  tools.ts — Tool implementations       │
├──────────────────────┼───────────────────────────────────────┤
│  API Layer           │  routes.ts — Fastify HTTP server       │
│                      │  POST /internal/helix-brain/command    │
├──────────────────────┼───────────────────────────────────────┤
│  Cron Jobs (BullMQ)  │  autoModeration.ts (every 5m)         │
│                      │  overdueOrders.ts (every 30m)         │
│                      │  payoutProcessing.ts (daily 2AM)      │
│                      │  fraudSweep.ts (hourly)               │
│                      │  sellerLevelEval.ts (weekly Sunday)   │
│                      │  weeklyReport.ts (weekly Monday)      │
│                      │  disputeEscalation.ts (every 2h)      │
│                      │  contentIndexing.ts (daily 5AM)       │
├──────────────────────┼───────────────────────────────────────┤
│  Event Handlers      │  orderCompleted.ts                    │
│  (Redis pub/sub)     │  userRegistered.ts                    │
│                      │  sellerOnboarding.ts                  │
│                      │  disputeOpened.ts                     │
│                      │  paymentFailed.ts                     │
│                      │  assetQuality.ts                      │
│                      │  sellerFraudSignal.ts                 │
├──────────────────────┼───────────────────────────────────────┤
│  Core Libraries      │  anthropicClient.ts — Claude SDK       │
│                      │  coreApiClient.ts — HelixOnix API      │
│                      │  redis.ts — Pub/sub + BullMQ backend  │
│                      │  bullmq.ts — Queue + scheduler         │
│                      │  audit.ts — Audit log writer           │
│                      │  logger.ts — Structured logging (pino) │
└──────────────────────┴───────────────────────────────────────┘
         │                    │                      │
         ▼                    ▼                      ▼
   ┌──────────┐      ┌──────────────┐      ┌──────────────┐
   │ Anthropic│      │  Core API    │      │    Redis     │
   │   API    │      │(HelixOnix)   │      │  (BullMQ)    │
   └──────────┘      └──────────────┘      └──────────────┘
```

---

## Quick Start

### Prerequisites

- Node.js 20+
- Redis 7+
- Anthropic API key

### Installation

```bash
cd services/helix-brain
npm install
```

### Configuration

Create `.env` from `.env.example` and configure:

```env
ANTHROPIC_API_KEY=sk-ant-your-key
CORE_API_BASE_URL=https://api.helixonix.com/v1
CORE_API_KEY=internal-service-key
REDIS_URL=redis://localhost:6379
```

### Development

```bash
npm run dev        # tsx watch mode with hot reload
```

### Production

```bash
npm run build      # Compile TypeScript
npm start          # Run compiled JS
npm run start:pm2  # Run with PM2 process manager
```

### Docker

```bash
docker build -t helix-brain .
docker run -p 3001:3001 --env-file .env helix-brain
```

---

## API Endpoints

### Admin Command

```
POST /internal/helix-brain/command
Content-Type: application/json

{
  "command": "Approve all assets with quality score > 0.8",
  "admin_id": "admin_123",
  "admin_role": "super_admin",
  "admin_name": "Alice Smith"
}
```

**Rate limit**: 20 commands per admin per hour.

**Destructive actions** (ban, refund > $500, commission override) require `confirmation: "CONFIRM"`.

### Platform Health

```
GET /internal/helix-brain/platform-health
```

### Analytics Query

```
GET /internal/helix-brain/analytics?metric=revenue&date_range=last_7d
```

---

## The 20 Tools

| # | Tool | Purpose |
|---|------|---------|
| 1 | `get_moderation_queue` | Fetch assets pending content moderation |
| 2 | `approve_asset` | Approve an asset for publication |
| 3 | `reject_asset` | Reject an asset with reason |
| 4 | `flag_asset_for_review` | Move asset to manual human review queue |
| 5 | `assess_dispute` | AI analysis of order disputes |
| 6 | `get_dispute_details` | Fetch complete dispute data |
| 7 | `suspend_user` | Suspend/restrict user accounts |
| 8 | `get_user_risk_profile` | Fraud risk assessment |
| 9 | `process_payout_batch` | Process verified payout requests |
| 10 | `verify_payout_eligibility` | Check payout approval criteria |
| 11 | `send_notification` | Send in-app/email notifications |
| 12 | `get_analytics` | Query platform metrics |
| 13 | `match_project_to_sellers` | Find best seller matches |
| 14 | `create_featured_collection` | Create curated asset collections |
| 15 | `update_seller_level` | Evaluate seller tier levels |
| 16 | `scan_content_safety` | AI safety scan on content |
| 17 | `generate_report` | Generate performance reports |
| 18 | `apply_commission_override` | Custom commission rates |
| 19 | `flag_transaction` | Flag suspicious transactions |
| 20 | `get_platform_health` | Real-time platform health metrics |

---

## Automated Cron Jobs

| Job | Schedule | Purpose |
|-----|----------|---------|
| `auto_moderation` | Every 5 min | Auto-approve/flag content based on AI scores |
| `overdue_order_monitor` | Every 30 min | Escalate overdue orders through notification pipeline |
| `payout_processing` | Daily 2:00 AM UTC | Process verified payouts up to $500 |
| `fraud_sweep` | Every hour | Scan new users and transactions for fraud |
| `seller_level_evaluation` | Weekly Sunday 3:00 AM | Evaluate and update seller tiers |
| `recommendation_refresh` | Daily 4:00 AM UTC | Recompute trending scores and feeds |
| `weekly_platform_report` | Weekly Monday 7:00 AM | Generate and email platform report |
| `dispute_escalation_monitor` | Every 2 hours | Escalate stale disputes |
| `content_quality_indexing` | Daily 5:00 AM UTC | Generate embeddings for search |

---

## Event Handlers (Redis pub/sub)

| Event | Actions |
|-------|---------|
| `order.completed` | Release escrow, credit seller, update stats, check level upgrade |
| `user.registered` | Welcome email, 10 signup credits, risk baseline, analytics |
| `seller.onboarding_complete` | Profile live email, onboarding tips (Day 1/3/7), featured section |
| `dispute.opened` | AI assessment, moderator notification, hold escrow |
| `payment.failed` | Log failure, dunning email (subscription) or cancel order, fraud check |
| `asset.quality_score_below_threshold` | Flag for manual review (no auto-reject) |
| `seller.fraud_signal_detected` | Risk assessment, auto-suspend (score 81+) or monitoring flag (61-80) |

---

## Key Design Principles

1. **No Direct Database Access** — All data operations go through the Core API
2. **Every Decision is Logged** — Full audit trail with reasoning, inputs, outputs
3. **Conservative on Destructive Actions** — Bans, refunds require human review
4. **Aggressive on Safety Violations** — NSFW, copyright, fraud get immediate action
5. **Idempotent Jobs** — Running a job twice produces the same result as once
6. **Resilient Event Handling** — One bad event never kills the listener
7. **Retry with Backoff** — All external API calls have exponential backoff
8. **AI Fallback** — If Anthropic API is down, tasks continue with rule-based logic

---

## Testing

```bash
npm test          # Run all tests
npm run test:watch # Watch mode
```

Tests use Vitest with mocked Anthropic API and Core API calls. No real actions are executed in test environment.

---

## Project Structure

```
services/helix-brain/
├── src/
│   ├── agent/
│   │   ├── brain.ts              # Main orchestrator
│   │   ├── tools.ts              # 20 tool implementations
│   │   ├── toolSchemas.ts        # Anthropic function calling schemas
│   │   └── systemPrompt.ts       # HELIX-BRAIN system prompt
│   ├── api/
│   │   └── routes.ts             # Fastify routes
│   ├── jobs/
│   │   ├── autoModeration.ts
│   │   ├── overdueOrders.ts
│   │   ├── payoutProcessing.ts
│   │   ├── fraudSweep.ts
│   │   ├── sellerLevelEval.ts
│   │   ├── weeklyReport.ts
│   │   ├── disputeEscalation.ts
│   │   ├── recommendationRefresh.ts
│   │   └── contentIndexing.ts
│   ├── events/
│   │   ├── eventRouter.ts        # Redis pub/sub dispatcher
│   │   └── handlers/
│   │       ├── orderCompleted.ts
│   │       ├── userRegistered.ts
│   │       ├── sellerOnboarding.ts
│   │       ├── disputeOpened.ts
│   │       ├── paymentFailed.ts
│   │       ├── assetQuality.ts
│   │       └── sellerFraudSignal.ts
│   ├── lib/
│   │   ├── anthropicClient.ts    # Anthropic SDK wrapper
│   │   ├── coreApiClient.ts      # Core API client (Axios)
│   │   ├── redis.ts              # Redis pub/sub + connection
│   │   ├── bullmq.ts             # BullMQ queues + workers
│   │   ├── audit.ts              # Audit log writer
│   │   └── logger.ts             # Pino structured logging
│   ├── types/
│   │   ├── tools.ts              # Tool TypeScript types
│   │   └── events.ts             # Event payload types
│   ├── __tests__/
│   │   ├── tools.test.ts         # Tool unit tests
│   │   └── brain.test.ts         # Brain orchestrator tests
│   └── index.ts                  # Main entry point
├── .env                          # Environment configuration
├── package.json
├── tsconfig.json
├── Dockerfile
├── pm2.config.js
├── vitest.config.ts
└── README.md
```

---

## License

Proprietary — HelixOnix Internal Service
