type StatusVariant = "success" | "warning" | "error" | "info" | "neutral" | "purple";

const variantStyles: Record<StatusVariant, string> = {
  success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  error: "bg-hx-red/10 text-hx-red border-hx-red/20",
  info: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  neutral: "bg-hx-surface-hover text-slate-400 border-[#2D3A50]",
  purple: "bg-hx-purple/10 text-hx-purple border-hx-purple/20",
};

interface StatusBadgeProps {
  label: string;
  variant?: StatusVariant;
  dot?: boolean;
  className?: string;
}

export function StatusBadge({ label, variant = "neutral", dot = false, className = "" }: StatusBadgeProps) {
  const dotColors: Record<StatusVariant, string> = {
    success: "bg-emerald-400",
    warning: "bg-amber-400",
    error: "bg-hx-red",
    info: "bg-sky-400",
    neutral: "bg-slate-400",
    purple: "bg-hx-purple",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${variantStyles[variant]} ${className}`}>
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dotColors[variant]}`} />}
      {label}
    </span>
  );
}
