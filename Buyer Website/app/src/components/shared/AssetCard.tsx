import { Link } from 'react-router-dom';
import { Heart, Eye } from 'lucide-react';
import type { Asset } from '@/types';
import { formatPriceShort } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface AssetCardProps {
  asset: Asset;
  variant?: 'default' | 'compact' | 'mini';
  className?: string;
}

export default function AssetCard({ asset, variant = 'default', className }: AssetCardProps) {
  if (variant === 'mini') {
    return (
      <Link to={`/asset/${asset.slug}`} className={cn('flex items-center gap-3 group', className)}>
        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
          <img src={asset.previewUrl} alt={asset.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-white font-medium truncate group-hover:text-[#00D4FF] transition-colors">{asset.title}</p>
          <p className="text-xs text-[#8892B0]">{asset.seller.name}</p>
        </div>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link to={`/asset/${asset.slug}`} className={cn('group block', className)}>
        <div className="relative aspect-[4/3] rounded-card overflow-hidden mb-2">
          <img src={asset.previewUrl} alt={asset.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          {asset.isFree && (
            <span className="absolute top-2 left-2 px-2 py-0.5 bg-[#00E676] text-[#050815] text-[10px] font-mono font-bold rounded">FREE</span>
          )}
        </div>
        <p className="text-sm text-white truncate group-hover:text-[#00D4FF] transition-colors">{asset.title}</p>
        <p className="text-xs text-[#8892B0] font-mono">{formatPriceShort(asset.price)}</p>
      </Link>
    );
  }

  return (
    <Link to={`/asset/${asset.slug}`} className={cn('card-hover glass-surface rounded-card overflow-hidden group block', className)}>
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={asset.previewUrl} alt={asset.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        {asset.isFree && (
          <span className="absolute top-2 left-2 px-2 py-0.5 bg-[#00E676] text-[#050815] text-[10px] font-mono font-bold rounded">FREE</span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D1233]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-white hover:bg-[#00D4FF] hover:text-[#050815] transition-all">
            <Eye size={18} />
          </button>
          <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-white hover:bg-[#FF1744] transition-all">
            <Heart size={18} />
          </button>
        </div>
      </div>
      <div className="p-3">
        <h3 className="text-sm font-heading font-semibold text-white truncate group-hover:text-[#00D4FF] transition-colors">{asset.title}</h3>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1.5">
            <img src={asset.seller.avatar} alt={asset.seller.name} className="w-5 h-5 rounded-full" />
            <span className="text-xs text-[#8892B0]">{asset.seller.name}</span>
          </div>
          <span className={cn(
            'text-xs font-mono font-medium px-2 py-0.5 rounded',
            asset.isFree ? 'text-[#00E676] bg-[#00E676]/10' : 'text-[#00D4FF] bg-[#00D4FF]/10'
          )}>
            {formatPriceShort(asset.price)}
          </span>
        </div>
      </div>
    </Link>
  );
}
