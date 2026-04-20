import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  count?: number;
  size?: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
  className?: string;
}

export default function StarRating({ rating, count, size = 14, interactive = false, onRate, className }: StarRatingProps) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRate?.(i)}
            className={cn(interactive && 'cursor-pointer hover:scale-110 transition-transform')}
          >
            <Star
              size={size}
              className={cn(
                i <= Math.round(rating) ? 'text-[#FFD600] fill-[#FFD600]' : 'text-[#8892B0]'
              )}
            />
          </button>
        ))}
      </div>
      {count !== undefined && <span className="text-xs text-[#8892B0]">({count})</span>}
    </div>
  );
}
