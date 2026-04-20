import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';

const links = [
  { label: 'Home', href: '/' },
  { label: 'Explore Assets', href: '/explore' },
  { label: 'AI Studio', href: '/ai-studio' },
  { label: 'Services', href: '/services' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Blog', href: '/blog' },
];

export default function MobileMenuDrawer() {
  const { mobileMenuOpen, toggleMobileMenu } = useUIStore();

  return (
    <>
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-[#050815]/90 backdrop-blur-lg" onClick={toggleMobileMenu} />
          <div className={cn(
            'absolute left-0 top-0 bottom-0 w-80 max-w-[80vw] bg-[#0A0F2E] border-r border-[rgba(0,212,255,0.15)] p-6 flex flex-col transition-transform duration-300',
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          )}>
            <div className="flex items-center justify-between mb-8">
              <img src="/images/logo-primary.png" alt="HelixOnix" className="h-8" />
              <button onClick={toggleMobileMenu} className="text-white p-1">
                <X size={24} />
              </button>
            </div>
            <nav className="flex flex-col gap-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={toggleMobileMenu}
                  className="px-4 py-3 text-lg font-heading font-semibold text-[#8892B0] hover:text-white hover:bg-[rgba(0,212,255,0.05)] rounded-lg transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
