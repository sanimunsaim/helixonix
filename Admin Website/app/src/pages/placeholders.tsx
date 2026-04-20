import { PageHeader } from "@/components/shared/PageHeader";
import { Construction } from "lucide-react";

function PlaceholderPage({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="animate-fade-in">
      <PageHeader title={title} subtitle={subtitle} />
      <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-[#1E293B] bg-[#111827]">
        <Construction className="h-8 w-8 text-slate-600 mb-3" />
        <p className="text-sm text-slate-500">This section is under development</p>
        <p className="text-xs text-slate-600 mt-1">Coming in the next release</p>
      </div>
    </div>
  );
}

export const Categories = () => <PlaceholderPage title="Category Management" subtitle="Hierarchical category editor" />;
export const Featured = () => <PlaceholderPage title="Featured Collections" subtitle="Curated collections editor" />;
export const Banners = () => <PlaceholderPage title="Marketing Banner Manager" subtitle="Manage homepage and email banners" />;
export const Reviews = () => <PlaceholderPage title="Reviews" subtitle="Platform review management" />;
export const SystemHealth = () => <PlaceholderPage title="System Health" subtitle="Live system status indicators" />;
export const AdminAccounts = () => <PlaceholderPage title="Admin Accounts" subtitle="Manage admin user accounts" />;
export const AICredits = () => <PlaceholderPage title="Credit Usage" subtitle="AI credit consumption analytics" />;
export const AICosts = () => <PlaceholderPage title="Model Costs" subtitle="Per-model cost analysis" />;
export const HelixBrainTasks = () => <PlaceholderPage title="Agent Task Log" subtitle="HELIX-BRAIN task history" />;
export const UserAnalytics = () => <PlaceholderPage title="User Analytics" subtitle="Acquisition, retention, and LTV metrics" />;
export const SellerAnalytics = () => <PlaceholderPage title="Seller Analytics" subtitle="Supply health and performance metrics" />;
export const FraudAlerts = () => <PlaceholderPage title="Fraud Alerts" subtitle="Real-time fraud monitoring" />;
