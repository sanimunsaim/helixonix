import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useSellers } from '@/hooks/useSellers';
import SellerCard from '@/components/shared/SellerCard';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export default function ServicePreviewSection() {
  const { data: sellers } = useSellers();
  const ref = useScrollReveal<HTMLElement>();

  return (
    <section ref={ref} className="section-reveal py-20 bg-[#0A0F2E]">
      <div className="page-gutter">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-heading font-bold text-2xl md:text-3xl text-white mb-2">Hire World-Class Creators</h2>
            <p className="text-[#8892B0]">Connect with top talent for your next creative project</p>
          </div>
          <Link to="/services" className="hidden sm:flex items-center gap-1 text-sm font-heading font-semibold text-[#00D4FF] hover:underline underline-offset-4">
            Browse All Services <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {sellers?.slice(0, 4).map((seller) => (
            <SellerCard key={seller.id} seller={seller} />
          ))}
        </div>
      </div>
    </section>
  );
}
