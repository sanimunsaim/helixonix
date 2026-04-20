import type { LucideIcon } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { cn } from '@/lib/utils';

interface KPICardProps {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  iconColor?: string;
  subtext?: string;
  sparkline?: React.ReactNode;
  onClick?: () => void;
}

export function KPICard({
  label,
  value,
  change,
  changeLabel,
  icon: Icon,
  iconColor = '#8B2FFF',
  subtext,
  sparkline,
  onClick,
}: KPICardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <GlassCard hover={!!onClick} className={onClick ? 'cursor-pointer' : ''} onClick={onClick}>
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${iconColor}15` }}
          >
            <Icon size={18} style={{ color: iconColor }} />
          </div>
          {change !== undefined && (
            <span
              className={cn(
                'text-xs font-medium px-2 py-0.5 rounded-full',
                isPositive && 'bg-emerald-500/15 text-emerald-400',
                isNegative && 'bg-red-500/15 text-red-400',
                !isPositive && !isNegative && 'bg-white/[0.06] text-white/40'
              )}
            >
              {isPositive ? '↑' : isNegative ? '↓' : '•'} {Math.abs(change)}%
              {changeLabel && <span className="ml-1 text-[10px] opacity-70">{changeLabel}</span>}
            </span>
          )}
          {sparkline && <div>{sparkline}</div>}
        </div>

        <div>
          <p className="font-display text-2xl font-bold text-white tracking-tight">{value}</p>
          <p className="text-xs text-white/40 mt-1">{label}</p>
          {subtext && <p className="text-xs text-emerald-400 mt-0.5">{subtext}</p>}
        </div>
      </div>
    </GlassCard>
  );
}
