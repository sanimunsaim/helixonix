import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  DollarSign, ShoppingCart, Wallet, Eye, Upload, Plus,
  MessageCircle, FileText, Star, DollarSign as DollarIcon,
  CheckCircle, AlertTriangle
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';
import { KPICard } from '@/components/shared/KPICard';
import { GlassCard } from '@/components/shared/GlassCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useStore } from '@/store/useStore';
import {
  dashboardKPIs, revenueChartData, orderBreakdown, activityFeed, topPerformers
} from '@/data/mockData';

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.3, delay: i * 0.05, ease: 'easeOut' as const }
  })
};

const MiniSparkline = () => (
  <ResponsiveContainer width={100} height={36}>
    <AreaChart data={revenueChartData.slice(-7)}>
      <Area type="monotone" dataKey="revenue" stroke="#8B2FFF" strokeWidth={1.5}
        fill="rgba(139,47,255,0.1)" />
    </AreaChart>
  </ResponsiveContainer>
);

export function Dashboard() {
  const navigate = useNavigate();
  const { unreadMessages, addToast } = useStore();

  const quickActions = [
    { label: 'Upload New Asset', icon: Upload, path: '/upload/new', variant: 'primary' as const },
    { label: 'Create New Gig', icon: Plus, path: '/gigs/new', variant: 'primary' as const },
    { label: 'Check Messages', icon: MessageCircle, path: '/dashboard/inbox', variant: 'secondary' as const, badge: unreadMessages },
    { label: 'Request Payout', icon: Wallet, path: '/dashboard/earnings', variant: 'secondary' as const },
  ];

  const activityIcons: Record<string, React.ElementType> = {
    order: ShoppingCart,
    review: Star,
    payout: DollarIcon,
    asset: FileText,
    inquiry: Eye,
    revision: AlertTriangle,
    gig: FileText,
    system: CheckCircle,
  };

  const activityColors: Record<string, string> = {
    order: '#00D4FF',
    review: '#F59E0B',
    payout: '#10B981',
    asset: '#8B2FFF',
    inquiry: '#3B82F6',
    revision: '#EF4444',
    gig: '#E040FB',
    system: '#6B7280',
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <motion.div custom={0} variants={cardVariants} initial="hidden" animate="visible">
          <KPICard
            label="This Month's Revenue"
            value={dashboardKPIs.revenue.value}
            change={dashboardKPIs.revenue.change}
            changeLabel="vs last month"
            icon={DollarSign}
            iconColor="#8B2FFF"
            sparkline={<MiniSparkline />}
            onClick={() => navigate('/dashboard/earnings')}
          />
        </motion.div>
        <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible">
          <KPICard
            label="Active Orders"
            value={dashboardKPIs.activeOrders.value}
            change={dashboardKPIs.activeOrders.change}
            changeLabel="from last week"
            icon={ShoppingCart}
            iconColor="#00D4FF"
            onClick={() => navigate('/dashboard/orders')}
          />
        </motion.div>
        <motion.div custom={2} variants={cardVariants} initial="hidden" animate="visible">
          <KPICard
            label="Pending Payouts"
            value={dashboardKPIs.pendingPayouts.value}
            icon={Wallet}
            iconColor="#E040FB"
            subtext={dashboardKPIs.pendingPayouts.subtext}
            onClick={() => navigate('/dashboard/earnings')}
          />
        </motion.div>
        <motion.div custom={3} variants={cardVariants} initial="hidden" animate="visible">
          <KPICard
            label="Profile Views"
            value={dashboardKPIs.profileViews.value}
            change={dashboardKPIs.profileViews.change}
            changeLabel="vs last week"
            icon={Eye}
            iconColor="#3B82F6"
            onClick={() => navigate('/dashboard/analytics')}
          />
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Revenue Trend */}
        <motion.div custom={4} variants={cardVariants} initial="hidden" animate="visible" className="flex-[3]">
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold text-white">Revenue Trend</h2>
              <div className="flex gap-1">
                {['7D', '30D', '90D', '1Y'].map((range) => (
                  <button
                    key={range}
                    onClick={() => addToast({ message: `Switched to ${range} view`, type: 'info' })}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      range === '30D'
                        ? 'gradient-purple text-white'
                        : 'bg-white/[0.04] text-white/50 hover:text-white hover:bg-white/[0.08]'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenueChartData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B2FFF" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#8B2FFF" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(13, 18, 51, 0.95)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '13px',
                  }}
                  formatter={(value: number) => [`$${value}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#8B2FFF" strokeWidth={2} fill="url(#revenueGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>

        {/* Order Breakdown */}
        <motion.div custom={5} variants={cardVariants} initial="hidden" animate="visible" className="flex-[2]">
          <GlassCard>
            <h2 className="font-display text-lg font-semibold text-white mb-4">Order Breakdown</h2>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={orderBreakdown}
                  cx="50%" cy="50%"
                  innerRadius="60%"
                  outerRadius="80%"
                  paddingAngle={4}
                  dataKey="value"
                >
                  {orderBreakdown.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="#FFFFFF" fontSize={28} fontWeight={700} fontFamily="Rajdhani">
                  24
                </text>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {orderBreakdown.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-white/60">{item.name}</span>
                  <span className="text-xs text-white font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Activity + Quick Actions Row */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Activity Feed */}
        <motion.div custom={6} variants={cardVariants} initial="hidden" animate="visible" className="flex-[3]">
          <GlassCard>
            <h2 className="font-display text-lg font-semibold text-white mb-4">Recent Activity</h2>
            <div className="space-y-0 max-h-[320px] overflow-y-auto scrollbar-thin pr-2">
              {activityFeed.map((activity, idx) => {
                const Icon = activityIcons[activity.type] || CheckCircle;
                return (
                  <div key={activity.id} className={`flex items-start gap-3 py-3 ${idx !== activityFeed.length - 1 ? 'border-b border-white/[0.04]' : ''}`}>
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: `${activityColors[activity.type]}15` }}
                    >
                      <Icon size={15} style={{ color: activityColors[activity.type] }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/90 truncate">{activity.message}</p>
                      <p className="text-xs text-white/40 mt-0.5">{activity.time}</p>
                    </div>
                    <span className={`text-xs font-medium flex-shrink-0 ${activity.type === 'revision' ? 'text-red-400' : 'text-white/60'}`}>
                      {activity.detail}
                    </span>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </motion.div>

        {/* Quick Actions */}
        <motion.div custom={7} variants={cardVariants} initial="hidden" animate="visible" className="flex-[2]">
          <GlassCard>
            <h2 className="font-display text-lg font-semibold text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  className={`w-full flex items-center gap-3 px-4 h-11 rounded-lg text-sm font-semibold transition-all ${
                    action.variant === 'primary'
                      ? 'gradient-purple text-white hover:opacity-90'
                      : 'bg-white/[0.06] text-white hover:bg-white/[0.1] border border-white/[0.06]'
                  }`}
                >
                  <action.icon size={18} />
                  <span className="flex-1 text-left">{action.label}</span>
                  {action.badge ? (
                    <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                      {action.badge}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Top Performers Table */}
      <motion.div custom={8} variants={cardVariants} initial="hidden" animate="visible">
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-lg font-semibold text-white">Top Performers This Month</h2>
              <p className="text-xs text-white/40 mt-0.5">Your best-selling assets and gigs</p>
            </div>
            <button
              onClick={() => navigate('/dashboard/analytics')}
              className="text-xs text-[#00D4FF] hover:underline"
            >
              View All →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left text-[11px] text-white/50 uppercase tracking-wider font-medium py-3 px-4">Name</th>
                  <th className="text-left text-[11px] text-white/50 uppercase tracking-wider font-medium py-3 px-4">Type</th>
                  <th className="text-right text-[11px] text-white/50 uppercase tracking-wider font-medium py-3 px-4">Sales</th>
                  <th className="text-right text-[11px] text-white/50 uppercase tracking-wider font-medium py-3 px-4">Revenue</th>
                  <th className="text-right text-[11px] text-white/50 uppercase tracking-wider font-medium py-3 px-4">Rating</th>
                </tr>
              </thead>
              <tbody>
                {topPerformers.map((item) => (
                  <tr key={item.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 text-sm text-white font-medium">{item.name}</td>
                    <td className="py-3 px-4"><StatusBadge status={item.type.toLowerCase()} /></td>
                    <td className="py-3 px-4 text-sm text-white text-right">{item.sales}</td>
                    <td className="py-3 px-4 text-sm text-white font-semibold text-right">{item.revenue}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="flex items-center justify-end gap-1 text-sm text-amber-400">
                        <Star size={13} className="fill-amber-400" /> {item.rating}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
