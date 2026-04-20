import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Download, Package } from 'lucide-react';
import { GlassCard } from '@/components/shared/GlassCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { orders, type Order } from '@/data/mockData';

const tabs = [
  { key: 'all', label: 'All', count: 24 },
  { key: 'active', label: 'Active', count: 8 },
  { key: 'delivered', label: 'Delivered', count: 2 },
  { key: 'completed', label: 'Completed', count: 11 },
  { key: 'disputed', label: 'Disputed', count: 2 },
  { key: 'cancelled', label: 'Cancelled', count: 1 },
];

function OrderCard({ order }: { order: Order }) {
  const navigate = useNavigate();
  const deadline = new Date(order.deadline);
  const now = new Date();
  const hoursLeft = Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60 * 60));
  const isUrgent = hoursLeft < 24 && hoursLeft > 0;

  const actionButton = () => {
    switch (order.status) {
      case 'active':
        return { label: 'View & Deliver', className: 'gradient-purple text-white hover:opacity-90' };
      case 'delivered':
        return { label: 'Awaiting Approval', className: 'bg-white/[0.06] text-white/50 cursor-default' };
      case 'completed':
        return { label: 'View Details', className: 'bg-white/[0.06] text-white hover:bg-white/[0.1]' };
      case 'disputed':
        return { label: 'Resolve Dispute', className: 'bg-red-500/15 text-red-400 hover:bg-red-500/25' };
      default:
        return { label: 'View Details', className: 'bg-white/[0.06] text-white hover:bg-white/[0.1]' };
    }
  };

  const btn = actionButton();

  return (
    <GlassCard hover className="cursor-pointer" onClick={() => navigate(`/dashboard/orders/${order.id}`)}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-white/40">{order.id}</span>
          <StatusBadge status={order.status} />
        </div>

        <div className="flex items-center gap-2.5">
          <img src={order.buyer.avatar} alt={order.buyer.name} className="w-7 h-7 rounded-full object-cover" />
          <span className="text-sm text-white font-medium">{order.buyer.name}</span>
        </div>

        <p className="text-xs text-white/50 truncate">{order.gig}</p>

        <div className="flex items-center gap-2">
          <span className={`text-[10px] px-2 py-0.5 rounded-full ${
            order.package === 'Basic' ? 'bg-white/[0.06] text-white/50' :
            order.package === 'Standard' ? 'bg-cyan-500/15 text-cyan-400' :
            'bg-fuchsia-500/15 text-fuchsia-400'
          }`}>
            {order.package}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-white/50">Total: <span className="text-white">${order.amount}</span></span>
          <span className="text-[#8B2FFF] font-semibold">Earn: ${order.earnings}</span>
        </div>

        {order.status === 'active' && (
          <div className={`text-xs font-medium ${isUrgent ? 'text-red-400 animate-pulse' : 'text-white/50'}`}>
            {isUrgent
              ? `⚠ ${hoursLeft}h left`
              : `${Math.floor(hoursLeft / 24)}d ${hoursLeft % 24}h left`
            }
          </div>
        )}

        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/orders/${order.id}`); }}
          className={`w-full py-2 rounded-lg text-xs font-semibold transition-all ${btn.className}`}
        >
          {btn.label}
        </button>
      </div>
    </GlassCard>
  );
}

export function Orders() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = orders.filter((order) => {
    const matchesTab = activeTab === 'all' || order.status === activeTab;
    const matchesSearch = !searchQuery ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.buyer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.gig.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-5">
      {/* Stats bar */}
      <div className="flex flex-wrap gap-3">
        {tabs.slice(0, 4).map((tab) => (
          <div key={tab.key} className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#0D1233] border border-white/[0.06]">
            <span className="text-xs text-white/50">{tab.label}:</span>
            <span className="text-sm font-semibold text-white">{tab.count}</span>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center w-[280px] h-10 rounded-lg bg-white/[0.04] border border-white/[0.06] px-3">
          <Search size={16} className="text-white/40 mr-3" />
          <input
            type="text"
            placeholder="Search by order # or buyer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm text-white placeholder:text-white/40 w-full"
          />
        </div>
        <button className="flex items-center gap-2 px-4 h-10 rounded-lg bg-white/[0.06] text-white/70 hover:bg-white/[0.1] text-sm font-medium transition-colors border border-white/[0.06]">
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/[0.06]">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2.5 text-sm font-medium rounded-t-lg transition-colors relative ${
              activeTab === tab.key
                ? 'text-white'
                : 'text-white/50 hover:text-white/80'
            }`}
          >
            {tab.label}
            <span className={`ml-1.5 text-xs ${activeTab === tab.key ? 'text-white/70' : 'text-white/30'}`}>
              ({tab.count})
            </span>
            {activeTab === tab.key && (
              <motion.div
                layoutId="orderTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00D4FF]"
                style={{ boxShadow: '0 0 10px rgba(0,212,255,0.5)' }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Order Grid */}
      {filteredOrders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20">
          <Package size={48} className="text-white/20 mb-4" />
          <h3 className="font-display text-xl font-semibold text-white/60">No {activeTab !== 'all' ? activeTab : ''} orders</h3>
          <p className="text-sm text-white/40 mt-1">
            {activeTab === 'all' ? 'Orders will appear here once buyers start purchasing.' : `You don't have any ${activeTab} orders yet.`}
          </p>
        </div>
      )}
    </div>
  );
}
