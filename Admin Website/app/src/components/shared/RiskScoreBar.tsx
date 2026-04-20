interface RiskScoreBarProps {
  score: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export function RiskScoreBar({ score, showLabel = true, size = "md" }: RiskScoreBarProps) {
  const getColor = (s: number) => {
    if (s <= 25) return "from-emerald-500 to-emerald-400";
    if (s <= 50) return "from-amber-500 to-amber-400";
    if (s <= 75) return "from-orange-500 to-hx-orange";
    return "from-hx-red to-red-400";
  };

  const getTextColor = (s: number) => {
    if (s <= 25) return "text-emerald-400";
    if (s <= 50) return "text-amber-400";
    if (s <= 75) return "text-orange-400";
    return "text-hx-red";
  };

  const heightClass = size === "sm" ? "h-1.5" : size === "lg" ? "h-3" : "h-2";
  const widthClass = size === "sm" ? "w-16" : size === "lg" ? "w-48" : "w-24";

  return (
    <div className="flex items-center gap-2">
      <div className={`${widthClass} ${heightClass} overflow-hidden rounded-full bg-hx-surface-hover`}>
        <div
          className={`h-full rounded-full bg-gradient-to-r ${getColor(score)} transition-all duration-500`}
          style={{ width: `${score}%` }}
        />
      </div>
      {showLabel && (
        <span className={`text-xs font-bold tabular-nums ${getTextColor(score)}`}>
          {score}
        </span>
      )}
    </div>
  );
}
