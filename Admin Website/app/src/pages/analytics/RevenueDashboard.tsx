import { PageHeader } from "@/components/shared/PageHeader";
import { KPICard } from "@/components/shared/KPICard";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { DollarSign, TrendingUp, Wallet, ArrowDownCircle } from "lucide-react";

const monthlyRevenue = [
  { month: "Jan", gmv: 42000, revenue: 8400, payouts: 32000 },
  { month: "Feb", gmv: 48000, revenue: 9600, payouts: 36000 },
  { month: "Mar", gmv: 51000, revenue: 10200, payouts: 39000 },
  { month: "Apr", gmv: 62000, revenue: 12400, payouts: 47000 },
  { month: "May", gmv: 58000, revenue: 11600, payouts: 44000 },
  { month: "Jun", gmv: 74000, revenue: 14800, payouts: 56000 },
  { month: "Jul", gmv: 69000, revenue: 13800, payouts: 52000 },
  { month: "Aug", gmv: 82000, revenue: 16400, payouts: 62000 },
  { month: "Sep", gmv: 76000, revenue: 15200, payouts: 57000 },
  { month: "Oct", gmv: 91000, revenue: 18200, payouts: 69000 },
  { month: "Nov", gmv: 88000, revenue: 17600, payouts: 66000 },
  { month: "Dec", gmv: 104000, revenue: 20800, payouts: 78000 },
];

const bySource = [
  { name: "Asset Sales", value: 45, color: "#00E5FF" },
  { name: "Gig Orders", value: 30, color: "#B829F7" },
  { name: "Subscriptions", value: 15, color: "#00D4AA" },
  { name: "Credits", value: 10, color: "#FFB74D" },
];

const topSellers = [
  { name: "TechDesign Pro", gmv: 124000 },
  { name: "PixelForge Studio", gmv: 89200 },
  { name: "3DRealm", gmv: 52100 },
  { name: "AudioVerse", gmv: 38900 },
  { name: "NeonWave Assets", gmv: 45600 },
];

export default function RevenueDashboard() {
  return (
    <div className="animate-fade-in">
      <PageHeader title="Revenue Dashboard" subtitle="Platform financial performance" />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KPICard title="GMV (30d)" value="$104,000" trend={18.2} trendLabel="vs last month"
          icon={<DollarSign className="h-4 w-4" />} iconColor="text-hx-cyan" />
        <KPICard title="Net Revenue" value="$20,800" trend={18.2} trendLabel="vs last month"
          icon={<TrendingUp className="h-4 w-4" />} iconColor="text-emerald-400" />
        <KPICard title="Seller Payouts" value="$78,000" trend={18.2} trendLabel="vs last month"
          icon={<Wallet className="h-4 w-4" />} iconColor="text-hx-purple" />
        <KPICard title="Refunds" value="$1,240" trend={-5.3} trendLabel="vs last month"
          icon={<ArrowDownCircle className="h-4 w-4" />} iconColor="text-hx-red" />
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-4 lg:col-span-2">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Revenue Trend (12M)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={monthlyRevenue}>
              <defs>
                <linearGradient id="gmvGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#00E5FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="month" tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid #1E293B", borderRadius: "8px", fontSize: "12px" }} />
              <Area type="monotone" dataKey="gmv" stroke="#00E5FF" strokeWidth={2} fill="url(#gmvGrad2)" name="GMV" />
              <Area type="monotone" dataKey="revenue" stroke="#B829F7" strokeWidth={2} fill="none" name="Platform Revenue" />
              <Area type="monotone" dataKey="payouts" stroke="#00D4AA" strokeWidth={2} fill="none" name="Seller Payouts" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Revenue by Source</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={bySource} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" stroke="none">
                {bySource.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid #1E293B", borderRadius: "8px", fontSize: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1.5">
            {bySource.map((s) => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-slate-400">{s.name}</span>
                </div>
                <span className="font-mono text-slate-300">{s.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Top 5 Revenue-Generating Sellers</h3>
        <div className="space-y-2">
          {topSellers.map((seller, i) => (
            <div key={seller.name} className="flex items-center gap-3">
              <span className="w-5 text-center font-mono text-[10px] text-slate-600">#{i + 1}</span>
              <span className="flex-1 text-xs text-slate-300">{seller.name}</span>
              <div className="h-2 w-32 overflow-hidden rounded-full bg-hx-surface-hover">
                <div className="h-full rounded-full bg-gradient-to-r from-hx-cyan to-hx-purple" style={{ width: `${(seller.gmv / 124000) * 100}%` }} />
              </div>
              <span className="w-20 text-right font-mono text-xs text-slate-200">${(seller.gmv / 1000).toFixed(0)}k</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
