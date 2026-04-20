import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  if (price === 0) return 'Free';
  return `$${price.toFixed(2)}`;
}

export function formatPriceShort(price: number): string {
  if (price === 0) return 'Free';
  return `$${Math.floor(price)}`;
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatRelativeDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return formatDate(d);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function getLevelBadge(level: string): { label: string; color: string } {
  switch (level) {
    case 'top':
      return { label: 'Top Rated', color: 'bg-[#00D4FF]/20 text-[#00D4FF]' };
    case 'level2':
      return { label: 'Level 2', color: 'bg-[#8B2FFF]/20 text-[#8B2FFF]' };
    case 'level1':
      return { label: 'Level 1', color: 'bg-[#E040FB]/20 text-[#E040FB]' };
    default:
      return { label: 'New Seller', color: 'bg-white/10 text-[#8892B0]' };
  }
}

export function getStatusColor(status: string): { bg: string; text: string } {
  switch (status) {
    case 'completed':
      return { bg: 'bg-[#00E676]/20', text: 'text-[#00E676]' };
    case 'delivered':
      return { bg: 'bg-[#8B2FFF]/20', text: 'text-[#8B2FFF]' };
    case 'active':
      return { bg: 'bg-[#00D4FF]/20', text: 'text-[#00D4FF]' };
    case 'disputed':
      return { bg: 'bg-[#FF1744]/20', text: 'text-[#FF1744]' };
    case 'cancelled':
      return { bg: 'bg-white/10', text: 'text-[#8892B0]' };
    default:
      return { bg: 'bg-white/10', text: 'text-[#8892B0]' };
  }
}
