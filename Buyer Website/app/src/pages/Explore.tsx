import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, Grid3X3, LayoutList, X } from 'lucide-react';
import { useAssets } from '@/hooks/useAssets';
import AssetCard from '@/components/shared/AssetCard';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { cn } from '@/lib/utils';

const typeFilters = ['All', 'Templates', 'Images', 'Video', 'Audio', '3D', 'Fonts', 'Motion'];
const categoryFilters = ['All', 'Social Media', 'Photography', 'Video', 'Illustration', 'UI/UX', 'Branding', 'Typography'];
const licenseFilters = ['All', 'Free', 'Standard', 'Extended'];
const sortOptions = [
  { value: 'trending', label: 'Trending' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
];

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const ref = useScrollReveal<HTMLElement>();

  const type = searchParams.get('type') || 'All';
  const category = searchParams.get('category') || 'All';
  const license = searchParams.get('license') || 'All';
  const sort = searchParams.get('sort') || 'trending';

  const filters: Record<string, unknown> = { sort };
  if (type !== 'All') filters.type = type.toLowerCase();
  if (category !== 'All') filters.category = category;
  if (license === 'Free') filters.isFree = true;
  if (license !== 'All' && license !== 'Free') filters.license = license.toLowerCase();
  if (searchQuery) filters.q = searchQuery;

  const { data, isLoading } = useAssets(filters);

  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === 'All') next.delete(key); else next.set(key, value);
    setSearchParams(next);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
    setSearchQuery('');
  };

  const activeFilterCount = [type, category, license].filter((v) => v !== 'All').length + (searchQuery ? 1 : 0);

  const FilterGroup = ({ title, options, active, onChange }: { title: string; options: string[]; active: string; onChange: (v: string) => void }) => (
    <div className="mb-6">
      <h4 className="font-heading font-semibold text-sm text-white mb-3">{title}</h4>
      <div className="space-y-1.5">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={cn(
              'block w-full text-left px-3 py-2 rounded-button text-sm transition-colors',
              active === opt ? 'text-[#00D4FF] bg-[#00D4FF]/10' : 'text-[#8892B0] hover:text-white hover:bg-white/5'
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <section ref={ref} className="section-reveal min-h-screen bg-[#050815] pt-8">
      <div className="page-gutter">
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8892B0]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search 200K+ assets..."
            className="w-full h-14 pl-12 pr-4 bg-[#0D1233] border border-[rgba(0,212,255,0.15)] rounded-card text-white placeholder:text-[#8892B0] focus:border-[#00D4FF] focus:shadow-cyan-glow focus:outline-none transition-all"
          />
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden flex items-center gap-2 px-4 py-2 glass-surface rounded-button text-sm text-white">
              <SlidersHorizontal size={16} /> Filters {activeFilterCount > 0 && <span className="w-5 h-5 rounded-full bg-[#00D4FF] text-[#050815] text-xs flex items-center justify-center font-mono">{activeFilterCount}</span>}
            </button>
            <span className="hidden sm:block text-sm text-[#8892B0]">{data?.total || 0} results</span>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="text-sm text-[#FF1744] hover:underline flex items-center gap-1">
                <X size={14} /> Clear all
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <select
              value={sort}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="h-9 px-3 bg-[#0D1233] border border-[rgba(0,212,255,0.15)] rounded-button text-sm text-white focus:border-[#00D4FF] outline-none"
            >
              {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <button onClick={() => setViewMode('grid')} className={cn('p-2 rounded', viewMode === 'grid' ? 'text-[#00D4FF]' : 'text-[#8892B0]')}><Grid3X3 size={18} /></button>
            <button onClick={() => setViewMode('list')} className={cn('p-2 rounded', viewMode === 'list' ? 'text-[#00D4FF]' : 'text-[#8892B0]')}><LayoutList size={18} /></button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-bold text-white">Filters</h3>
                {activeFilterCount > 0 && <button onClick={clearFilters} className="text-xs text-[#FF1744] hover:underline">Clear all</button>}
              </div>
              <FilterGroup title="Type" options={typeFilters} active={type} onChange={(v) => updateFilter('type', v)} />
              <FilterGroup title="Category" options={categoryFilters} active={category} onChange={(v) => updateFilter('category', v)} />
              <FilterGroup title="License" options={licenseFilters} active={license} onChange={(v) => updateFilter('license', v)} />
            </div>
          </aside>

          {/* Mobile Sidebar */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
              <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-[#0A0F2E] border-r border-[rgba(0,212,255,0.15)] p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-heading font-bold text-white">Filters</h3>
                  <button onClick={() => setSidebarOpen(false)} className="text-white"><X size={24} /></button>
                </div>
                <FilterGroup title="Type" options={typeFilters} active={type} onChange={(v) => updateFilter('type', v)} />
                <FilterGroup title="Category" options={categoryFilters} active={category} onChange={(v) => updateFilter('category', v)} />
                <FilterGroup title="License" options={licenseFilters} active={license} onChange={(v) => updateFilter('license', v)} />
              </div>
            </div>
          )}

          {/* Results Grid */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="glass-surface rounded-card overflow-hidden animate-pulse">
                    <div className="aspect-[4/3] bg-[#0A0F2E]" />
                    <div className="p-3 space-y-2"><div className="h-4 bg-[#0A0F2E] rounded w-3/4" /><div className="h-3 bg-[#0A0F2E] rounded w-1/2" /></div>
                  </div>
                ))}
              </div>
            ) : data?.items.length === 0 ? (
              <div className="text-center py-20">
                <Search size={48} className="text-[#8892B0] mx-auto mb-4" />
                <h3 className="font-heading font-bold text-xl text-white mb-2">No assets found</h3>
                <p className="text-[#8892B0] mb-4">Try adjusting your filters or search query</p>
                <button onClick={clearFilters} className="px-6 py-2 bg-[#00D4FF] text-[#050815] rounded-button font-heading font-semibold">Clear All Filters</button>
              </div>
            ) : (
              <div className={cn('grid gap-5', viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1')}>
                {data?.items.map((asset) => (
                  <AssetCard key={asset.id} asset={asset} variant={viewMode === 'list' ? 'compact' : 'default'} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
