import { useQuery } from '@tanstack/react-query';
import { mockApi } from '@/lib/mockApi';
import AIToolCard from '@/components/shared/AIToolCard';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export default function AIStudioShowcaseSection() {
  const { data: tools } = useQuery({ queryKey: ['tools'], queryFn: () => mockApi.tools.getAll() });
  const ref = useScrollReveal<HTMLElement>();

  return (
    <section ref={ref} className="section-reveal py-20 bg-[#0A0F2E] relative overflow-hidden">
      {/* Background gradient mesh */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#8B2FFF] rounded-full filter blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#00D4FF] rounded-full filter blur-[120px]" />
      </div>

      <div className="page-gutter relative z-10">
        <div className="text-center mb-12">
          <h2 className="font-display font-black text-2xl md:text-4xl text-white mb-3">Generate Anything with AI</h2>
          <p className="text-[#8892B0] max-w-xl mx-auto">Transform your ideas into stunning visuals, videos, and audio with our suite of AI-powered creative tools.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tools?.map((tool, i) => (
            <div key={tool.id} style={{ transitionDelay: `${i * 50}ms` }}>
              <AIToolCard tool={tool} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
