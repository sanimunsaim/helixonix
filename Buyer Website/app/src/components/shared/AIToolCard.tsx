import { Link } from 'react-router-dom';
import { Sparkles, Clapperboard, ImagePlus, Film, Video, Music, AudioLines, Maximize2 } from 'lucide-react';
import type { AITool } from '@/types';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ElementType> = {
  Sparkles, Clapperboard, ImagePlus, Film, Video, Music, AudioLines, Maximize2,
};

interface AIToolCardProps {
  tool: AITool;
  large?: boolean;
  className?: string;
}

export default function AIToolCard({ tool, large = false, className }: AIToolCardProps) {
  const Icon = iconMap[tool.icon] || Sparkles;

  return (
    <Link
      to={`/ai-studio/${tool.id}`}
      className={cn(
        'card-hover glass-surface rounded-card overflow-hidden group block',
        large ? 'p-6' : 'p-4',
        className
      )}
    >
      <div
        className={cn(
          'rounded-full flex items-center justify-center mb-3',
          large ? 'w-12 h-12' : 'w-10 h-10'
        )}
        style={{ background: `linear-gradient(135deg, ${tool.gradientColors[0]}33, ${tool.gradientColors[1]}33)` }}
      >
        <Icon size={large ? 24 : 18} style={{ color: tool.gradientColors[0] }} />
      </div>
      <h3 className={cn('font-heading font-semibold text-white group-hover:text-[#00D4FF] transition-colors', large ? 'text-lg mb-1' : 'text-sm')}>{tool.name}</h3>
      {large && <p className="text-sm text-[#8892B0] line-clamp-2 mb-3">{tool.description}</p>}
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs font-mono text-[#E040FB] bg-[#E040FB]/10 px-2 py-0.5 rounded-full">{tool.creditCost} credits</span>
        <span className={cn('font-heading font-semibold text-[#00D4FF] group-hover:underline', large ? 'text-sm' : 'text-xs')}>
          {large ? 'Launch Tool' : 'Try'}
        </span>
      </div>
    </Link>
  );
}
