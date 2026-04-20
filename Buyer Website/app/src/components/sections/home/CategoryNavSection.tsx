import { Link } from 'react-router-dom';
import { LayoutGrid, Image, Video, Music, Sparkles, Type, Box, Clapperboard } from 'lucide-react';

const categories = [
  { icon: LayoutGrid, label: 'Templates', count: '45K', href: '/explore/templates' },
  { icon: Image, label: 'Stock Images', count: '82K', href: '/explore/images' },
  { icon: Video, label: 'Stock Video', count: '23K', href: '/explore/video' },
  { icon: Music, label: 'Stock Audio', count: '18K', href: '/explore/audio' },
  { icon: Sparkles, label: 'AI-Generated', count: '12K', href: '/explore/ai' },
  { icon: Type, label: 'Fonts', count: '8K', href: '/explore/fonts' },
  { icon: Box, label: '3D Assets', count: '6K', href: '/explore/3d' },
  { icon: Clapperboard, label: 'Motion Presets', count: '15K', href: '/explore/motion' },
];

export default function CategoryNavSection() {
  return (
    <section className="relative z-10 py-6 bg-[#050815]/80 backdrop-blur-sm border-y border-[rgba(0,212,255,0.1)]">
      <div className="page-gutter">
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1 snap-x">
          {categories.map((cat) => (
            <Link
              key={cat.label}
              to={cat.href}
              className="flex-shrink-0 flex items-center gap-2.5 px-5 py-3 glass-surface rounded-full hover:border-[rgba(0,212,255,0.5)] hover:shadow-cyan-glow transition-all group snap-start"
            >
              <cat.icon size={18} className="text-[#00D4FF] group-hover:scale-110 transition-transform" />
              <span className="text-sm font-heading font-semibold text-white whitespace-nowrap">{cat.label}</span>
              <span className="text-xs font-mono text-[#8892B0] bg-[#0D1233] px-1.5 py-0.5 rounded-full">{cat.count}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
