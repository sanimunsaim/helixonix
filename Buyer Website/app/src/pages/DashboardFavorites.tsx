import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useAssets } from '@/hooks/useAssets';
import AssetCard from '@/components/shared/AssetCard';

const mockBoards = [
  { id: 'b1', name: 'Brand Project', count: 12, images: ['/images/asset-template-1.jpg', '/images/asset-image-1.jpg', '/images/asset-abstract-1.jpg', '/images/asset-geo-1.jpg'] },
  { id: 'b2', name: 'Social Media', count: 8, images: ['/images/asset-photo-1.jpg', '/images/asset-ui-1.jpg', '/images/asset-font-1.jpg', '/images/asset-template-1.jpg'] },
  { id: 'b3', name: 'Video Assets', count: 5, images: ['/images/asset-video-1.jpg', '/images/asset-3d-1.jpg', '/images/collection-motion.jpg', '/images/asset-image-1.jpg'] },
];

export default function DashboardFavorites() {
  const { data: assets } = useAssets({ sort: 'trending', limit: 8 });
  const [showCreate, setShowCreate] = useState(false);
  const [boardName, setBoardName] = useState('');
  const [boards, setBoards] = useState(mockBoards);
  const [activeBoard, setActiveBoard] = useState<string | null>(null);

  const createBoard = () => {
    if (!boardName.trim()) return;
    setBoards((prev) => [...prev, { id: `b${Date.now()}`, name: boardName, count: 0, images: [] }]);
    setBoardName('');
    setShowCreate(false);
  };

  const activeBoardData = boards.find((b) => b.id === activeBoard);

  return (
    <div className="min-h-screen bg-[#050815] pt-8 pb-20">
      <div className="page-gutter max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-heading font-bold text-2xl text-white">Collections & Boards</h1>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00D4FF] to-[#8B2FFF] text-white rounded-button text-sm font-heading font-semibold">
            <Plus size={16} /> Create Board
          </button>
        </div>

        {/* Create Modal */}
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="glass-surface-strong rounded-card-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-bold text-white">Create New Board</h3>
                <button onClick={() => setShowCreate(false)} className="text-[#8892B0] hover:text-white"><X size={20} /></button>
              </div>
              <input
                type="text" value={boardName} onChange={(e) => setBoardName(e.target.value)}
                placeholder="Board name"
                className="w-full h-12 px-4 bg-[#0D1233] border border-[rgba(0,212,255,0.15)] rounded-card text-white placeholder:text-[#8892B0] focus:border-[#00D4FF] outline-none mb-4"
              />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowCreate(false)} className="px-4 py-2 glass-surface rounded-button text-sm text-[#8892B0]">Cancel</button>
                <button onClick={createBoard} className="px-4 py-2 bg-[#00D4FF] text-[#050815] rounded-button text-sm font-heading font-semibold">Create</button>
              </div>
            </div>
          </div>
        )}

        {/* Boards Grid */}
        {!activeBoard ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {boards.map((board) => (
              <button key={board.id} onClick={() => setActiveBoard(board.id)} className="glass-surface rounded-card-lg p-4 text-left hover:border-[rgba(0,212,255,0.5)] transition-all group">
                <div className="grid grid-cols-2 gap-1 mb-3 rounded-card overflow-hidden aspect-square">
                  {board.images.map((img, i) => <img key={i} src={img} alt="" className="w-full h-full object-cover" />)}
                </div>
                <h3 className="font-heading font-semibold text-white group-hover:text-[#00D4FF] transition-colors">{board.name}</h3>
                <p className="text-xs text-[#8892B0]">{board.count} items</p>
              </button>
            ))}
          </div>
        ) : (
          <div>
            <button onClick={() => setActiveBoard(null)} className="text-sm text-[#00D4FF] mb-4 hover:underline">&larr; Back to Boards</button>
            <h2 className="font-heading font-bold text-xl text-white mb-4">{activeBoardData?.name}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {assets?.items.map((asset) => <AssetCard key={asset.id} asset={asset} variant="compact" />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
