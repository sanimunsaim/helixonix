import { useState } from 'react';
import { Clock, CheckCircle, AlertCircle, XCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = ['All', 'Active', 'Delivered', 'Completed', 'Disputed'];
const statusConfig: Record<string, { icon: typeof CheckCircle; color: string; bg: string }> = {
  active: { icon: Clock, color: 'text-[#00D4FF]', bg: 'bg-[#00D4FF]/20' },
  delivered: { icon: CheckCircle, color: 'text-[#8B2FFF]', bg: 'bg-[#8B2FFF]/20' },
  completed: { icon: CheckCircle, color: 'text-[#00E676]', bg: 'bg-[#00E676]/20' },
  disputed: { icon: AlertCircle, color: 'text-[#FF1744]', bg: 'bg-[#FF1744]/20' },
  cancelled: { icon: XCircle, color: 'text-[#8892B0]', bg: 'bg-white/10' },
};

const mockOrders = [
  { id: '4821', gig: 'Brand Identity Package', seller: 'Maya Chen', status: 'active', amount: 499, deadline: 'Apr 25, 2025', progress: 60 },
  { id: '4819', gig: 'Commercial Video Edit', seller: 'James Wilson', status: 'active', amount: 449, deadline: 'Apr 28, 2025', progress: 80 },
  { id: '4815', gig: '3D Product Render', seller: 'Alex Rivera', status: 'delivered', amount: 799, deadline: 'Apr 20, 2025', progress: 100 },
  { id: '4808', gig: 'AI Automation Pipeline', seller: 'Zara Williams', status: 'completed', amount: 349, deadline: 'Apr 15, 2025', progress: 100 },
  { id: '4802', gig: 'Motion Graphics Intro', seller: 'Alex Rivera', status: 'disputed', amount: 249, deadline: 'Apr 12, 2025', progress: 50 },
];

export default function DashboardOrders() {
  const [activeTab, setActiveTab] = useState('All');

  const filtered = activeTab === 'All' ? mockOrders : mockOrders.filter((o) => o.status === activeTab.toLowerCase());

  return (
    <div className="min-h-screen bg-[#050815] pt-8 pb-20">
      <div className="page-gutter max-w-5xl mx-auto">
        <h1 className="font-heading font-bold text-2xl text-white mb-6">My Orders</h1>

        <div className="flex gap-1 mb-6 border-b border-[rgba(0,212,255,0.1)] overflow-x-auto hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn('px-4 py-3 text-sm font-heading font-semibold whitespace-nowrap transition-colors', activeTab === tab ? 'text-[#00D4FF] border-b-2 border-[#00D4FF]' : 'text-[#8892B0] hover:text-white')}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map((order) => {
            const config = statusConfig[order.status] || statusConfig.active;
            return (
              <div key={order.id} className="glass-surface rounded-card p-4 hover:border-[rgba(0,212,255,0.3)] transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-[#00D4FF]">#{order.id}</span>
                    <h3 className="text-sm font-medium text-white">{order.gig}</h3>
                  </div>
                  <span className={cn('flex items-center gap-1 text-xs px-2 py-1 rounded-full', config.bg, config.color)}>
                    <config.icon size={12} /> {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-[#8892B0]">
                  <span>{order.seller}</span>
                  <span className="font-mono text-[#00D4FF]">${order.amount}</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1 bg-[#0A0F2E] rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full', order.progress === 100 ? 'bg-[#00E676]' : 'bg-gradient-to-r from-[#00D4FF] to-[#8B2FFF]')} style={{ width: `${order.progress}%` }} />
                  </div>
                  <span className="text-[10px] text-[#8892B0] flex items-center gap-1"><Clock size={10} /> {order.deadline}</span>
                </div>
                {order.status === 'delivered' && (
                  <div className="flex gap-2 mt-3">
                    <button className="flex-1 py-2 bg-[#00E676] text-[#050815] rounded-button text-xs font-heading font-semibold flex items-center justify-center gap-1">
                      <CheckCircle size={12} /> Accept Delivery
                    </button>
                    <button className="flex-1 py-2 glass-surface rounded-button text-xs text-[#FFD600] flex items-center justify-center gap-1">
                      <RefreshCw size={12} /> Request Revision
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
