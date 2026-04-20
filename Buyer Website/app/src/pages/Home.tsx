import HeroSection from '@/components/sections/home/HeroSection';
import CategoryNavSection from '@/components/sections/home/CategoryNavSection';
import TrendingAssetsSection from '@/components/sections/home/TrendingAssetsSection';
import AIStudioShowcaseSection from '@/components/sections/home/AIStudioShowcaseSection';
import FeaturedCollectionsSection from '@/components/sections/home/FeaturedCollectionsSection';
import ServicePreviewSection from '@/components/sections/home/ServicePreviewSection';
import WhyHelixonixSection from '@/components/sections/home/WhyHelixonixSection';
import PricingPreviewSection from '@/components/sections/home/PricingPreviewSection';

export default function Home() {
  return (
    <div className="bg-[#050815]">
      <HeroSection />
      <CategoryNavSection />
      <TrendingAssetsSection />
      <AIStudioShowcaseSection />
      <FeaturedCollectionsSection />
      <ServicePreviewSection />
      <WhyHelixonixSection />
      <PricingPreviewSection />
    </div>
  );
}
