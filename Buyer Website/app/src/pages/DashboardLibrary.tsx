import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Download, FileText } from 'lucide-react';
import { useAssets } from '@/hooks/useAssets';
import AssetCard from '@/components/shared/AssetCard';

export default function DashboardLibrary() {
  const [search, setSearch] = useState('');
  const { data: assets, isLoading } = useAssets({ sort: 'trending', limit: 12 });

  const filtered = assets?.items.filter((a) => a.title.toLowerCase().includes(search.toLowerCase())) || [];

  return (
    <div className="min-h-screen bg-[#050815] pt-8 pb-20">
      <div className="page-gutter max-w-6xl mx-auto">
        <h1 className="font-heading font-bold text-2xl text-white mb-6">My Library</h1>

        <div className="relative mb-6">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8892B0]" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your library..."
            className="w-full h-12 pl-11 pr-4 bg-[#0D1233] border border-[rgba(0,212,255,0.15)] rounded-card text-white placeholder:text-[#8892B0] focus:border-[#00D4FF] outline-none"
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-[4/3] bg-[#0A0F2E] rounded-card animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <FileText size={48} className="text-[#8892B0] mx-auto mb-4" />
            <p className="text-white mb-2">Your library is empty</p>
            <p className="text-sm text-[#8892B0] mb-4">Start exploring and downloading assets</p>
            <Link to="/explore" className="px-6 py-2 bg-[#00D4FF] text-[#050815] rounded-button font-heading font-semibold">Browse Assets</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((asset) => (
              <div key={asset.id} className="relative group">
                <AssetCard asset={asset} variant="compact" />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="w-8 h-8 rounded-full bg-[#00D4FF] text-[#050815] flex items-center justify-center">
                    <Download size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
