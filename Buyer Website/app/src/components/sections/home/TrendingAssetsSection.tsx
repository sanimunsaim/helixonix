import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useTrendingAssets } from '@/hooks/useAssets';
import AssetCard from '@/components/shared/AssetCard';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { cn } from '@/lib/utils';

export default function TrendingAssetsSection() {
  const { data: assets, isLoading } = useTrendingAssets();
  const ref = useScrollReveal<HTMLElement>();

  return (
    <section ref={ref} className="section-reveal py-20 bg-[#050815]">
      <div className="page-gutter">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-white">Trending Now</h2>
          <Link to="/explore" className="flex items-center gap-1 text-sm font-heading font-semibold text-[#00D4FF] hover:underline underline-offset-4">
            View All Trending <ArrowRight size={16} />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="glass-surface rounded-card overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-[#0A0F2E]" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-[#0A0F2E] rounded w-3/4" />
                  <div className="h-3 bg-[#0A0F2E] rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {assets?.slice(0, 8).map((asset, i) => (
              <div key={asset.id} style={{ transitionDelay: `${i * 50}ms` }} className={cn('section-reveal', i < 4 && 'revealed')}>
                <AssetCard asset={asset} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
