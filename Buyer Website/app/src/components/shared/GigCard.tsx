import { Link } from 'react-router-dom';
import { Star, Clock } from 'lucide-react';
import type { Gig } from '@/types';
import { cn } from '@/lib/utils';

interface GigCardProps {
  gig: Gig;
  className?: string;
}

export default function GigCard({ gig, className }: GigCardProps) {
  return (
    <Link
      to={`/gig/${gig.seller.username}/${gig.slug}`}
      className={cn('card-hover glass-surface rounded-card overflow-hidden group block', className)}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img src={gig.thumbnail} alt={gig.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D1233]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
          <span className="px-4 py-2 bg-[#00D4FF] text-[#050815] text-sm font-heading font-semibold rounded-button">View Gig</span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <img src={gig.seller.avatar} alt={gig.seller.name} className="w-6 h-6 rounded-full border border-[rgba(0,212,255,0.3)]" />
          <span className="text-xs text-[#8892B0]">{gig.seller.name}</span>
          {gig.seller.level === 'top' && (
            <span className="text-[10px] px-1.5 py-0.5 bg-[#00D4FF]/20 text-[#00D4FF] rounded-full font-mono">TOP</span>
          )}
        </div>
        <h3 className="text-sm font-heading font-semibold text-white line-clamp-2 mb-2 group-hover:text-[#00D4FF] transition-colors">
          {gig.title}
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star size={12} className="text-[#FFD600] fill-[#FFD600]" />
            <span className="text-xs text-white font-medium">{gig.rating}</span>
            <span className="text-xs text-[#8892B0]">({gig.reviewCount})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs text-[#8892B0]">
              <Clock size={10} /> {gig.deliveryTime}
            </span>
            <span className="text-sm font-mono text-[#00D4FF]">From ${gig.startingPrice}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
