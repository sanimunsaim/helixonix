import { Routes, Route } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import Dashboard from "@/pages/Dashboard";
import UserList from "@/pages/users/UserList";
import UserDetail from "@/pages/users/UserDetail";
import SellerList from "@/pages/sellers/SellerList";
import SellerDetail from "@/pages/sellers/SellerDetail";
import ModerationQueue from "@/pages/content/ModerationQueue";
import AllAssets from "@/pages/content/AllAssets";
import OrderList from "@/pages/orders/OrderList";
import OrderDetail from "@/pages/orders/OrderDetail";
import DisputeList from "@/pages/disputes/DisputeList";
import DisputeDetail from "@/pages/disputes/DisputeDetail";
import Transactions from "@/pages/finance/Transactions";
import Payouts from "@/pages/finance/Payouts";
import Commissions from "@/pages/finance/Commissions";
import AITools from "@/pages/ai/AITools";
import HelixBrain from "@/pages/helixbrain/HelixBrain";
import AutomationRules from "@/pages/automation/AutomationRules";
import RevenueDashboard from "@/pages/analytics/RevenueDashboard";
import Settings from "@/pages/system/Settings";
import ApiManager from "@/pages/settings/ApiManager";
import Security from "@/pages/system/Security";
import AuditLog from "@/pages/system/AuditLog";
import {
  Categories, Featured, Banners, Reviews, SystemHealth, AdminAccounts,
  AICredits, AICosts, HelixBrainTasks, UserAnalytics, SellerAnalytics, FraudAlerts,
} from "@/pages/placeholders";

export default function App() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/system-health" element={<SystemHealth />} />

        <Route path="/users" element={<UserList />} />
        <Route path="/users/:id" element={<UserDetail />} />
        <Route path="/sellers" element={<SellerList />} />
        <Route path="/sellers/:id" element={<SellerDetail />} />
        <Route path="/admins" element={<AdminAccounts />} />

        <Route path="/content" element={<ModerationQueue />} />
        <Route path="/content/all-assets" element={<AllAssets />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/featured" element={<Featured />} />
        <Route path="/banners" element={<Banners />} />

        <Route path="/orders" element={<OrderList />} />
        <Route path="/orders/:id" element={<OrderDetail />} />
        <Route path="/disputes" element={<DisputeList />} />
        <Route path="/disputes/:id" element={<DisputeDetail />} />
        <Route path="/reviews" element={<Reviews />} />

        <Route path="/finance/transactions" element={<Transactions />} />
        <Route path="/finance/payouts" element={<Payouts />} />
        <Route path="/finance/commissions" element={<Commissions />} />
        <Route path="/finance/fraud" element={<FraudAlerts />} />

        <Route path="/ai-tools" element={<AITools />} />
        <Route path="/ai-tools/credits" element={<AICredits />} />
        <Route path="/ai-tools/costs" element={<AICosts />} />

        <Route path="/helix-brain" element={<HelixBrain />} />
        <Route path="/helix-brain/tasks" element={<HelixBrainTasks />} />
        <Route path="/automation-rules" element={<AutomationRules />} />

        <Route path="/analytics/revenue" element={<RevenueDashboard />} />
        <Route path="/analytics/users" element={<UserAnalytics />} />
        <Route path="/analytics/sellers" element={<SellerAnalytics />} />

        <Route path="/settings" element={<Settings />} />
        <Route path="/settings/api" element={<ApiManager />} />
        <Route path="/settings/features" element={<Settings />} />
        <Route path="/security" element={<Security />} />
        <Route path="/audit-log" element={<AuditLog />} />
      </Route>
    </Routes>
  );
}
