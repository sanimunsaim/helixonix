import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useRoleStore } from "@/stores/roleStore";
import { useUIStore } from "@/stores/uiStore";
import type { AdminRole } from "@/types/admin";
import {
  LayoutDashboard, Users, FileText, AlertTriangle,
  CreditCard, Brain, BarChart3, Settings, ChevronRight, ChevronLeft,
  Shield, Activity, UserCog, FolderOpen, Layers, Image, Package,
  Wallet, Receipt, Percent, Cpu, Zap, ScrollText, Flag,
  Command, type LucideIcon,
} from "lucide-react";

interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  roles: AdminRole[];
  badge?: number;
  children?: NavItem[];
}

const navSections: { title: string; items: NavItem[] }[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", path: "/", icon: LayoutDashboard, roles: ["moderator", "manager", "finance_admin", "super_admin"] },
      { label: "System Health", path: "/system-health", icon: Activity, roles: ["super_admin"] },
    ],
  },
  {
    title: "Users",
    items: [
      { label: "All Buyers", path: "/users", icon: Users, roles: ["moderator", "manager", "super_admin"] },
      { label: "All Sellers", path: "/sellers", icon: UserCog, roles: ["moderator", "manager", "super_admin"] },
      { label: "Admin Accounts", path: "/admins", icon: Shield, roles: ["super_admin"] },
    ],
  },
  {
    title: "Content",
    items: [
      { label: "Moderation Queue", path: "/content", icon: FileText, roles: ["moderator", "manager", "super_admin"], badge: 47 },
      { label: "All Assets", path: "/content/all-assets", icon: FolderOpen, roles: ["moderator", "manager", "super_admin"] },
      { label: "Categories", path: "/categories", icon: Layers, roles: ["manager", "super_admin"] },
      { label: "Featured Collections", path: "/featured", icon: Image, roles: ["manager", "super_admin"] },
      { label: "Banners", path: "/banners", icon: Flag, roles: ["manager", "super_admin"] },
    ],
  },
  {
    title: "Marketplace",
    items: [
      { label: "All Orders", path: "/orders", icon: Package, roles: ["moderator", "manager", "finance_admin", "super_admin"] },
      { label: "Disputes", path: "/disputes", icon: AlertTriangle, roles: ["moderator", "manager", "super_admin"], badge: 3 },
      { label: "Reviews", path: "/reviews", icon: ScrollText, roles: ["moderator", "manager", "super_admin"] },
    ],
  },
  {
    title: "Finance",
    items: [
      { label: "Transaction Ledger", path: "/finance/transactions", icon: Receipt, roles: ["finance_admin", "super_admin"] },
      { label: "Payout Queue", path: "/finance/payouts", icon: Wallet, roles: ["finance_admin", "super_admin"], badge: 5 },
      { label: "Commission Rules", path: "/finance/commissions", icon: Percent, roles: ["finance_admin", "super_admin"] },
      { label: "Fraud Alerts", path: "/finance/fraud", icon: Shield, roles: ["finance_admin", "super_admin"], badge: 2 },
    ],
  },
  {
    title: "AI Platform",
    items: [
      { label: "AI Tool Config", path: "/ai-tools", icon: Cpu, roles: ["super_admin"] },
      { label: "Credit Usage", path: "/ai-tools/credits", icon: CreditCard, roles: ["super_admin"] },
      { label: "Model Costs", path: "/ai-tools/costs", icon: BarChart3, roles: ["super_admin"] },
    ],
  },
  {
    title: "Intelligence",
    items: [
      { label: "HELIX-BRAIN Console", path: "/helix-brain", icon: Brain, roles: ["super_admin"] },
      { label: "Automation Rules", path: "/automation-rules", icon: Zap, roles: ["super_admin"] },
      { label: "Agent Task Log", path: "/helix-brain/tasks", icon: ScrollText, roles: ["super_admin"] },
    ],
  },
  {
    title: "Analytics",
    items: [
      { label: "Revenue Dashboard", path: "/analytics/revenue", icon: BarChart3, roles: ["manager", "finance_admin", "super_admin"] },
      { label: "User Analytics", path: "/analytics/users", icon: Users, roles: ["manager", "super_admin"] },
      { label: "Seller Performance", path: "/analytics/sellers", icon: UserCog, roles: ["manager", "super_admin"] },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Platform Settings", path: "/settings", icon: Settings, roles: ["super_admin"] },
      { label: "API Manager", path: "/settings/api", icon: Cpu, roles: ["super_admin"] },
      { label: "Feature Flags", path: "/settings/features", icon: Flag, roles: ["super_admin"] },
      { label: "Security Center", path: "/security", icon: Shield, roles: ["super_admin"] },
      { label: "Audit Log", path: "/audit-log", icon: ScrollText, roles: ["super_admin"] },
    ],
  },
];

export function AdminSidebar() {
  const currentRole = useRoleStore((s) => s.currentRole);
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["Overview", "Users", "Content", "Marketplace", "Finance", "AI Platform", "Intelligence", "Analytics", "System"]));

  const toggleSection = (title: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  };

  const visibleNavSections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => item.roles.includes(currentRole)),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-[#1E293B] bg-[#080C18] transition-all duration-200 ${
        collapsed ? "w-14" : "w-60"
      }`}
    >
      <div className="flex h-14 items-center justify-between border-b border-[#1E293B] px-3">
        {!collapsed && (
          <NavLink to="/" className="flex items-center gap-2.5">
            <img src="/assets/logo-dark.png" alt="HelixOnix" className="h-7 w-auto" />
            <div className="flex flex-col">
              <span className="text-xs font-bold tracking-wider text-hx-cyan">HELIXONIX</span>
              <span className="text-[9px] uppercase tracking-widest text-slate-500">Command Center</span>
            </div>
          </NavLink>
        )}
        {collapsed && <img src="/assets/logo-dark.png" alt="" className="mx-auto h-7 w-auto" />}
        <button
          onClick={toggleSidebar}
          className="rounded p-1 text-slate-500 hover:bg-hx-surface-hover hover:text-slate-300"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto hx-scrollbar py-2">
        {visibleNavSections.map((section) => (
          <div key={section.title} className="mb-1">
            {!collapsed && (
              <button
                onClick={() => toggleSection(section.title)}
                className="flex w-full items-center px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600 hover:text-slate-400"
              >
                <span className="flex-1 text-left">{section.title}</span>
                <ChevronRight
                  className={`h-3 w-3 transition-transform ${
                    expandedSections.has(section.title) ? "rotate-90" : ""
                  }`}
                />
              </button>
            )}
            {expandedSections.has(section.title) &&
              section.items.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`group relative mx-1 flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-all ${
                      isActive
                        ? "bg-hx-cyan/10 text-hx-cyan"
                        : "text-slate-400 hover:bg-hx-surface-hover hover:text-slate-200"
                    } ${collapsed ? "justify-center" : ""}`}
                    title={collapsed ? item.label : undefined}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r bg-hx-cyan" />
                    )}
                    <Icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span className="truncate text-xs">{item.label}</span>}
                    {!collapsed && item.badge !== undefined && (
                      <span className={`ml-auto flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                        item.badge > 0 ? "bg-hx-red/20 text-hx-red" : "bg-hx-surface-hover text-slate-500"
                      }`}>
                        {item.badge}
                      </span>
                    )}
                    {collapsed && item.badge !== undefined && item.badge > 0 && (
                      <span className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-hx-red" />
                    )}
                  </NavLink>
                );
              })}
          </div>
        ))}
      </div>

      <div className="border-t border-[#1E293B] p-2">
        <button
          onClick={() => useUIStore.getState().setCommandSearchOpen(true)}
          className={`flex w-full items-center gap-2 rounded-md border border-[#1E293B] bg-hx-surface px-2.5 py-1.5 text-xs text-slate-500 hover:border-hx-cyan/30 hover:text-slate-300 transition-colors ${collapsed ? "justify-center" : ""}`}
        >
          <Command className="h-3.5 w-3.5" />
          {!collapsed && (
            <>
              <span className="flex-1 text-left">Search...</span>
              <kbd className="rounded bg-hx-surface-elevated px-1.5 py-0.5 text-[10px] font-mono text-slate-600">⌘K</kbd>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
