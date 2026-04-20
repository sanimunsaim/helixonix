import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useGigs } from '@/hooks/useGigs';
import GigCard from '@/components/shared/GigCard';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { cn } from '@/lib/utils';

const categories = ['All', 'Video Production', 'Branding', 'AI Automation', 'Motion Graphics', 'Storytelling', 'Photography'];

export default function Services() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const category = searchParams.get('category') || 'All';
  const ref = useScrollReveal<HTMLElement>();

  const filters: Record<string, unknown> = {};
  if (category !== 'All') filters.category = category;
  if (searchQuery) filters.q = searchQuery;

  const { data, isLoading } = useGigs(filters);

  const setCategory = (cat: string) => {
    const next = new URLSearchParams(searchParams);
    if (cat === 'All') next.delete('category'); else next.set('category', cat);
    setSearchParams(next);
  };

  return (
    <section ref={ref} className="section-reveal min-h-screen bg-[#050815] pt-8 pb-20">
      <div className="page-gutter">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-display font-black text-3xl md:text-5xl text-white mb-3">Hire World-Class Creators</h1>
          <p className="text-[#8892B0] max-w-lg mx-auto">Find the perfect creative professional for your project</p>
        </div>

        {/* Search */}
        <div className="relative max-w-2xl mx-auto mb-8">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8892B0]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Find the perfect creative service..."
            className="w-full h-14 pl-12 pr-4 bg-[#0D1233] border border-[rgba(0,212,255,0.15)] rounded-card text-white placeholder:text-[#8892B0] focus:border-[#00D4FF] focus:shadow-cyan-glow focus:outline-none transition-all"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-heading font-semibold transition-all',
                category === cat
                  ? 'bg-[#00D4FF] text-[#050815]'
                  : 'glass-surface text-white hover:border-[rgba(0,212,255,0.5)]'
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-surface rounded-card overflow-hidden animate-pulse">
                <div className="aspect-[16/10] bg-[#0A0F2E]" />
                <div className="p-4 space-y-2"><div className="h-4 bg-[#0A0F2E] rounded w-3/4" /><div className="h-3 bg-[#0A0F2E] rounded w-1/2" /></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.items.map((gig) => <GigCard key={gig.id} gig={gig} />)}
          </div>
        )}
      </div>
    </section>
  );
}
