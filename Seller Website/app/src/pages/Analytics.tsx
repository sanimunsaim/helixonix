import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Eye, MousePointer, ShoppingCart, DollarSign, Star, CheckCircle,
  TrendingUp, MapPin
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';
import { GlassCard } from '@/components/shared/GlassCard';
import { KPICard } from '@/components/shared/KPICard';
import {
  analyticsOverview, trafficSources, geoBreakdown,
  listingPerformance, ratingDistribution
} from '@/data/mockData';

const overviewMetrics = [
  { label: 'Views', value: analyticsOverview.views, icon: Eye, iconColor: '#00D4FF' },
  { label: 'CTR', value: analyticsOverview.ctr, icon: MousePointer, iconColor: '#8B2FFF' },
  { label: 'Orders', value: String(analyticsOverview.orders), icon: ShoppingCart, iconColor: '#00D4FF' },
  { label: 'Revenue', value: analyticsOverview.revenue, icon: DollarSign, iconColor: '#8B2FFF' },
  { label: 'Avg Rating', value: String(analyticsOverview.avgRating), icon: Star, iconColor: '#F59E0B' },
  { label: 'Completion', value: analyticsOverview.completionRate, icon: CheckCircle, iconColor: '#10B981' },
];

const lineChartData = [
  { date: 'Apr 1', views: 320 },
  { date: 'Apr 3', views: 450 },
  { date: 'Apr 5', views: 280 },
  { date: 'Apr 7', views: 520 },
  { date: 'Apr 9', views: 410 },
  { date: 'Apr 11', views: 380 },
  { date: 'Apr 13', views: 600 },
  { date: 'Apr 15', views: 490 },
  { date: 'Apr 17', views: 720 },
  { date: 'Apr 19', views: 580 },
];

export function Analytics() {
  const [dateRange, setDateRange] = useState('30D');

  const totalReviews = ratingDistribution.reduce((sum, r) => sum + r.count, 0);
  const avgRating = (ratingDistribution.reduce((sum, r) => sum + r.stars * r.count, 0) / totalReviews).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header with date range */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {['7D', '30D', '90D', '1Y'].map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                dateRange === range
                  ? 'gradient-purple text-white'
                  : 'bg-white/[0.06] text-white/60 hover:text-white border border-white/[0.06]'
              }`}
            >
              {range === '7D' ? 'Last 7 days' : range === '30D' ? 'Last 30 days' : range === '90D' ? 'Last 90 days' : 'Last 12 months'}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {overviewMetrics.map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <KPICard
              label={metric.label}
              value={metric.value}
              icon={metric.icon}
              iconColor={metric.iconColor}
            />
          </motion.div>
        ))}
      </div>

      {/* Traffic Analytics */}
      <div className="flex flex-col lg:flex-row gap-4">
        <GlassCard className="flex-[3]">
          <h2 className="font-display text-lg font-semibold text-white mb-4">Views Over Time</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={lineChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: 'rgba(13, 18, 51, 0.95)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
              />
              <Line type="monotone" dataKey="views" stroke="#00D4FF" strokeWidth={2} dot={{ fill: '#00D4FF', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="flex-[2]">
          <h2 className="font-display text-lg font-semibold text-white mb-4">Traffic Sources</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={trafficSources} cx="50%" cy="50%" innerRadius="55%" outerRadius="80%" paddingAngle={3} dataKey="value">
                {trafficSources.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="#FFFFFF" fontSize={20} fontWeight={700} fontFamily="Rajdhani">
                12.4K
              </text>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {trafficSources.map((s) => (
              <div key={s.name} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-[11px] text-white/60">{s.name}</span>
                <span className="text-[11px] text-white font-medium">{s.value}%</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Geographic + Listing Performance */}
      <div className="flex flex-col lg:flex-row gap-4">
        <GlassCard className="flex-[2]">
          <h2 className="font-display text-lg font-semibold text-white mb-4">Top Countries</h2>
          <div className="space-y-3">
            {geoBreakdown.map((geo) => (
              <div key={geo.country} className="flex items-center gap-3">
                <MapPin size={14} className="text-white/30 flex-shrink-0" />
                <span className="text-xs text-white w-28 flex-shrink-0">{geo.country}</span>
                <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(geo.views / 4200) * 100}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, #8B2FFF, #E040FB)' }}
                  />
                </div>
                <span className="text-xs text-white/60 w-12 text-right">{geo.views.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="flex-[3]">
          <h2 className="font-display text-lg font-semibold text-white mb-4">Listing Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left text-[10px] text-white/50 uppercase font-medium py-2 px-3">Name</th>
                  <th className="text-right text-[10px] text-white/50 uppercase font-medium py-2 px-3">Views</th>
                  <th className="text-right text-[10px] text-white/50 uppercase font-medium py-2 px-3">Orders</th>
                  <th className="text-right text-[10px] text-white/50 uppercase font-medium py-2 px-3">Revenue</th>
                  <th className="text-right text-[10px] text-white/50 uppercase font-medium py-2 px-3">Rating</th>
                </tr>
              </thead>
              <tbody>
                {listingPerformance.map((item) => (
                  <tr key={item.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <img src={item.thumbnail} alt={item.name} className="w-8 h-8 rounded object-cover" />
                        <span className="text-xs text-white truncate max-w-[140px]">{item.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-xs text-white text-right">{item.views.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-xs text-white text-right">{item.orders}</td>
                    <td className="py-2.5 px-3 text-xs text-[#8B2FFF] font-semibold text-right">{item.revenue}</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="flex items-center justify-end gap-0.5 text-xs text-amber-400">
                        <Star size={11} className="fill-amber-400" /> {item.rating}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>

      {/* Review Analytics */}
      <div className="flex flex-col lg:flex-row gap-4">
        <GlassCard className="flex-[2]">
          <h2 className="font-display text-lg font-semibold text-white mb-4">Review Analytics</h2>
          <div className="flex items-center gap-6 mb-6">
            <div>
              <p className="font-display text-5xl font-bold text-white">{avgRating}</p>
              <div className="flex gap-0.5 mt-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={16} className={s <= Math.round(parseFloat(avgRating)) ? 'fill-amber-400 text-amber-400' : 'text-white/20'} />
                ))}
              </div>
              <p className="text-xs text-white/40 mt-1">Based on {totalReviews} reviews</p>
            </div>
          </div>
          <div className="space-y-2">
            {ratingDistribution.map((r) => (
              <div key={r.stars} className="flex items-center gap-3">
                <span className="text-xs text-white w-8">{r.stars} ★</span>
                <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(r.count / totalReviews) * 100}%` }}
                    transition={{ duration: 0.6, delay: r.stars * 0.1 }}
                    className="h-full rounded-full"
                    style={{
                      background: r.stars >= 4 ? '#10B981' : r.stars === 3 ? '#F59E0B' : '#EF4444'
                    }}
                  />
                </div>
                <span className="text-xs text-white/50 w-8 text-right">{r.count}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="flex-[3]">
          <h2 className="font-display text-lg font-semibold text-white mb-4">Competitor Insights</h2>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-purple-500/10 border border-purple-500/20 mb-4">
            <TrendingUp size={20} className="text-[#8B2FFF]" />
            <div>
              <p className="text-sm text-white font-medium">Your rank in Video Editing: <span className="text-[#8B2FFF] font-bold">#23 of 1,247</span></p>
              <p className="text-xs text-white/50">Top 2% in your category</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left text-[10px] text-white/50 uppercase font-medium py-2 px-3">Metric</th>
                  <th className="text-right text-[10px] text-white/50 uppercase font-medium py-2 px-3">You</th>
                  <th className="text-right text-[10px] text-white/50 uppercase font-medium py-2 px-3">Category Avg</th>
                  <th className="text-right text-[10px] text-white/50 uppercase font-medium py-2 px-3">Top 10%</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { metric: 'Avg Price', you: '$85', avg: '$72', top: '$120' },
                  { metric: 'Response Time', you: '2h', avg: '6h', top: '1h' },
                  { metric: 'Rating', you: '4.8', avg: '4.6', top: '4.9' },
                ].map((row) => (
                  <tr key={row.metric} className="border-b border-white/[0.03]">
                    <td className="py-2 px-3 text-xs text-white">{row.metric}</td>
                    <td className="py-2 px-3 text-xs text-[#8B2FFF] font-semibold text-right">{row.you}</td>
                    <td className="py-2 px-3 text-xs text-white/60 text-right">{row.avg}</td>
                    <td className="py-2 px-3 text-xs text-emerald-400 text-right">{row.top}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-3 rounded-lg bg-white/[0.04] border border-white/[0.06]">
            <p className="text-xs text-white/70">
              <span className="text-[#8B2FFF] font-semibold">💡 HELIX-BRAIN:</span> Increase your gig prices by 15% — you're undervalued compared to similar sellers. Add a video to your top gig to boost conversion by 40%.
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
