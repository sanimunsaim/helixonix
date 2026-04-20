import { Link } from 'react-router-dom';
import { Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';

const linkColumns = [
  {
    title: 'Products',
    links: [
      { label: 'Templates', href: '/explore/templates' },
      { label: 'Stock Images', href: '/explore/images' },
      { label: 'Stock Video', href: '/explore/video' },
      { label: 'AI Studio', href: '/ai-studio' },
      { label: 'Fonts', href: '/explore/fonts' },
    ],
  },
  {
    title: 'Creators',
    links: [
      { label: 'Become a Seller', href: '/signup' },
      { label: 'Success Stories', href: '/blog' },
      { label: 'Resources', href: '/blog' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Blog', href: '/blog' },
      { label: 'Careers', href: '#' },
      { label: 'Contact', href: '#' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms', href: '#' },
      { label: 'Privacy', href: '#' },
      { label: 'Licenses', href: '#' },
      { label: 'Cookie Policy', href: '#' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#050815] border-t border-[rgba(0,212,255,0.1)]">
      <div className="page-gutter py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src="/images/logo-primary.png" alt="HelixOnix" className="h-8 w-auto" />
            </Link>
            <p className="text-sm text-[#8892B0] mb-6">Where Vision Becomes Reality</p>
            <div className="flex items-center gap-3">
              <a href="#" className="text-[#8892B0] hover:text-[#00D4FF] transition-colors"><Twitter size={18} /></a>
              <a href="#" className="text-[#8892B0] hover:text-[#00D4FF] transition-colors"><Instagram size={18} /></a>
              <a href="#" className="text-[#8892B0] hover:text-[#00D4FF] transition-colors"><Linkedin size={18} /></a>
              <a href="#" className="text-[#8892B0] hover:text-[#00D4FF] transition-colors"><Youtube size={18} /></a>
            </div>
          </div>

          {/* Link Columns */}
          {linkColumns.map((col) => (
            <div key={col.title}>
              <h4 className="font-heading font-semibold text-white text-sm mb-4">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.href} className="text-sm text-[#8892B0] hover:text-white hover:underline underline-offset-4 decoration-[#00D4FF] transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-[rgba(0,212,255,0.1)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#8892B0]">2025 HelixOnix. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-[#8892B0]">Secure Checkout</span>
            <span className="text-xs text-[#8892B0]">Cancel Anytime</span>
            <span className="text-xs text-[#8892B0]">24/7 Support</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
