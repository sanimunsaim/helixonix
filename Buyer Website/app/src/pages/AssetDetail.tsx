import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, Share2, Download, Check, Shield, FileText, Tag } from 'lucide-react';
import { useAsset, useRelatedAssets } from '@/hooks/useAssets';
import AssetCard from '@/components/shared/AssetCard';
import StarRating from '@/components/shared/StarRating';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { formatPrice, cn } from '@/lib/utils';

export default function AssetDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: asset, isLoading } = useAsset(slug || '');
  const { data: related } = useRelatedAssets(asset?.id || '');
  const ref = useScrollReveal<HTMLElement>();
  const [license, setLicense] = useState<'standard' | 'extended'>('standard');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050815] pt-24 page-gutter">
        <div className="animate-pulse max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
            <div className="aspect-[4/3] bg-[#0A0F2E] rounded-card-lg" />
            <div className="space-y-4"><div className="h-8 bg-[#0A0F2E] rounded w-3/4" /><div className="h-4 bg-[#0A0F2E] rounded w-1/2" /></div>
          </div>
        </div>
      </div>
    );
  }

  if (!asset) return <div className="min-h-screen bg-[#050815] pt-24 text-center text-white">Asset not found</div>;

  const licensePrice = license === 'extended' ? asset.price * 3 : asset.price;

  return (
    <section ref={ref} className="section-reveal min-h-screen bg-[#050815] pt-8 pb-20">
      <div className="page-gutter max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
          {/* Left - Preview */}
          <div>
            <div className="aspect-[4/3] rounded-card-lg overflow-hidden glass-surface mb-6">
              <img src={asset.previewUrl} alt={asset.title} className="w-full h-full object-cover" />
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {asset.tags.map((tag) => (
                <Link key={tag} to={`/explore?q=${tag}`} className="px-3 py-1.5 glass-surface rounded-full text-xs text-[#8892B0] hover:text-[#00D4FF] hover:border-[rgba(0,212,255,0.5)] transition-colors">
                  <Tag size={10} className="inline mr-1" />{tag}
                </Link>
              ))}
            </div>

            {/* Description */}
            <div className="glass-surface rounded-card p-6 mb-6">
              <h3 className="font-heading font-bold text-white mb-3">Description</h3>
              <p className="text-sm text-[#8892B0] leading-relaxed">{asset.description}</p>
            </div>

            {/* Specs */}
            <div className="glass-surface rounded-card p-6 mb-8">
              <h3 className="font-heading font-bold text-white mb-4">Technical Specifications</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Format', value: asset.format },
                  { label: 'File Size', value: asset.fileSize },
                  { label: 'Dimensions', value: asset.dimensions },
                  { label: 'License', value: asset.license },
                  { label: 'Downloads', value: asset.downloadCount.toLocaleString() },
                  { label: 'Rating', value: `${asset.rating}/5` },
                ].map((spec) => (
                  <div key={spec.label} className="flex justify-between py-2 border-b border-[rgba(0,212,255,0.1)]">
                    <span className="text-sm text-[#8892B0]">{spec.label}</span>
                    <span className="text-sm text-white font-mono">{spec.value || 'N/A'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Related */}
            {related && related.length > 0 && (
              <div>
                <h3 className="font-heading font-bold text-white mb-4">You May Also Like</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {related.map((a) => <AssetCard key={a.id} asset={a} variant="compact" />)}
                </div>
              </div>
            )}
          </div>

          {/* Right - Purchase Panel */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="glass-surface rounded-card-lg p-6 space-y-6">
              {/* Seller */}
              <div className="flex items-center gap-3 pb-4 border-b border-[rgba(0,212,255,0.1)]">
                <img src={asset.seller.avatar} alt={asset.seller.name} className="w-10 h-10 rounded-full border border-[rgba(0,212,255,0.3)]" />
                <div>
                  <Link to={`/seller/${asset.seller.username}`} className="text-sm font-heading font-semibold text-white hover:text-[#00D4FF] transition-colors">{asset.seller.name}</Link>
                  <div className="flex items-center gap-1">
                    <StarRating rating={asset.seller.rating} size={10} />
                    <span className="text-xs text-[#8892B0]">({asset.seller.reviewCount})</span>
                  </div>
                </div>
              </div>

              {/* Title */}
              <h1 className="font-heading font-bold text-xl text-white">{asset.title}</h1>

              {/* Price */}
              <div>
                <span className={cn('font-display font-black text-3xl', asset.isFree ? 'text-[#00E676]' : 'text-white')}>
                  {formatPrice(licensePrice)}
                </span>
                {!asset.isFree && license === 'extended' && (
                  <span className="text-sm text-[#8892B0] ml-2 line-through">{formatPrice(asset.price)}</span>
                )}
              </div>

              {/* License Selector */}
              {!asset.isFree && (
                <div className="space-y-2">
                  <label className="text-sm text-[#8892B0]">License Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setLicense('standard')} className={cn('p-3 rounded-button text-sm border transition-all', license === 'standard' ? 'border-[#00D4FF] bg-[#00D4FF]/10 text-[#00D4FF]' : 'border-[rgba(0,212,255,0.15)] text-[#8892B0] hover:text-white')}>
                      Standard
                    </button>
                    <button onClick={() => setLicense('extended')} className={cn('p-3 rounded-button text-sm border transition-all', license === 'extended' ? 'border-[#00D4FF] bg-[#00D4FF]/10 text-[#00D4FF]' : 'border-[rgba(0,212,255,0.15)] text-[#8892B0] hover:text-white')}>
                      Extended
                    </button>
                  </div>
                  <p className="text-xs text-[#8892B0]">
                    {license === 'standard' ? 'For personal and commercial projects. Up to 500,000 copies.' : 'For resale, templates, and unlimited distribution.'}
                  </p>
                </div>
              )}

              {/* CTA */}
              <button className={cn(
                'w-full py-3.5 rounded-button font-heading font-bold transition-all flex items-center justify-center gap-2',
                asset.isFree
                  ? 'bg-[#00E676] text-[#050815] hover:brightness-110'
                  : 'bg-gradient-to-r from-[#00D4FF] to-[#00A8CC] text-[#050815] btn-glow hover:brightness-110'
              )}>
                <Download size={18} /> {asset.isFree ? 'Download Free' : `Buy Now — ${formatPrice(licensePrice)}`}
              </button>

              {/* Actions */}
              <div className="flex gap-2">
                <button className="flex-1 py-2.5 glass-surface rounded-button text-sm text-[#8892B0] hover:text-white hover:border-[rgba(0,212,255,0.5)] transition-all flex items-center justify-center gap-1.5">
                  <Heart size={14} /> Save
                </button>
                <button className="flex-1 py-2.5 glass-surface rounded-button text-sm text-[#8892B0] hover:text-white hover:border-[rgba(0,212,255,0.5)] transition-all flex items-center justify-center gap-1.5">
                  <Share2 size={14} /> Share
                </button>
              </div>

              {/* License Info */}
              <div className="pt-4 border-t border-[rgba(0,212,255,0.1)] space-y-2">
                {[
                  { icon: Check, text: 'Instant digital download' },
                  { icon: Shield, text: 'Lifetime commercial license' },
                  { icon: FileText, text: 'License certificate included' },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-2 text-xs text-[#8892B0]">
                    <item.icon size={12} className="text-[#00E676]" /> {item.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


