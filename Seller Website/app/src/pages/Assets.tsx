import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Upload, Pencil, Pause, Trash2, ExternalLink, Rocket, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { GlassCard } from '@/components/shared/GlassCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { assetApi } from '@/lib/api';
import { useStore } from '@/store/useStore';

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'published', label: 'Published' },
  { key: 'pending_review', label: 'Pending Review' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'draft', label: 'Draft' },
];

export function Assets() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null);
  const { addToast } = useStore();

  const { data: myAssetsResponse, isLoading } = useQuery({
    queryKey: ['my-assets'],
    queryFn: () => assetApi.myAssets(),
  });

  const assets = myAssetsResponse?.data || [];

  const filteredAssets = assets.filter((asset: any) => {
    const matchesTab = activeTab === 'all' || asset.status === activeTab;
    const matchesSearch = !searchQuery || asset.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getTabCount = (key: string) => {
    if (key === 'all') return assets.length;
    return assets.filter((a: any) => a.status === key).length;
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 w-[280px] h-10 rounded-lg bg-white/[0.04] border border-white/[0.06] px-3">
          <Search size={16} className="text-white/40" />
          <input
            type="text"
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm text-white placeholder:text-white/40 w-full"
          />
        </div>
        <button
          onClick={() => navigate('/upload/new')}
          className="flex items-center gap-2 px-5 h-10 rounded-lg gradient-purple text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Upload size={16} />
          Upload New Asset
        </button>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1 border-b border-white/[0.06]">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2.5 text-sm font-medium rounded-t-lg transition-colors relative ${
              activeTab === tab.key ? 'text-white' : 'text-white/50 hover:text-white/80'
            }`}
          >
            {tab.label}
            <span className={`ml-1.5 text-xs ${activeTab === tab.key ? 'text-white/70' : 'text-white/30'}`}>
              ({getTabCount(tab.key)})
            </span>
            {activeTab === tab.key && (
              <motion.div layoutId="assetTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00D4FF]" />
            )}
          </button>
        ))}
      </div>

      {/* Assets Table */}
      <GlassCard noPadding>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: '#0D1233' }}>
                <th className="text-left text-[11px] text-white/50 uppercase tracking-wider font-medium py-3 px-4">Preview</th>
                <th className="text-left text-[11px] text-white/50 uppercase tracking-wider font-medium py-3 px-4">Title</th>
                <th className="text-left text-[11px] text-white/50 uppercase tracking-wider font-medium py-3 px-4">Type</th>
                <th className="text-left text-[11px] text-white/50 uppercase tracking-wider font-medium py-3 px-4">Status</th>
                <th className="text-right text-[11px] text-white/50 uppercase tracking-wider font-medium py-3 px-4">Downloads</th>
                <th className="text-right text-[11px] text-white/50 uppercase tracking-wider font-medium py-3 px-4">Revenue</th>
                <th className="text-left text-[11px] text-white/50 uppercase tracking-wider font-medium py-3 px-4">Date</th>
                <th className="text-right text-[11px] text-white/50 uppercase tracking-wider font-medium py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map((asset) => (
                <tr key={asset.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4">
                    <img src={asset.thumbnailKey ? `http://localhost:3000/placeholder` : '/assets/empty-state.jpg'} alt={asset.title} className="w-12 h-8 rounded object-cover" />
                  </td>
                  <td className="py-3 px-4 text-sm text-white font-medium max-w-[200px] truncate">{asset.title}</td>
                  <td className="py-3 px-4"><span className="text-xs text-white/60">{asset.type}</span></td>
                  <td className="py-3 px-4"><StatusBadge status={asset.status} /></td>
                  <td className="py-3 px-4 text-sm text-white text-right">{asset.downloadCount?.toLocaleString() || 0}</td>
                  <td className="py-3 px-4 text-sm text-[#8B2FFF] font-semibold text-right">${asset.totalRevenue ? (asset.totalRevenue / 100).toLocaleString() : '-'}</td>
                  <td className="py-3 px-4 text-xs text-white/50">{new Date(asset.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <button className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors" title="Edit">
                        <Pencil size={14} />
                      </button>
                      <button className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors" title="Pause/Resume">
                        <Pause size={14} />
                      </button>
                      <button className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-red-400 hover:bg-white/[0.06] transition-colors" title="Delete">
                        <Trash2 size={14} />
                      </button>
                      <button className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors" title="View Public">
                        <ExternalLink size={14} />
                      </button>
                      <button className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-[#8B2FFF] hover:bg-white/[0.06] transition-colors" title="Boost">
                        <Rocket size={14} />
                      </button>
                      {asset.status === 'rejected' && (
                        <button
                          onClick={() => setSelectedAsset(asset)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-500/10 transition-colors"
                          title="View Reason"
                        >
                          <AlertCircle size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="animate-spin text-white/50" size={32} />
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <img src="/assets/empty-state.jpg" alt="No assets" className="w-48 h-32 object-cover rounded-lg mb-4 opacity-60" />
            <h3 className="font-display text-lg font-semibold text-white/60">No assets found</h3>
            <p className="text-sm text-white/40 mt-1">Upload your first asset to get started.</p>
          </div>
        ) : null}
      </GlassCard>

      {/* Rejection Reason Modal */}
      {selectedAsset && selectedAsset.rejectionReason && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setSelectedAsset(null)}>
          <div className="absolute inset-0 bg-[rgba(5,8,21,0.75)] backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-sm rounded-xl border border-white/[0.06] shadow-2xl overflow-hidden"
            style={{ background: '#0D1233' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-white/[0.06]">
              <h2 className="font-display text-lg font-semibold text-white flex items-center gap-2">
                <AlertCircle size={18} className="text-red-400" />
                Rejection Reason
              </h2>
            </div>
            <div className="p-5">
              <p className="text-sm text-white/80">{selectedAsset.rejectionReason}</p>
              <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-xs text-red-400">AI scores flagged: Preview Quality, Metadata Completeness</p>
              </div>
            </div>
            <div className="p-4 border-t border-white/[0.06] flex justify-end">
              <button
                onClick={() => { setSelectedAsset(null); addToast({ message: 'Navigating to edit...', type: 'info' }); }}
                className="px-5 h-10 rounded-lg gradient-purple text-white text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Edit & Resubmit
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
