import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Menu, X, Bell, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import MobileMenuDrawer from './MobileMenuDrawer';
import { cn } from '@/lib/utils';

const navLinks = [
  { label: 'Explore', href: '/explore' },
  { label: 'AI Studio', href: '/ai-studio' },
  { label: 'Services', href: '/services' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Blog', href: '/blog' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const { toggleMobileMenu, mobileMenuOpen, toggleSearch } = useUIStore();
  const location = useLocation();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const isActive = (href: string) => {
    if (href === '/explore') return location.pathname.startsWith('/explore') || location.pathname.startsWith('/asset');
    if (href === '/ai-studio') return location.pathname.startsWith('/ai-studio');
    if (href === '/services') return location.pathname.startsWith('/services') || location.pathname.startsWith('/gig');
    return location.pathname === href;
  };

  return (
    <>
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 z-50 h-16 flex items-center transition-all duration-300',
          scrolled
            ? 'bg-[#050815]/90 backdrop-blur-xl border-b border-[rgba(0,212,255,0.15)]'
            : 'bg-transparent'
        )}
      >
        <div className="w-full page-gutter flex items-center justify-between">
          {/* Left */}
          <div className="flex items-center gap-4">
            <button onClick={toggleMobileMenu} className="lg:hidden text-white p-1">
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Link to="/" className="flex items-center gap-2">
              <img src="/images/logo-primary.png" alt="HelixOnix" className="h-8 w-auto" />
            </Link>
          </div>

          {/* Center - Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'px-4 py-2 font-heading font-semibold text-sm rounded-button transition-colors relative',
                  isActive(link.href)
                    ? 'text-white'
                    : 'text-[#8892B0] hover:text-white'
                )}
              >
                {link.label}
                {isActive(link.href) && (
                  <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#00D4FF] rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            <button onClick={toggleSearch} className="p-2 text-[#8892B0] hover:text-white transition-colors">
              <Search size={20} />
            </button>

            {isAuthenticated && user ? (
              <>
                <Link to="/dashboard/billing" className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.2)]">
                  <span className="text-[#00D4FF] text-xs">⚡</span>
                  <span className="font-mono text-sm text-[#00D4FF]">{user.credits}</span>
                </Link>
                <button className="p-2 text-[#8892B0] hover:text-white transition-colors relative">
                  <Bell size={20} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-[#E040FB] rounded-full" />
                </button>
                <div className="relative group">
                  <button className="flex items-center gap-1 p-1">
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border border-[rgba(0,212,255,0.3)]" />
                    <ChevronDown size={14} className="text-[#8892B0]" />
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-48 glass-surface-strong rounded-panel opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-[rgba(0,212,255,0.1)]">
                      <p className="text-sm font-medium text-white">{user.name}</p>
                      <p className="text-xs text-[#8892B0]">{user.email}</p>
                    </div>
                    <Link to="/dashboard" className="block px-4 py-2 text-sm text-[#8892B0] hover:text-white hover:bg-[rgba(0,212,255,0.05)] transition-colors">Dashboard</Link>
                    <Link to="/dashboard/library" className="block px-4 py-2 text-sm text-[#8892B0] hover:text-white hover:bg-[rgba(0,212,255,0.05)] transition-colors">My Library</Link>
                    <Link to="/dashboard/orders" className="block px-4 py-2 text-sm text-[#8892B0] hover:text-white hover:bg-[rgba(0,212,255,0.05)] transition-colors">My Orders</Link>
                    <Link to="/dashboard/billing" className="block px-4 py-2 text-sm text-[#8892B0] hover:text-white hover:bg-[rgba(0,212,255,0.05)] transition-colors">Billing</Link>
                    <div className="border-t border-[rgba(0,212,255,0.1)] mt-1 pt-1">
                      <button onClick={logout} className="block w-full text-left px-4 py-2 text-sm text-[#FF1744] hover:bg-[rgba(255,23,68,0.05)] transition-colors">Sign Out</button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="hidden sm:block px-4 py-2 text-sm font-heading font-semibold text-[#8892B0] hover:text-white transition-colors">Sign In</Link>
                <Link to="/signup" className="px-4 py-2 text-sm font-heading font-semibold bg-gradient-to-r from-[#00D4FF] to-[#00A8CC] text-[#050815] rounded-button hover:shadow-cyan-glow transition-all">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
      <MobileMenuDrawer />
    </>
  );
}
