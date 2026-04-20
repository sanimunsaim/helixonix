import { useEffect, useRef, useState } from 'react';
import { Diamond, Sparkles, ShieldCheck, Zap, Users, TrendingUp } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import GlassIcon from '@/components/shared/GlassIcon';
import { type GlassIconVariant } from '@/components/shared/GlassIcon';

function AnimatedCounter({ target, suffix = '', duration = 1500, isDecimal = false }: { target: number; suffix?: string; duration?: number; isDecimal?: boolean }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started) {
        setStarted(true);
        const startTime = Date.now();
        const tick = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.floor(eased * target));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration, started]);

  if (isDecimal) return <span ref={ref}>{target}{suffix}</span>;
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

const stats = [
  { value: 50000, suffix: '+', label: 'Active Creators', icon: Users },
  { value: 6000,  suffix: '+', label: 'Projects Delivered', icon: TrendingUp },
  { value: 4.9,   suffix: '/5', label: 'Client Rating', isDecimal: true, icon: Zap },
];

const pillars: { icon: typeof Diamond; variant: GlassIconVariant; title: string; desc: string; delay: number }[] = [
  {
    icon: Diamond,
    variant: 'cyan',
    title: 'Premium Quality',
    desc: 'Every asset is hand-reviewed for professional-grade quality and usability across all creative disciplines.',
    delay: 0,
  },
  {
    icon: Sparkles,
    variant: 'mixed',
    title: 'AI-Powered Studio',
    desc: 'Generate custom visuals, audio, and video with our cutting-edge AI studio built for modern creatives.',
    delay: 0.5,
  },
  {
    icon: ShieldCheck,
    variant: 'purple',
    title: 'Buyer Protected',
    desc: 'Secure payments, verified sellers, and satisfaction guaranteed on every purchase — no exceptions.',
    delay: 1,
  },
];

export default function WhyHelixonixSection() {
  const ref = useScrollReveal<HTMLElement>();

  return (
    <section ref={ref} className="section-reveal py-24 bg-[#050815] relative overflow-hidden">
      {/* Ambient glow blobs */}
      <div
        className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(0,212,255,0.06) 0%, transparent 70%)' }}
      />
      <div
        className="absolute top-1/2 right-0 -translate-y-1/2 w-[500px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(139,47,255,0.07) 0%, transparent 70%)' }}
      />

      <div className="page-gutter relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-xs font-body font-semibold tracking-[0.3em] text-[#00D4FF] uppercase mb-3">Why HelixOnix</p>
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-white">
            Built for Creators Who Demand More
          </h2>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-20">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="relative flex flex-col items-center text-center p-6 rounded-xl border border-[rgba(0,212,255,0.1)] backdrop-blur-sm"
              style={{ background: 'rgba(13,18,51,0.5)', boxShadow: '0 4px 24px rgba(0,212,255,0.06)' }}
            >
              <GlassIcon icon={stat.icon} variant={i === 0 ? 'cyan' : i === 1 ? 'mixed' : 'purple'} size="sm" float floatDelay={i * 0.4} className="mb-3" />
              <div className="font-heading font-black text-4xl md:text-5xl text-[#00D4FF] mb-1 tabular-nums">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} isDecimal={stat.isDecimal} />
              </div>
              <p className="text-[#8892B0] font-body font-medium text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Feature Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pillars.map((pillar) => (
            <div
              key={pillar.title}
              className="group relative flex flex-col items-center text-center p-8 rounded-2xl border transition-all duration-300 cursor-default"
              style={{
                background: 'rgba(13,18,51,0.55)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderColor: 'rgba(0,212,255,0.12)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(0,212,255,0.35)';
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 40px rgba(0,212,255,0.12)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(0,212,255,0.12)';
                (e.currentTarget as HTMLDivElement).style.transform = '';
                (e.currentTarget as HTMLDivElement).style.boxShadow = '';
              }}
            >
              {/* Gradient corner accent */}
              <div
                className="absolute top-0 left-0 w-24 h-24 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: 'radial-gradient(ellipse at top left, rgba(0,212,255,0.08), transparent 70%)' }}
              />

              <GlassIcon
                icon={pillar.icon}
                variant={pillar.variant}
                size="lg"
                float
                floatDelay={pillar.delay}
                className="mb-6"
              />
              <h3 className="font-heading font-bold text-xl text-white mb-3">{pillar.title}</h3>
              <p className="text-sm font-body text-[#8892B0] leading-relaxed">{pillar.desc}</p>
            </div>
          ))}
        </div>

        {/* Trusted by */}
        <div className="mt-20 pt-8 border-t border-[rgba(0,212,255,0.08)]">
          <p className="text-center text-xs font-body text-[#8892B0] mb-8 uppercase tracking-[0.25em]">
            Trusted by leading brands
          </p>
          <div className="flex items-center justify-center gap-8 md:gap-16 opacity-35 hover:opacity-50 transition-opacity">
            {['Adobe', 'Figma', 'Spotify', 'Netflix', 'Stripe'].map((brand) => (
              <span key={brand} className="text-base font-heading font-bold text-white tracking-widest uppercase cursor-default hover:opacity-100 transition-opacity">
                {brand}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
