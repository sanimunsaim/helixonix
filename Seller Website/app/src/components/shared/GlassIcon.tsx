import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type GlassIconVariant = 'cyan' | 'purple' | 'magenta' | 'mixed';
export type GlassIconSize = 'sm' | 'md' | 'lg' | 'xl';

interface GlassIconProps {
  icon: LucideIcon;
  variant?: GlassIconVariant;
  size?: GlassIconSize;
  float?: boolean;
  floatDelay?: number; // seconds
  className?: string;
  label?: string;
}

const variantConfig: Record<GlassIconVariant, {
  glass: string;
  glow: string;
  iconColor: string;
  ring: string;
  gradientFrom: string;
  gradientTo: string;
}> = {
  cyan: {
    glass: 'bg-[rgba(0,212,255,0.08)] border-[rgba(0,212,255,0.25)]',
    glow: '0 0 20px rgba(0,212,255,0.35), 0 0 60px rgba(0,212,255,0.12), inset 0 1px 0 rgba(255,255,255,0.07)',
    iconColor: '#00D4FF',
    ring: 'rgba(0,212,255,0.4)',
    gradientFrom: '#00D4FF',
    gradientTo: '#0099BB',
  },
  purple: {
    glass: 'bg-[rgba(139,47,255,0.08)] border-[rgba(139,47,255,0.25)]',
    glow: '0 0 20px rgba(139,47,255,0.35), 0 0 60px rgba(139,47,255,0.12), inset 0 1px 0 rgba(255,255,255,0.07)',
    iconColor: '#9F59FF',
    ring: 'rgba(139,47,255,0.4)',
    gradientFrom: '#8B2FFF',
    gradientTo: '#6600CC',
  },
  magenta: {
    glass: 'bg-[rgba(224,64,251,0.08)] border-[rgba(224,64,251,0.25)]',
    glow: '0 0 20px rgba(224,64,251,0.35), 0 0 60px rgba(224,64,251,0.12), inset 0 1px 0 rgba(255,255,255,0.07)',
    iconColor: '#E040FB',
    ring: 'rgba(224,64,251,0.4)',
    gradientFrom: '#E040FB',
    gradientTo: '#B300CC',
  },
  mixed: {
    glass: 'bg-[rgba(0,212,255,0.05)] border-[rgba(139,47,255,0.25)]',
    glow: '0 0 20px rgba(0,212,255,0.2), 0 0 40px rgba(139,47,255,0.2), inset 0 1px 0 rgba(255,255,255,0.07)',
    iconColor: '#00D4FF',
    ring: 'rgba(139,47,255,0.35)',
    gradientFrom: '#00D4FF',
    gradientTo: '#8B2FFF',
  },
};

const sizeConfig: Record<GlassIconSize, {
  container: string;
  iconSize: number;
  radius: string;
}> = {
  sm:  { container: 'w-10 h-10', iconSize: 18, radius: '10px' },
  md:  { container: 'w-14 h-14', iconSize: 24, radius: '14px' },
  lg:  { container: 'w-18 h-18', iconSize: 32, radius: '18px' },
  xl:  { container: 'w-24 h-24', iconSize: 40, radius: '22px' },
};

export default function GlassIcon({
  icon: Icon,
  variant = 'cyan',
  size = 'md',
  float = true,
  floatDelay = 0,
  className,
  label,
}: GlassIconProps) {
  const v = variantConfig[variant];
  const s = sizeConfig[size];

  const floatStyle = float
    ? {
        animation: `hx-float 3.6s ease-in-out ${floatDelay}s infinite`,
      }
    : {};

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div
        className={cn(
          'relative flex items-center justify-center border backdrop-blur-xl',
          s.container,
          v.glass,
        )}
        style={{
          borderRadius: s.radius,
          boxShadow: v.glow,
          ...floatStyle,
        }}
      >
        {/* Inner gradient highlight */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            borderRadius: s.radius,
            background: `linear-gradient(135deg, ${v.gradientFrom}22, transparent 60%)`,
          }}
        />
        {/* Flat icon */}
        <Icon size={s.iconSize} color={v.iconColor} strokeWidth={1.8} style={{ filter: `drop-shadow(0 0 6px ${v.iconColor}99)` }} />
      </div>
      {label && (
        <span className="text-xs font-body font-medium text-[#8892B0]">{label}</span>
      )}
    </div>
  );
}
