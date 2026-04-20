import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Send, Paperclip, User, FileText, DollarSign } from 'lucide-react';
import { conversations, type Conversation } from '@/data/mockData';
import { useStore } from '@/store/useStore';

export function Inbox() {
  const [activeTab, setActiveTab] = useState<'inquiries' | 'order'>('inquiries');
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(conversations[0]);
  const [message, setMessage] = useState('');
  const [localMessages, setLocalMessages] = useState<Array<{ sender: 'buyer' | 'seller'; content: string; time: string }>>([]);
  const { addToast } = useStore();

  const filteredConversations = conversations.filter((c) => c.type === activeTab);

  const handleSend = () => {
    if (!message.trim()) return;
    setLocalMessages([...localMessages, { sender: 'seller', content: message, time: 'Just now' }]);
    setMessage('');
  };

  return (
    <div className="flex gap-0 -m-6 h-[calc(100vh-64px)]">
      {/* Left Sidebar */}
      <div className="w-[340px] border-r border-white/[0.06] flex flex-col" style={{ background: '#0D1233' }}>
        {/* Search */}
        <div className="p-4 border-b border-white/[0.06]">
          <div className="flex items-center h-10 rounded-lg bg-white/[0.04] border border-white/[0.06] px-3">
            <Search size={16} className="text-white/40 mr-3" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="bg-transparent border-none outline-none text-sm text-white placeholder:text-white/40 w-full"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/[0.06]">
          <button
            onClick={() => setActiveTab('inquiries')}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'inquiries' ? 'text-white' : 'text-white/50 hover:text-white/80'
            }`}
          >
            Inquiries (3)
            {activeTab === 'inquiries' && <motion.div layoutId="inboxTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00D4FF]" />}
          </button>
          <button
            onClick={() => setActiveTab('order')}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'order' ? 'text-white' : 'text-white/50 hover:text-white/80'
            }`}
          >
            Order Messages (5)
            {activeTab === 'order' && <motion.div layoutId="inboxTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00D4FF]" />}
          </button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {filteredConversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelectedConv(conv)}
              className={`w-full flex items-start gap-3 p-4 text-left border-b border-white/[0.03] transition-colors ${
                selectedConv?.id === conv.id
                  ? 'bg-[rgba(0,212,255,0.06)] border-l-[3px] border-l-[#00D4FF]'
                  : 'hover:bg-white/[0.03] border-l-[3px] border-l-transparent'
              }`}
            >
              <div className="relative flex-shrink-0">
                <img src={conv.buyer.avatar} alt={conv.buyer.name} className="w-11 h-11 rounded-full object-cover" />
                {conv.buyer.online && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0D1233]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={`text-sm truncate ${conv.unread > 0 ? 'text-white font-semibold' : 'text-white/80'}`}>
                    {conv.buyer.name}
                  </p>
                  <span className="text-[10px] text-white/40 flex-shrink-0 ml-2">{conv.timestamp}</span>
                </div>
                <p className={`text-xs truncate mt-0.5 ${conv.unread > 0 ? 'text-white/70 font-medium' : 'text-white/40'}`}>
                  {conv.lastMessage}
                </p>
              </div>
              {conv.unread > 0 && (
                <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold flex-shrink-0">
                  {conv.unread}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedConv ? (
          <>
            {/* Thread Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/[0.06]" style={{ background: '#0D1233' }}>
              <div className="flex items-center gap-3">
                <img src={selectedConv.buyer.avatar} alt={selectedConv.buyer.name} className="w-9 h-9 rounded-full object-cover" />
                <div>
                  <h3 className="text-sm font-semibold text-white">{selectedConv.buyer.name}</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-[10px] text-white/40">Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-white/[0.06] text-white/70 hover:bg-white/[0.1] text-xs transition-colors border border-white/[0.06]">
                  <User size={13} />
                  View Profile
                </button>
                {selectedConv.type === 'inquiry' && (
                  <button
                    onClick={() => addToast({ message: 'Custom offer feature coming soon!', type: 'info' })}
                    className="flex items-center gap-1.5 px-3 h-8 rounded-lg gradient-purple text-white text-xs hover:opacity-90 transition-opacity"
                  >
                    <DollarSign size={13} />
                    Convert to Order
                  </button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin">
              {/* Date separator */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-[10px] text-white/30">April 20, 2025</span>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </div>

              {(selectedConv.messages || []).concat(
                selectedConv.id === conversations[0]?.id ? localMessages : []
              ).map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'seller' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[65%] px-4 py-2.5 rounded-xl text-sm ${
                    msg.sender === 'seller'
                      ? 'gradient-purple text-white rounded-br-sm'
                      : 'bg-[#0D1233] border border-white/[0.06] text-white/90 rounded-bl-sm'
                  }`}>
                    <p>{msg.content}</p>
                    <p className={`text-[10px] mt-1 ${msg.sender === 'seller' ? 'text-white/60' : 'text-white/30'}`}>{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-white/[0.06] flex items-end gap-3" style={{ background: '#0D1233' }}>
              <button className="w-9 h-9 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.04] transition-colors flex-shrink-0">
                <Paperclip size={18} />
              </button>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Type a message..."
                className="flex-1 min-h-[40px] max-h-[100px] rounded-lg bg-white/[0.04] border border-white/[0.06] px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-[rgba(0,212,255,0.25)] outline-none resize-none transition-all"
              />
              <button
                onClick={handleSend}
                disabled={!message.trim()}
                className="w-9 h-9 rounded-lg gradient-purple flex items-center justify-center text-white hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
              >
                <Send size={16} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center">
            <FileText size={48} className="text-white/20 mb-4" />
            <h3 className="font-display text-lg font-semibold text-white/60">Select a conversation</h3>
            <p className="text-sm text-white/40 mt-1">Choose from the list to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}


