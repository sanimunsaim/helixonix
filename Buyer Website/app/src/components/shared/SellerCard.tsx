import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import type { Seller } from '@/types';
import { cn } from '@/lib/utils';

interface SellerCardProps {
  seller: Seller;
  className?: string;
}

export default function SellerCard({ seller, className }: SellerCardProps) {
  return (
    <Link to={`/seller/${seller.username}`} className={cn('card-hover glass-surface rounded-card p-6 block group', className)}>
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-3">
          <img src={seller.avatar} alt={seller.name} className="w-14 h-14 rounded-full border-2 border-[#00D4FF] group-hover:shadow-cyan-glow transition-shadow" />
        </div>
        <h3 className="font-heading font-semibold text-white group-hover:text-[#00D4FF] transition-colors">{seller.name}</h3>
        <p className="text-xs text-[#00D4FF] bg-[#00D4FF]/10 px-2 py-0.5 rounded-full mt-1 mb-2">{seller.specialty}</p>
        <div className="flex items-center gap-1 mb-2">
          <Star size={12} className="text-[#FFD600] fill-[#FFD600]" />
          <span className="text-xs text-white">{seller.rating}</span>
          <span className="text-xs text-[#8892B0]">({seller.reviewCount})</span>
        </div>
        <span className="text-sm font-mono text-[#00D4FF]">From ${seller.totalSales ? '99' : '49'}</span>
      </div>
    </Link>
  );
}
