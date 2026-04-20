import { Search, Bell, HelpCircle, ChevronDown } from 'lucide-react';
import { useStore } from '@/store/useStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function TopBar() {
  const { pageTitle, unreadMessages, unreadOrders } = useStore();
  const totalUnread = unreadMessages + unreadOrders;

  return (
    <header
      className="sticky top-0 z-40 h-16 flex items-center justify-between px-6 border-b border-white/[0.06]"
      style={{ background: 'rgba(10, 15, 46, 0.85)', backdropFilter: 'blur(12px)' }}
    >
      {/* Page title */}
      <h1 className="font-display text-3xl font-bold text-white tracking-tight">
        {pageTitle}
      </h1>

      {/* Search */}
      <div className="hidden md:flex items-center w-[400px] h-10 rounded-lg bg-white/[0.04] border border-white/[0.06] px-3 focus-within:border-[rgba(0,212,255,0.25)] focus-within:shadow-[0_0_15px_rgba(0,212,255,0.15)] transition-all">
        <Search size={16} className="text-white/40 mr-3 flex-shrink-0" />
        <input
          type="text"
          placeholder="Search orders, assets, gigs..."
          className="bg-transparent border-none outline-none text-sm text-white placeholder:text-white/40 w-full"
        />
        <span className="text-[10px] text-white/30 px-1.5 py-0.5 rounded bg-white/[0.06] ml-2 flex-shrink-0">
          ⌘K
        </span>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        <button className="relative w-9 h-9 rounded-lg flex items-center justify-center text-white/65 hover:text-white hover:bg-white/[0.04] transition-colors">
          <Bell size={20} />
          {totalUnread > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
          )}
        </button>

        <button className="w-9 h-9 rounded-lg flex items-center justify-center text-white/65 hover:text-white hover:bg-white/[0.04] transition-colors">
          <HelpCircle size={20} />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 ml-1">
              <div
                className="w-9 h-9 rounded-full p-[2px]"
                style={{ background: 'linear-gradient(135deg, #8B2FFF, #E040FB)' }}
              >
                <img
                  src="/assets/avatar-placeholder.jpg"
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <ChevronDown size={14} className="text-white/50" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 bg-[#0D1233] border-white/[0.06] text-white"
          >
            <DropdownMenuItem className="hover:bg-white/[0.04] focus:bg-white/[0.04] cursor-pointer">
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-white/[0.04] focus:bg-white/[0.04] cursor-pointer">
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/[0.06]" />
            <DropdownMenuItem className="hover:bg-white/[0.04] focus:bg-white/[0.04] cursor-pointer text-red-400">
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
