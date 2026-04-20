export type AdminRole = "super_admin" | "finance_admin" | "manager" | "moderator";

export type UserStatus = "active" | "suspended" | "banned" | "pending";
export type UserPlan = "free" | "creator" | "pro" | "studio";
export type SellerLevel = "new" | "bronze" | "silver" | "gold" | "platinum";
export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";

export type AssetStatus = "pending" | "approved" | "rejected" | "suspended" | "featured";
export type AssetType = "template" | "stock" | "audio" | "video" | "3d";

export type OrderStatus = "pending" | "in_progress" | "delivered" | "completed" | "cancelled" | "disputed";
export type EscrowStatus = "held" | "released" | "refunded" | "pending";

export type DisputeStatus = "open" | "urgent" | "resolved" | "escalated";
export type DisputeResolution = "full_refund" | "partial_refund" | "seller_wins" | "mutual";

export type TransactionType = "payment" | "payout" | "refund" | "credit_purchase" | "subscription";
export type TransactionStatus = "completed" | "pending" | "failed" | "processing";

export type PayoutStatus = "pending" | "approved" | "processing" | "completed" | "rejected";

export type AIToolStatus = "enabled" | "disabled";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "buyer" | "seller";
  plan: UserPlan;
  status: UserStatus;
  joinDate: string;
  country: string;
  totalSpent: number;
  orders: number;
  riskScore: number;
  lastLogin: string;
  bio?: string;
  deviceCount: number;
  loginHistory: LoginEvent[];
  subscriptionHistory: SubscriptionEvent[];
  downloadHistory: DownloadEvent[];
  aiGenerationHistory: AIGenerationEvent[];
}

export interface LoginEvent {
  id: string;
  ip: string;
  device: string;
  location: string;
  timestamp: string;
}

export interface SubscriptionEvent {
  id: string;
  plan: UserPlan;
  startDate: string;
  endDate: string;
  amount: number;
  status: "active" | "cancelled" | "expired";
}

export interface DownloadEvent {
  id: string;
  assetName: string;
  date: string;
}

export interface AIGenerationEvent {
  id: string;
  tool: string;
  creditsUsed: number;
  date: string;
  status: "success" | "failed";
}

export interface Seller {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  level: SellerLevel;
  plan: UserPlan;
  verification: VerificationStatus;
  assets: number;
  gigs: number;
  totalRevenue: number;
  monthlyRevenue: number;
  pendingClearance: number;
  rating: number;
  status: UserStatus;
  joinDate: string;
  country: string;
  commissionOverride?: number;
  fraudSignals?: string[];
}

export interface Asset {
  id: string;
  title: string;
  seller: string;
  sellerId: string;
  type: AssetType;
  category: string;
  status: AssetStatus;
  downloads: number;
  revenue: number;
  date: string;
  thumbnail: string;
  nsfwScore: number;
  copyrightScore: number;
  qualityScore: number;
  aiDecision: "auto_approve" | "manual_review" | "auto_reject";
  price: number;
  license: string;
  description: string;
  tags: string[];
}

export interface Order {
  id: string;
  orderNumber: string;
  buyer: string;
  buyerId: string;
  seller: string;
  sellerId: string;
  gig: string;
  amount: number;
  fee: number;
  net: number;
  status: OrderStatus;
  escrowStatus: EscrowStatus;
  date: string;
  deadline: string;
  messages: OrderMessage[];
  files: OrderFile[];
  timeline: OrderTimelineEvent[];
}

export interface OrderMessage {
  id: string;
  sender: string;
  senderRole: "buyer" | "seller";
  content: string;
  timestamp: string;
}

export interface OrderFile {
  id: string;
  name: string;
  size: string;
  url: string;
  uploadedBy: string;
  timestamp: string;
}

export interface OrderTimelineEvent {
  id: string;
  event: string;
  timestamp: string;
  actor: string;
}

export interface Dispute {
  id: string;
  orderId: string;
  orderNumber: string;
  openedBy: string;
  openedByRole: "buyer" | "seller";
  against: string;
  reason: string;
  aiRecommendation: string;
  aiConfidence: number;
  aiReasoning: string;
  status: DisputeStatus;
  age: string;
  buyerEvidence: Evidence[];
  sellerEvidence: Evidence[];
  timeline: DisputeTimelineEvent[];
  assignedTo?: string;
  resolution?: DisputeResolution;
  resolutionAmount?: number;
  resolutionMessage?: string;
}

export interface Evidence {
  id: string;
  reason: string;
  files: string[];
  timestamps: string[];
  messageExcerpts: string[];
}

export interface DisputeTimelineEvent {
  id: string;
  event: string;
  timestamp: string;
  actor: string;
}

export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  user: string;
  userId: string;
  amount: number;
  fee: number;
  net: number;
  status: TransactionStatus;
  reference: string;
}

export interface Payout {
  id: string;
  requestNumber: string;
  seller: string;
  sellerId: string;
  amount: number;
  method: string;
  requested: string;
  daysWaiting: number;
  status: PayoutStatus;
  verification: {
    noActiveDisputes: boolean;
    fundsCleared: boolean;
    accountVerified: boolean;
    taxInfoComplete: boolean;
  };
}

export interface CommissionRule {
  tier: string;
  commissionPercent: number;
  revenueShare: string;
  notes: string;
}

export interface AITool {
  id: string;
  name: string;
  status: AIToolStatus;
  modelVersion: string;
  creditCost: number;
  apiCost: number;
  successRate: number;
  avgTime: number;
  todayUsage: number;
  concurrentLimit: number;
  safetyFilter: number;
  blocklist: string[];
  outputModeration: boolean;
}

export interface HelixBrainTask {
  id: string;
  timestamp: string;
  category: string;
  action: string;
  result: string;
  status: "success" | "pending" | "overridden";
  reasoning?: string;
  dataInputs?: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  triggerType: "event" | "schedule" | "threshold";
  triggerDetail: string;
  conditions: RuleCondition[];
  actions: RuleAction[];
  lastRun: string;
  totalRuns: number;
  status: "active" | "paused";
}

export interface RuleCondition {
  field: string;
  operator: string;
  value: string;
}

export interface RuleAction {
  type: string;
  target: string;
  value: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  admin: string;
  adminRole: AdminRole;
  action: string;
  entity: string;
  entityId: string;
  before?: string;
  after?: string;
  ip: string;
  status: "success" | "failed";
}

export interface PlatformEvent {
  id: string;
  timestamp: string;
  type: "order_placed" | "payout_requested" | "asset_submitted" | "dispute_opened" | "user_registered" | "review_posted";
  entity: string;
  entityId: string;
  user: string;
  userId: string;
}

export interface AlertItem {
  id: string;
  timestamp: string;
  severity: "critical" | "warning" | "info";
  category: string;
  message: string;
  requiresAction: boolean;
  actionLink?: string;
}

export interface SecuritySession {
  id: string;
  admin: string;
  role: AdminRole;
  device: string;
  ip: string;
  location: string;
  loginTime: string;
  lastActive: string;
}

export interface LoginAttempt {
  id: string;
  ip: string;
  username: string;
  timestamp: string;
  status: "failed" | "blocked";
  count: number;
  blocked: boolean;
}

export interface FraudAlert {
  id: string;
  user: string;
  userId: string;
  type: string;
  score: number;
  source: string;
  timestamp: string;
  status: "open" | "investigating" | "resolved";
}
