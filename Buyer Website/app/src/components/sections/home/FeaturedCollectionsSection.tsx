import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const collections = [
  { title: 'Cinematic Futures', count: '240 assets', image: '/images/collection-cinematic.jpg', href: '/explore/cinematic' },
  { title: 'Motion Masters', count: '186 assets', image: '/images/collection-motion.jpg', href: '/explore/motion' },
  { title: 'Brand Builder Kit', count: '320 assets', image: '/images/collection-brand.jpg', href: '/explore/branding' },
];

export default function FeaturedCollectionsSection() {
  const ref = useScrollReveal<HTMLElement>();

  return (
    <section ref={ref} className="section-reveal py-20 bg-[#050815]">
      <div className="page-gutter">
        <h2 className="font-heading font-bold text-2xl md:text-3xl text-white mb-8">Featured Collections</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {collections.map((col, i) => (
            <Link
              key={col.title}
              to={col.href}
              className="group relative aspect-[16/9] rounded-card-lg overflow-hidden card-hover block"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <img src={col.image} alt={col.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050815]/90 via-[#050815]/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="font-heading font-bold text-xl text-white mb-1 group-hover:text-[#00D4FF] transition-colors">{col.title}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#8892B0]">{col.count}</span>
                  <span className="flex items-center gap-1 text-sm font-heading font-semibold text-[#00D4FF] opacity-0 group-hover:opacity-100 transition-opacity">
                    Explore <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
