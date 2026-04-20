import { useNavigate } from "react-router-dom";
import { KPICard } from "@/components/shared/KPICard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageHeader } from "@/components/shared/PageHeader";
import { mockAlerts, mockPlatformEvents } from "@/stores/mockData";
import {
  DollarSign, Users, FileText, AlertTriangle, Activity, Zap,
  ArrowRight, TrendingUp, ShoppingBag, UserPlus, FileCode,
  MessageSquare,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line,
} from "recharts";

const revenueData = [
  { day: "Mon", gmv: 4200, revenue: 840 },
  { day: "Tue", gmv: 5100, revenue: 1020 },
  { day: "Wed", gmv: 3800, revenue: 760 },
  { day: "Thu", gmv: 6200, revenue: 1240 },
  { day: "Fri", gmv: 7400, revenue: 1480 },
  { day: "Sat", gmv: 5600, revenue: 1120 },
  { day: "Sun", gmv: 4800, revenue: 960 },
];

const usersData = [
  { day: "Mon", buyers: 24, sellers: 5 },
  { day: "Tue", buyers: 31, sellers: 8 },
  { day: "Wed", buyers: 18, sellers: 3 },
  { day: "Thu", buyers: 42, sellers: 12 },
  { day: "Fri", buyers: 38, sellers: 9 },
  { day: "Sat", buyers: 27, sellers: 6 },
  { day: "Sun", buyers: 22, sellers: 4 },
];

const ordersData = [
  { day: "Mon", orders: 18 },
  { day: "Tue", orders: 24 },
  { day: "Wed", orders: 15 },
  { day: "Thu", orders: 32 },
  { day: "Fri", orders: 28 },
  { day: "Sat", orders: 21 },
  { day: "Sun", orders: 19 },
];

const eventIcons: Record<string, React.ReactNode> = {
  order_placed: <ShoppingBag className="h-3.5 w-3.5 text-hx-cyan" />,
  payout_requested: <DollarSign className="h-3.5 w-3.5 text-emerald-400" />,
  asset_submitted: <FileCode className="h-3.5 w-3.5 text-hx-purple" />,
  dispute_opened: <AlertTriangle className="h-3.5 w-3.5 text-hx-orange" />,
  user_registered: <UserPlus className="h-3.5 w-3.5 text-sky-400" />,
  review_posted: <MessageSquare className="h-3.5 w-3.5 text-emerald-400" />,
};

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Command Overview"
        subtitle="Real-time platform status and key metrics"
        badge="LIVE"
        badgeColor="bg-emerald-500/10 text-emerald-400 animate-pulse"
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <KPICard title="Today's GMV" value="$4,800" subtitle="vs $4,200 yesterday" trend={14.3} trendLabel="vs yesterday"
          icon={<DollarSign className="h-4 w-4" />} iconColor="text-hx-cyan" />
        <KPICard title="Today's Revenue" value="$960" subtitle="Platform fees" trend={14.3} trendLabel="vs yesterday"
          icon={<TrendingUp className="h-4 w-4" />} iconColor="text-emerald-400" />
        <KPICard title="Active Users" value="1,247" subtitle="Currently online" trend={8.2} trendLabel="vs avg"
          icon={<Users className="h-4 w-4" />} iconColor="text-sky-400" />
        <KPICard title="Pending Moderation" value="47" subtitle="Oldest: 6h" trend={-5.1} trendLabel="vs yesterday"
          icon={<FileText className="h-4 w-4" />} iconColor="text-hx-orange" onClick={() => navigate("/content")} />
        <KPICard title="Open Disputes" value="3" subtitle="1 urgent > 48h" trend={0} trendLabel="no change"
          icon={<AlertTriangle className="h-4 w-4" />} iconColor="text-hx-red" onClick={() => navigate("/disputes")} />
        <KPICard title="API Response" value="142ms" subtitle="p95: 340ms" trend={-12.3} trendLabel="improved"
          icon={<Activity className="h-4 w-4" />} iconColor="text-hx-purple" />
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Revenue (7d)</h3>
            <span className="text-[10px] text-slate-600">GMV + Platform</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="gmvGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#00E5FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="day" tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: "#111827", border: "1px solid #1E293B", borderRadius: "8px", fontSize: "12px" }}
                labelStyle={{ color: "#94A3B8" }}
              />
              <Area type="monotone" dataKey="gmv" stroke="#00E5FF" strokeWidth={2} fill="url(#gmvGrad)" name="GMV" />
              <Area type="monotone" dataKey="revenue" stroke="#B829F7" strokeWidth={2} fill="none" name="Revenue" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">New Users (7d)</h3>
            <span className="text-[10px] text-slate-600">Buyers + Sellers</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={usersData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="day" tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#111827", border: "1px solid #1E293B", borderRadius: "8px", fontSize: "12px" }}
                labelStyle={{ color: "#94A3B8" }}
              />
              <Bar dataKey="buyers" fill="#00E5FF" radius={[3, 3, 0, 0]} name="Buyers" />
              <Bar dataKey="sellers" fill="#B829F7" radius={[3, 3, 0, 0]} name="Sellers" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Order Volume (7d)</h3>
            <span className="text-[10px] text-slate-600">Total orders</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={ordersData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="day" tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#111827", border: "1px solid #1E293B", borderRadius: "8px", fontSize: "12px" }}
                labelStyle={{ color: "#94A3B8" }}
              />
              <Line type="monotone" dataKey="orders" stroke="#00D4AA" strokeWidth={2} dot={{ fill: "#00D4AA", r: 3 }} name="Orders" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-[#1E293B] bg-[#111827]">
          <div className="flex items-center justify-between border-b border-[#1E293B] px-4 py-3">
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <Zap className="h-3.5 w-3.5 text-hx-cyan" />
              HELIX-BRAIN Alerts
            </h3>
            <button onClick={() => navigate("/helix-brain")} className="flex items-center gap-1 text-[11px] text-hx-cyan hover:underline">
              View Console <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto hx-scrollbar">
            {mockAlerts.map((alert) => (
              <div key={alert.id} className={`flex items-start gap-3 border-b border-[#1E293B]/50 px-4 py-3 last:border-0 ${alert.requiresAction ? "bg-hx-cyan/5" : ""}`}>
                <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${
                  alert.severity === "critical" ? "bg-hx-red" : alert.severity === "warning" ? "bg-hx-orange" : "bg-hx-cyan"
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-hx-surface px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {alert.category}
                    </span>
                    {alert.requiresAction && <StatusBadge label="ACTION" variant="error" className="!py-0 !text-[9px]" />}
                  </div>
                  <p className="mt-1 text-xs text-slate-300">{alert.message}</p>
                  <p className="mt-0.5 text-[10px] text-slate-600">
                    {new Date(alert.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                {alert.actionLink && (
                  <button onClick={() => navigate(alert.actionLink!)} className="shrink-0 rounded p-1 text-slate-500 hover:bg-hx-surface-hover hover:text-hx-cyan">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[#1E293B] bg-[#111827]">
          <div className="flex items-center justify-between border-b border-[#1E293B] px-4 py-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Recent Activity</h3>
            <span className="text-[10px] text-slate-600">Last 20 events</span>
          </div>
          <div className="max-h-64 overflow-y-auto hx-scrollbar">
            {mockPlatformEvents.map((evt) => (
              <div key={evt.id} className="flex items-center gap-3 border-b border-[#1E293B]/50 px-4 py-2.5 last:border-0">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-hx-surface">
                  {eventIcons[evt.type] || <Activity className="h-3.5 w-3.5 text-slate-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-300 truncate">{evt.entity}</p>
                  <p className="text-[10px] text-slate-500">by {evt.user}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-500">
                    {new Date(evt.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
