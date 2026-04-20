import type { ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  trendLabel?: string;
  icon: ReactNode;
  iconColor?: string;
  onClick?: () => void;
}

export function KPICard({ title, value, subtitle, trend, trendLabel, icon, iconColor = "text-hx-cyan", onClick }: KPICardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-xl border border-[#1E293B] bg-[#111827] p-4 transition-all hover:border-[#2D3A50] ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">{title}</p>
          <p className="mt-1.5 text-2xl font-bold tracking-tight text-slate-100">{value}</p>
          {subtitle && <p className="mt-0.5 text-[11px] text-slate-500">{subtitle}</p>}
          {trend !== undefined && (
            <div className={`mt-2 flex items-center gap-1 text-xs font-medium ${trend >= 0 ? "text-emerald-400" : "text-hx-red"}`}>
              {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              <span>{trend >= 0 ? "+" : ""}{trend}%</span>
              {trendLabel && <span className="text-slate-500 font-normal">{trendLabel}</span>}
            </div>
          )}
        </div>
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-hx-surface ${iconColor}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
