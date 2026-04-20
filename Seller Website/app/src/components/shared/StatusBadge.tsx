import { cn } from '@/lib/utils';

const statusStyles: Record<string, { bg: string; text: string }> = {
  published: { bg: 'rgba(0,212,255,0.15)', text: '#00D4FF' },
  active: { bg: 'rgba(0,212,255,0.15)', text: '#00D4FF' },
  completed: { bg: 'rgba(16,185,129,0.15)', text: '#10B981' },
  cleared: { bg: 'rgba(16,185,129,0.15)', text: '#10B981' },
  paid: { bg: 'rgba(16,185,129,0.15)', text: '#10B981' },
  pending: { bg: 'rgba(245,158,11,0.15)', text: '#F59E0B' },
  processing: { bg: 'rgba(59,130,246,0.15)', text: '#3B82F6' },
  rejected: { bg: 'rgba(239,68,68,0.15)', text: '#EF4444' },
  disputed: { bg: 'rgba(239,68,68,0.15)', text: '#EF4444' },
  failed: { bg: 'rgba(239,68,68,0.15)', text: '#EF4444' },
  draft: { bg: 'rgba(255,255,255,0.06)', text: 'rgba(255,255,255,0.5)' },
  paused: { bg: 'rgba(255,255,255,0.06)', text: 'rgba(255,255,255,0.5)' },
  suspended: { bg: 'rgba(239,68,68,0.15)', text: '#EF4444' },
  delivered: { bg: 'rgba(59,130,246,0.15)', text: '#3B82F6' },
  cancelled: { bg: 'rgba(255,255,255,0.06)', text: 'rgba(255,255,255,0.4)' },
  standard: { bg: 'rgba(0,212,255,0.15)', text: '#00D4FF' },
  premium: { bg: 'rgba(224,64,251,0.15)', text: '#E040FB' },
  basic: { bg: 'rgba(255,255,255,0.06)', text: 'rgba(255,255,255,0.5)' },
};

interface StatusBadgeProps {
  status: string;
  className?: string;
  dot?: boolean;
}

export function StatusBadge({ status, className, dot = false }: StatusBadgeProps) {
  const style = statusStyles[status.toLowerCase()] || statusStyles.draft;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full text-xs font-medium',
        !dot && 'px-2.5 py-0.5',
        dot && 'gap-1.5',
        className
      )}
      style={{ backgroundColor: dot ? 'transparent' : style.bg, color: style.text }}
    >
      {dot && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: style.text }} />}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
