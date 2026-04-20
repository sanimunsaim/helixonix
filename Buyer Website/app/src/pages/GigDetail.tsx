import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGig } from '@/hooks/useGigs';
import { Star, Clock, Check, ChevronDown, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function GigDetail() {
  const { seller, slug } = useParams<{ seller: string; slug: string }>();
  const { data: gig, isLoading } = useGig(seller || '', slug || '');
  const [activePackage, setActivePackage] = useState<'basic' | 'standard' | 'premium'>('standard');
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);

  if (isLoading) return <div className="min-h-screen bg-[#050815] pt-24 text-center text-[#8892B0]">Loading...</div>;
  if (!gig) return <div className="min-h-screen bg-[#050815] pt-24 text-center text-white">Gig not found</div>;

  const pkg = gig.packages.find((p) => p.name === activePackage) || gig.packages[1];
  const addOnTotal = gig.addOns.filter((a) => selectedAddOns.includes(a.name)).reduce((s, a) => s + a.price, 0);
  const total = pkg.price + addOnTotal;

  const toggleAddOn = (name: string) => {
    setSelectedAddOns((prev) => prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]);
  };

  return (
    <div className="min-h-screen bg-[#050815] pt-8 pb-20">
      <div className="page-gutter max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
          {/* Left */}
          <div>
            {/* Gallery */}
            <div className="aspect-[16/10] rounded-card-lg overflow-hidden glass-surface mb-6">
              <img src={gig.thumbnail} alt={gig.title} className="w-full h-full object-cover" />
            </div>

            {/* Title & Seller */}
            <h1 className="font-heading font-bold text-2xl text-white mb-4">{gig.title}</h1>
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[rgba(0,212,255,0.1)]">
              <img src={gig.seller.avatar} alt={gig.seller.name} className="w-10 h-10 rounded-full border border-[rgba(0,212,255,0.3)]" />
              <div>
                <Link to={`/seller/${gig.seller.username}`} className="text-sm font-heading font-semibold text-white hover:text-[#00D4FF]">{gig.seller.name}</Link>
                <div className="flex items-center gap-1">
                  <Star size={12} className="text-[#FFD600] fill-[#FFD600]" />
                  <span className="text-xs text-white">{gig.rating}</span>
                  <span className="text-xs text-[#8892B0]">({gig.reviewCount} reviews)</span>
                </div>
              </div>
              <button className="ml-auto px-4 py-2 glass-surface rounded-button text-sm text-[#00D4FF] hover:border-[#00D4FF] flex items-center gap-1.5">
                <MessageCircle size={14} /> Contact
              </button>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="font-heading font-bold text-white mb-3">About This Gig</h3>
              <p className="text-sm text-[#8892B0] leading-relaxed whitespace-pre-line">{gig.description}</p>
            </div>

            {/* FAQ */}
            {gig.faq.length > 0 && (
              <div>
                <h3 className="font-heading font-bold text-white mb-3">FAQ</h3>
                <div className="space-y-2">
                  {gig.faq.map((faq, i) => (
                    <details key={i} className="glass-surface rounded-card overflow-hidden group">
                      <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
                        <span className="text-sm text-white font-medium">{faq.q}</span>
                        <ChevronDown size={16} className="text-[#8892B0] group-open:rotate-180 transition-transform" />
                      </summary>
                      <div className="px-4 pb-4"><p className="text-sm text-[#8892B0]">{faq.a}</p></div>
                    </details>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right - Order Panel */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="glass-surface rounded-card-lg overflow-hidden">
              {/* Package Tabs */}
              <div className="flex border-b border-[rgba(0,212,255,0.1)]">
                {gig.packages.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => setActivePackage(p.name)}
                    className={cn(
                      'flex-1 py-3 text-sm font-heading font-semibold capitalize transition-colors',
                      activePackage === p.name ? 'text-[#00D4FF] border-b-2 border-[#00D4FF]' : 'text-[#8892B0] hover:text-white'
                    )}
                  >
                    {p.name}
                  </button>
                ))}
              </div>

              <div className="p-6 space-y-5">
                {/* Price */}
                <div className="text-center">
                  <span className="font-display font-black text-4xl text-white">${pkg.price}</span>
                  <p className="text-xs text-[#8892B0] mt-1">{pkg.description}</p>
                </div>

                {/* Delivery & Revisions */}
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-[#8892B0]"><Clock size={14} /> {pkg.deliveryTime}</span>
                  <span className="text-[#8892B0]">{pkg.revisions} revisions</span>
                </div>

                {/* Features */}
                <ul className="space-y-2">
                  {pkg.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-white">
                      <Check size={14} className="text-[#00E676] flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>

                {/* Add-ons */}
                {gig.addOns.length > 0 && (
                  <div className="pt-4 border-t border-[rgba(0,212,255,0.1)]">
                    <p className="text-sm font-heading font-semibold text-white mb-2">Add-ons</p>
                    <div className="space-y-2">
                      {gig.addOns.map((addon) => (
                        <label key={addon.name} className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-white/5 transition-colors">
                          <input type="checkbox" checked={selectedAddOns.includes(addon.name)} onChange={() => toggleAddOn(addon.name)} className="accent-[#00D4FF]" />
                          <span className="flex-1 text-sm text-[#8892B0]">{addon.name}</span>
                          <span className="text-sm font-mono text-[#00D4FF]">+${addon.price}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Total */}
                <div className="flex items-center justify-between pt-4 border-t border-[rgba(0,212,255,0.1)]">
                  <span className="text-sm text-[#8892B0]">Total</span>
                  <span className="font-display font-bold text-2xl text-[#00D4FF]">${total}</span>
                </div>

                {/* CTA */}
                <button className="w-full py-3.5 bg-gradient-to-r from-[#00D4FF] to-[#00A8CC] text-[#050815] rounded-button font-heading font-bold btn-glow hover:brightness-110 transition-all">
                  Continue (${total})
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
