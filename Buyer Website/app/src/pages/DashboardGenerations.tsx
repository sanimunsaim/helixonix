import { useState } from 'react';
import { Download, RotateCcw, Bookmark } from 'lucide-react';
import { useGenerations } from '@/hooks/useGenerations';
import { cn } from '@/lib/utils';

const filters = ['All', 'Text to Image', 'Image to Video', 'Image Upscale'];

export default function DashboardGenerations() {
  const { data: generations, isLoading } = useGenerations();
  const [activeFilter, setActiveFilter] = useState('All');

  const filtered = activeFilter === 'All' ? generations : generations?.filter((g) => g.toolType === activeFilter.toLowerCase().replace(/ /g, '-'));

  return (
    <div className="min-h-screen bg-[#050815] pt-8 pb-20">
      <div className="page-gutter max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-heading font-bold text-2xl text-white">AI Generations</h1>
          <div className="flex gap-1">
            {filters.map((f) => (
              <button key={f} onClick={() => setActiveFilter(f)} className={cn('px-3 py-1.5 rounded-full text-xs font-heading font-semibold transition-all', activeFilter === f ? 'bg-[#00D4FF] text-[#050815]' : 'glass-surface text-[#8892B0]')}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-square bg-[#0A0F2E] rounded-card animate-pulse" />)}
          </div>
        ) : !filtered || filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#8892B0]">No generations yet. Start creating in the AI Studio!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((gen) => (
              <div key={gen.id} className="glass-surface rounded-card overflow-hidden group">
                <div className="relative aspect-square overflow-hidden">
                  <img src={gen.thumbnail} alt={gen.prompt} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D1233]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3 gap-2">
                    <button className="w-8 h-8 rounded-full bg-[#00D4FF] text-[#050815] flex items-center justify-center"><Download size={14} /></button>
                    <button className="w-8 h-8 rounded-full bg-white/20 backdrop-blur text-white flex items-center justify-center"><RotateCcw size={14} /></button>
                    <button className="w-8 h-8 rounded-full bg-white/20 backdrop-blur text-white flex items-center justify-center"><Bookmark size={14} /></button>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-xs text-[#8892B0] line-clamp-1">{gen.prompt}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-[#E040FB] font-mono">{gen.creditsUsed} credits</span>
                    <span className="text-[10px] text-[#8892B0]">{gen.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
