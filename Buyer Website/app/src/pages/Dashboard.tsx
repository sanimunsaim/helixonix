import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useAssets } from '@/hooks/useAssets';
import { Sparkles, Search, Users, Zap, ShoppingBag, Download, Heart, TrendingUp, Clock } from 'lucide-react';
import AssetCard from '@/components/shared/AssetCard';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { data: assets } = useAssets({ sort: 'trending', limit: 4 });

  const stats = [
    { icon: Zap, label: 'Credits', value: user?.credits || 0, color: 'text-[#00D4FF]', href: '/dashboard/billing' },
    { icon: ShoppingBag, label: 'Active Orders', value: 3, color: 'text-[#E040FB]', href: '/dashboard/orders' },
    { icon: Download, label: 'Downloads', value: user?.downloads || 0, color: 'text-[#00E676]', href: '/dashboard/library' },
    { icon: Heart, label: 'Saved', value: user?.savedItems || 0, color: 'text-[#FFD600]', href: '/dashboard/favorites' },
  ];

  const quickActions = [
    { icon: Sparkles, label: 'Generate AI', desc: 'Create with AI', href: '/ai-studio', color: 'from-[#00D4FF] to-[#8B2FFF]' },
    { icon: Search, label: 'Browse Assets', desc: '200K+ resources', href: '/explore', color: 'from-[#8B2FFF] to-[#E040FB]' },
    { icon: Users, label: 'Hire Creator', desc: 'Top talent', href: '/services', color: 'from-[#E040FB] to-[#00D4FF]' },
  ];

  const recentActivity = [
    { icon: Download, text: 'Downloaded "Neon Social Pack"', time: '2h ago', color: 'text-[#00D4FF]' },
    { icon: ShoppingBag, text: 'Order #4821 placed with Maya Chen', time: '5h ago', color: 'text-[#00E676]' },
    { icon: Sparkles, text: 'Generated AI image "Cyber City"', time: '1d ago', color: 'text-[#E040FB]' },
    { icon: Heart, text: 'Saved "Crystal 3D Collection" to favorites', time: '1d ago', color: 'text-[#FFD600]' },
    { icon: TrendingUp, text: 'Upgraded to Pro plan', time: '3d ago', color: 'text-[#00D4FF]' },
  ];

  return (
    <div className="min-h-screen bg-[#050815] pt-8 pb-20">
      <div className="page-gutter max-w-6xl mx-auto">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="font-heading font-bold text-2xl md:text-3xl text-white mb-1">
            Hello, {user?.name?.split(' ')[0] || 'Creator'}. <span className="text-[#8892B0]">Ready to create?</span>
          </h1>
          <p className="text-sm text-[#8892B0]">Here&apos;s what&apos;s happening with your account</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <Link key={stat.label} to={stat.href} className="card-hover glass-surface rounded-card p-5 block group">
              <stat.icon size={22} className={cn('mb-3', stat.color)} />
              <p className="font-mono text-2xl text-white font-bold group-hover:text-[#00D4FF] transition-colors">{stat.value}</p>
              <p className="text-xs text-[#8892B0]">{stat.label}</p>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {quickActions.map((action) => (
            <Link key={action.label} to={action.href} className="group relative overflow-hidden rounded-card-lg p-6 transition-all hover:scale-[1.02]">
              <div className={cn('absolute inset-0 bg-gradient-to-br opacity-20', action.color)} />
              <div className="absolute inset-0 glass-surface" />
              <div className="relative z-10">
                <action.icon size={28} className="text-[#00D4FF] mb-3" />
                <h3 className="font-heading font-bold text-white group-hover:text-[#00D4FF] transition-colors">{action.label}</h3>
                <p className="text-xs text-[#8892B0]">{action.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
          {/* Left Column */}
          <div>
            {/* Recent Activity */}
            <div className="glass-surface rounded-card p-6 mb-8">
              <h3 className="font-heading font-bold text-white mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivity.map((activity, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#0D1233] flex items-center justify-center flex-shrink-0">
                      <activity.icon size={14} className={activity.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white">{activity.text}</p>
                      <p className="text-xs text-[#8892B0]">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* For You */}
            <div>
              <h3 className="font-heading font-bold text-white mb-4">For You</h3>
              <div className="grid grid-cols-2 gap-4">
                {assets?.items.map((asset) => <AssetCard key={asset.id} asset={asset} variant="compact" />)}
              </div>
            </div>
          </div>

          {/* Right Column - Active Orders */}
          <div>
            <div className="glass-surface rounded-card p-6">
              <h3 className="font-heading font-bold text-white mb-4">Active Orders</h3>
              <div className="space-y-3">
                {[
                  { title: 'Brand Identity Package', seller: 'Maya Chen', status: 'In Progress', deadline: '2 days', progress: 60 },
                  { title: 'Commercial Video Edit', seller: 'James Wilson', status: 'Revision', deadline: '5 days', progress: 80 },
                  { title: '3D Product Render', seller: 'Alex Rivera', status: 'Delivered', deadline: 'Review', progress: 100 },
                ].map((order, i) => (
                  <div key={i} className="p-3 rounded-card bg-[#0D1233] border border-[rgba(0,212,255,0.1)]">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-white font-medium truncate">{order.title}</p>
                      <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-mono', order.status === 'Delivered' ? 'bg-[#00E676]/20 text-[#00E676]' : 'bg-[#00D4FF]/20 text-[#00D4FF]')}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#8892B0] mb-2">{order.seller}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-[#0A0F2E] rounded-full overflow-hidden">
                        <div className={cn('h-full rounded-full', order.progress === 100 ? 'bg-[#00E676]' : 'bg-gradient-to-r from-[#00D4FF] to-[#8B2FFF]')} style={{ width: `${order.progress}%` }} />
                      </div>
                      <span className="flex items-center gap-1 text-[10px] text-[#8892B0]"><Clock size={10} /> {order.deadline}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
