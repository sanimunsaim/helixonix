import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, ShoppingCart, Wallet, BarChart3,
  FolderOpen, Briefcase, MessageCircle, Star, Settings,
  ChevronLeft, ChevronRight, Rocket
} from 'lucide-react';
import { useStore } from '@/store/useStore';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: ShoppingCart, label: 'Orders', path: '/dashboard/orders' },
  { icon: Wallet, label: 'Earnings', path: '/dashboard/earnings' },
  { icon: BarChart3, label: 'Analytics', path: '/dashboard/analytics' },
  { icon: FolderOpen, label: 'Assets', path: '/dashboard/assets' },
  { icon: Briefcase, label: 'Gigs', path: '/dashboard/gigs' },
  { icon: MessageCircle, label: 'Inbox', path: '/dashboard/inbox' },
  { icon: Star, label: 'Reviews', path: '/dashboard/reviews' },
  { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { sidebarCollapsed, toggleSidebar, unreadMessages, unreadOrders } = useStore();

  const sidebarWidth = sidebarCollapsed ? '72px' : '240px';

  return (
    <motion.aside
      className="fixed left-0 top-0 h-screen z-50 flex flex-col border-r border-white/[0.06]"
      style={{ background: '#0D1233' }}
      animate={{ width: sidebarWidth }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-3 overflow-hidden">
          <img
            src="/images/logo-primary.png"
            alt="HelixOnix"
            className="w-8 h-8 rounded-lg flex-shrink-0 object-contain"
          />
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <span className="font-display text-base font-semibold text-gradient-cyan">
                  Creator Studio
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
          const unread = item.label === 'Inbox' ? unreadMessages :
            item.label === 'Orders' ? unreadOrders : 0;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`
                w-full flex items-center gap-3 px-3 h-11 rounded-lg transition-all duration-200 relative group
                ${isActive
                  ? 'bg-[rgba(0,212,255,0.06)] text-[#00D4FF]'
                  : 'text-white/65 hover:text-white hover:bg-white/[0.04]'
                }
                ${sidebarCollapsed ? 'justify-center' : ''}
              `}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[60%] rounded-r-full"
                  style={{ background: '#00D4FF', boxShadow: '0 0 15px rgba(0,212,255,0.25)' }}
                />
              )}

              <div className="relative">
                <item.icon size={20} />
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500" />
                )}
              </div>

              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="text-[13px] font-medium tracking-wide whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Tooltip for collapsed */}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-2 px-3 py-1.5 rounded-md bg-[#0D1233] border border-white/[0.06] text-xs text-white/90 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-3 border-t border-white/[0.06] space-y-3">
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full gradient-purple text-white h-10 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              <Rocket size={16} />
              Upgrade to Pro
            </motion.button>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <img
              src="/assets/avatar-placeholder.jpg"
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover"
              style={{ border: '2px solid transparent', background: 'linear-gradient(135deg, #8B2FFF, #E040FB) border-box' }}
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-[#0D1233]" />
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="overflow-hidden flex-1 min-w-0"
              >
                <p className="text-sm text-white truncate">Alex Creator</p>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 font-medium">
                  Pro
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Toggle button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[#0D1233] border border-white/[0.06] flex items-center justify-center text-white/50 hover:text-white transition-colors z-10"
      >
        {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </motion.aside>
  );
}
