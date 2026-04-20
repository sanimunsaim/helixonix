import { useQuery } from '@tanstack/react-query';
import { mockApi } from '@/lib/mockApi';
import { useAuthStore } from '@/stores/authStore';
import AIToolCard from '@/components/shared/AIToolCard';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Zap } from 'lucide-react';

export default function AIStudio() {
  const { data: tools } = useQuery({ queryKey: ['tools'], queryFn: () => mockApi.tools.getAll() });
  const { data: generations } = useQuery({ queryKey: ['generations'], queryFn: () => mockApi.generations.getAll() });
  const { user, isAuthenticated } = useAuthStore();
  const ref = useScrollReveal<HTMLElement>();

  return (
    <section ref={ref} className="section-reveal min-h-screen bg-[#0A0F2E] relative overflow-hidden">
      {/* BG mesh */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-[#8B2FFF] rounded-full filter blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-[#00D4FF] rounded-full filter blur-[150px]" />
      </div>

      <div className="page-gutter relative z-10 pt-8 pb-20">
        {/* Hero */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-12">
          <div>
            <h1 className="font-display font-black text-3xl md:text-5xl text-white mb-3">Create Anything. Instantly.</h1>
            <p className="text-[#8892B0] max-w-lg">Transform your ideas into stunning visuals, videos, and audio with our AI-powered creative suite.</p>
          </div>
          {isAuthenticated && user && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 glass-surface rounded-full">
                <Zap size={16} className="text-[#00D4FF]" />
                <span className="font-mono text-[#00D4FF]">{user.credits} credits</span>
              </div>
              <button className="px-4 py-2 bg-gradient-to-r from-[#00D4FF] to-[#8B2FFF] text-white text-sm font-heading font-semibold rounded-button">Get More</button>
            </div>
          )}
        </div>

        {/* Tool Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {tools?.map((tool) => (
            <AIToolCard key={tool.id} tool={tool} large />
          ))}
        </div>

        {/* Recent Generations */}
        {isAuthenticated && generations && generations.length > 0 && (
          <div>
            <h2 className="font-heading font-bold text-xl text-white mb-4">Recent Generations</h2>
            <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
              {generations.slice(0, 6).map((gen) => (
                <div key={gen.id} className="flex-shrink-0 w-40 glass-surface rounded-card overflow-hidden group cursor-pointer hover:border-[rgba(0,212,255,0.5)] transition-all">
                  <div className="aspect-square overflow-hidden">
                    <img src={gen.thumbnail} alt={gen.prompt} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="p-2">
                    <p className="text-xs text-[#8892B0] line-clamp-1">{gen.prompt}</p>
                    <p className="text-[10px] text-[#E040FB] font-mono">{gen.creditsUsed} credits</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
