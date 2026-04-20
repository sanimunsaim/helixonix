import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSeller } from '@/hooks/useSellers';
import { useGigs } from '@/hooks/useGigs';
import { useAssets } from '@/hooks/useAssets';
import { Star, MapPin, Globe, MessageCircle, Briefcase, Clock, TrendingUp } from 'lucide-react';
import GigCard from '@/components/shared/GigCard';
import AssetCard from '@/components/shared/AssetCard';
import { cn } from '@/lib/utils';

export default function SellerProfile() {
  const { username } = useParams<{ username: string }>();
  const { data: seller, isLoading } = useSeller(username || '');
  const { data: gigsData } = useGigs();
  const { data: assetsData } = useAssets({ sort: 'trending', limit: 4 });
  const [activeTab, setActiveTab] = useState<'portfolio' | 'gigs' | 'reviews'>('gigs');

  if (isLoading) return <div className="min-h-screen bg-[#050815] pt-24 text-center text-[#8892B0]">Loading...</div>;
  if (!seller) return <div className="min-h-screen bg-[#050815] pt-24 text-center text-white">Seller not found</div>;

  const sellerGigs = gigsData?.items.filter((g) => g.seller.username === username) || [];

  return (
    <div className="min-h-screen bg-[#050815] pt-8 pb-20">
      {/* Banner */}
      <div className="h-48 bg-gradient-to-r from-[#0A0F2E] via-[#0D1233] to-[#0A0F2E] relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url(/images/hero-bg.jpg)', backgroundSize: 'cover' }} />
      </div>

      <div className="page-gutter max-w-5xl mx-auto -mt-16 relative z-10">
        {/* Profile Info */}
        <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
          <img src={seller.avatar} alt={seller.name} className="w-24 h-24 rounded-full border-4 border-[#050815] shadow-cyan-glow" />
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-heading font-bold text-2xl text-white">{seller.name}</h1>
              {seller.level === 'top' && <span className="px-2 py-0.5 bg-[#00D4FF]/20 text-[#00D4FF] text-xs rounded-full font-mono">TOP RATED</span>}
            </div>
            <p className="text-sm text-[#8892B0] mb-2">{seller.specialty}</p>
            <div className="flex items-center gap-4 text-xs text-[#8892B0]">
              <span className="flex items-center gap-1"><Star size={12} className="text-[#FFD600] fill-[#FFD600]" /> {seller.rating} ({seller.reviewCount})</span>
              {seller.location && <span className="flex items-center gap-1"><MapPin size={12} /> {seller.location}</span>}
              <span className="flex items-center gap-1"><Globe size={12} /> {seller.languages?.join(', ')}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 glass-surface rounded-button text-sm text-[#00D4FF] hover:border-[#00D4FF] flex items-center gap-1.5">
              <MessageCircle size={14} /> Contact
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { icon: Briefcase, label: 'Total Sales', value: seller.totalSales || 0 },
            { icon: TrendingUp, label: 'Response Rate', value: `${seller.responseRate}%` },
            { icon: Clock, label: 'Delivery', value: `${seller.deliveryRate}%` },
            { icon: Star, label: 'Rating', value: seller.rating },
          ].map((stat) => (
            <div key={stat.label} className="glass-surface rounded-card p-4 text-center">
              <stat.icon size={18} className="text-[#00D4FF] mx-auto mb-1" />
              <p className="font-mono text-lg text-white font-bold">{stat.value}</p>
              <p className="text-xs text-[#8892B0]">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Bio */}
        <div className="glass-surface rounded-card p-6 mb-8">
          <p className="text-sm text-[#8892B0] leading-relaxed">{seller.bio}</p>
          <div className="flex flex-wrap gap-2 mt-4">
            {seller.skills?.map((skill) => (
              <span key={skill} className="px-3 py-1 bg-[#0D1233] text-[#00D4FF] text-xs rounded-full">{skill}</span>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-[rgba(0,212,255,0.1)]">
          {(['portfolio', 'gigs', 'reviews'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-4 py-3 text-sm font-heading font-semibold capitalize transition-colors',
                activeTab === tab ? 'text-[#00D4FF] border-b-2 border-[#00D4FF]' : 'text-[#8892B0] hover:text-white'
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'gigs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sellerGigs.map((gig) => <GigCard key={gig.id} gig={gig} />)}
          </div>
        )}
        {activeTab === 'portfolio' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {assetsData?.items.slice(0, 6).map((asset) => <AssetCard key={asset.id} asset={asset} variant="compact" />)}
          </div>
        )}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <p className="text-[#8892B0] text-sm">Reviews coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}
