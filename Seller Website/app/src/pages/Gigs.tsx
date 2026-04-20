import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus, Pencil, Pause, Play, Copy, Trash2, ExternalLink,
  BarChart3, TrendingUp, Clock, Users
} from 'lucide-react';
import { GlassCard } from '@/components/shared/GlassCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { gigs } from '@/data/mockData';

function GigCard({ gig }: { gig: typeof gigs[0] }) {
  return (
    <GlassCard hover className="!p-0 overflow-hidden">
      {/* Thumbnail */}
      <div className="relative h-44 overflow-hidden">
        <img src={gig.thumbnail} alt={gig.title} className="w-full h-full object-cover" />
        <div className="absolute top-3 right-3">
          <StatusBadge status={gig.status} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <h3 className="font-display text-base font-semibold text-white line-clamp-2 leading-tight">{gig.title}</h3>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-lg bg-white/[0.04]">
            <p className="text-xs text-white/40">Views</p>
            <p className="text-sm font-semibold text-white">{gig.views.toLocaleString()}</p>
          </div>
          <div className="p-2 rounded-lg bg-white/[0.04]">
            <p className="text-xs text-white/40">Orders</p>
            <p className="text-sm font-semibold text-white">{gig.ordersThisMonth}</p>
          </div>
          <div className="p-2 rounded-lg bg-white/[0.04]">
            <p className="text-xs text-white/40">Rating</p>
            <p className="text-sm font-semibold text-amber-400">{gig.rating}★</p>
          </div>
        </div>

        {/* Package prices */}
        <div className="flex gap-2">
          <span className="flex-1 text-center text-[10px] py-1 rounded-full bg-white/[0.06] text-white/50">
            B: ${gig.packages.basic}
          </span>
          <span className="flex-1 text-center text-[10px] py-1 rounded-full bg-cyan-500/10 text-cyan-400">
            S: ${gig.packages.standard}
          </span>
          <span className="flex-1 text-center text-[10px] py-1 rounded-full bg-fuchsia-500/10 text-fuchsia-400">
            P: ${gig.packages.premium}
          </span>
        </div>

        {/* Revenue */}
        <p className="text-xs text-white/50">Revenue: <span className="text-[#8B2FFF] font-semibold">${gig.revenue.toLocaleString()}</span></p>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
          <div className="flex gap-1">
            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors" title="Edit">
              <Pencil size={14} />
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors" title="Pause">
              {gig.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors" title="Duplicate">
              <Copy size={14} />
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-red-400 hover:bg-white/[0.06] transition-colors" title="Delete">
              <Trash2 size={14} />
            </button>
          </div>
          <div className="flex gap-1">
            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors" title="View">
              <ExternalLink size={14} />
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-[#8B2FFF] hover:bg-white/[0.06] transition-colors" title="Analytics">
              <BarChart3 size={14} />
            </button>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

export function Gigs() {
  const navigate = useNavigate();

  const activeGigs = gigs.filter((g) => g.status === 'active');
  const avgConversion = activeGigs.length > 0
    ? (activeGigs.reduce((sum, g) => sum + (g.conversionRate || 0), 0) / activeGigs.length).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div />
        <button
          onClick={() => navigate('/gigs/new')}
          className="flex items-center gap-2 px-5 h-10 rounded-lg gradient-purple text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          Create New Gig
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/15 flex items-center justify-center">
              <TrendingUp size={18} className="text-[#8B2FFF]" />
            </div>
            <div>
              <p className="text-xs text-white/50">Conversion Rate</p>
              <p className="font-display text-xl font-bold text-white">{avgConversion}%</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/15 flex items-center justify-center">
              <Clock size={18} className="text-[#00D4FF]" />
            </div>
            <div>
              <p className="text-xs text-white/50">Avg Response Time</p>
              <p className="font-display text-xl font-bold text-white">1.5h</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/15 flex items-center justify-center">
              <Users size={18} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-white/50">Repeat Buyers</p>
              <p className="font-display text-xl font-bold text-white">34%</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Gigs Grid */}
      {gigs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {gigs.map((gig, i) => (
            <motion.div
              key={gig.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <GigCard gig={gig} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20">
          <img src="/assets/empty-state.jpg" alt="No gigs" className="w-48 h-32 object-cover rounded-lg mb-4 opacity-60" />
          <h3 className="font-display text-xl font-semibold text-white/60">No gigs yet</h3>
          <p className="text-sm text-white/40 mt-1 mb-4">Create your first gig to start offering services.</p>
          <button
            onClick={() => navigate('/gigs/new')}
            className="px-6 h-10 rounded-lg gradient-purple text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Create Your First Gig
          </button>
        </div>
      )}
    </div>
  );
}
