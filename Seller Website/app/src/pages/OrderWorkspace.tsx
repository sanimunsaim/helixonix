import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  ArrowLeft, Clock, FileText, Send, Paperclip, CheckCircle,
  Circle, Star
} from 'lucide-react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { orders } from '@/data/mockData';

export function OrderWorkspace() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'buyer' | 'seller'; content: string; time: string }>>([]);

  const order = orders.find((o) => o.id === id) || orders[0];

  const timelineSteps = order.timeline || [
    { step: 'Order Placed', completed: true, date: 'Apr 15, 2:30 PM' },
    { step: 'Requirements Submitted', completed: true, date: 'Apr 15, 3:00 PM' },
    { step: 'In Progress', completed: false },
    { step: 'Delivered', completed: false },
    { step: 'Completed', completed: false },
  ];

  const deadline = new Date(order.deadline);
  const now = new Date();
  const hoursLeft = Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60 * 60));
  const isUrgent = hoursLeft < 24;

  const handleSendMessage = () => {
    if (!message.trim()) return;
    setMessages([...messages, { sender: 'seller', content: message, time: 'Just now' }]);
    setMessage('');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-0 h-[calc(100vh-112px)] -m-6">
      {/* Left Panel */}
      <div className="w-full lg:w-[380px] border-r border-white/[0.06] overflow-y-auto scrollbar-thin" style={{ background: 'rgba(13,18,51,0.5)' }}>
        {/* Header */}
        <div className="sticky top-0 p-5 border-b border-white/[0.06]" style={{ background: '#0D1233' }}>
          <button
            onClick={() => navigate('/dashboard/orders')}
            className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors mb-3"
          >
            <ArrowLeft size={16} />
            Back to Orders
          </button>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-white font-mono">{order.id}</h2>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-xs text-white/40 mt-1">Created {order.createdAt}</p>
        </div>

        {/* Buyer Info */}
        <div className="p-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <img src={order.buyer.avatar} alt={order.buyer.name} className="w-12 h-12 rounded-full object-cover" />
            <div>
              <h3 className="text-base font-semibold text-white">{order.buyer.name}</h3>
              <div className="flex items-center gap-2 text-xs text-white/50">
                <span className="flex items-center gap-0.5 text-amber-400">
                  <Star size={12} className="fill-amber-400" /> {order.buyer.rating}
                </span>
                <span>• {order.buyer.totalOrders} orders</span>
              </div>
            </div>
          </div>
        </div>

        {/* Package Details */}
        <div className="p-5 border-b border-white/[0.06]">
          <h3 className="font-display text-sm font-semibold text-white mb-3">Package: {order.package}</h3>
          <p className="text-xs text-white/50 mb-2">{order.gig}</p>
          <div className="space-y-1.5">
            {['1080p HD delivery', '3 revisions', 'Source files included', '3-day delivery'].map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-xs text-white/70">
                <CheckCircle size={12} className="text-emerald-400" />
                {feature}
              </div>
            ))}
          </div>
        </div>

        {/* Requirements */}
        {order.requirements && (
          <div className="p-5 border-b border-white/[0.06]">
            <h3 className="font-display text-sm font-semibold text-white mb-3">Requirements</h3>
            {order.requirements.map((req, idx) => (
              <div key={idx} className="mb-2">
                <p className="text-xs text-white/70 font-medium">{req.question}</p>
                <p className="text-xs text-white/50">{req.answer}</p>
              </div>
            ))}
          </div>
        )}

        {/* Timeline */}
        <div className="p-5 border-b border-white/[0.06]">
          <h3 className="font-display text-sm font-semibold text-white mb-3">Timeline</h3>
          <div className="space-y-0">
            {timelineSteps.map((step, idx) => (
              <div key={idx} className="flex gap-3">
                <div className="flex flex-col items-center">
                  {step.completed ? (
                    <CheckCircle size={18} className="text-emerald-400" />
                  ) : idx === timelineSteps.findIndex((s) => !s.completed) ? (
                    <div className="w-[18px] h-[18px] rounded-full border-2 border-[#00D4FF] bg-[#00D4FF]/20 animate-pulse" />
                  ) : (
                    <Circle size={18} className="text-white/20" />
                  )}
                  {idx < timelineSteps.length - 1 && (
                    <div className={`w-0.5 h-6 ${step.completed ? 'bg-emerald-400/40' : 'bg-white/[0.06]'}`} />
                  )}
                </div>
                <div className="pb-4">
                  <p className={`text-xs ${step.completed ? 'text-white' : 'text-white/40'}`}>{step.step}</p>
                  {step.date && <p className="text-[10px] text-white/30">{step.date}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Deadline */}
        <div className={`mx-5 my-4 p-4 rounded-lg ${isUrgent ? 'bg-red-500/10 border border-red-500/30' : 'bg-[#0D1233]'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Clock size={14} className={isUrgent ? 'text-red-400' : 'text-white/50'} />
            <span className={`text-xs font-medium ${isUrgent ? 'text-red-400' : 'text-white/50'}`}>Deadline</span>
          </div>
          <p className={`font-display text-lg font-bold ${isUrgent ? 'text-red-400' : 'text-white'}`}>
            {isUrgent ? `${hoursLeft}h left` : `${Math.floor(hoursLeft / 24)}d ${hoursLeft % 24}h left`}
          </p>
        </div>

        {/* Amount Breakdown */}
        <div className="p-5">
          <h3 className="font-display text-sm font-semibold text-white mb-3">Amount Breakdown</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-white/70">
              <span>Order Total</span>
              <span>${order.amount}.00</span>
            </div>
            <div className="flex justify-between text-red-400">
              <span>Platform Fee (20%)</span>
              <span>-${order.platformFee}.00</span>
            </div>
            <div className="border-t border-white/[0.06] pt-2 flex justify-between">
              <span className="text-white font-medium">Your Earnings</span>
              <span className="text-[#8B2FFF] font-display text-base font-bold">${order.earnings}.00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <img src={order.buyer.avatar} alt={order.buyer.name} className="w-9 h-9 rounded-full object-cover" />
              <div>
                <h3 className="text-sm font-semibold text-white">{order.buyer.name}</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[10px] text-white/40">Online</span>
                </div>
              </div>
            </div>
          </div>

          {/* Message history */}
          {(order.messages || []).concat(messages).map((msg, idx) => (
            <div key={idx} className={`flex ${msg.sender === 'seller' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] px-4 py-2.5 rounded-xl text-sm ${
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

        {/* Delivery Section */}
        {order.status === 'active' && (
          <div className="border-t border-white/[0.06] p-5">
            <div className="flex items-center gap-2 mb-3">
              <FileText size={16} className="text-[#00D4FF]" />
              <h3 className="font-display text-sm font-semibold text-white">Submit Delivery</h3>
            </div>
            <div className="border-2 border-dashed border-white/[0.06] rounded-lg p-6 text-center hover:border-[rgba(0,212,255,0.25)] transition-colors">
              <Paperclip size={24} className="text-white/30 mx-auto mb-2" />
              <p className="text-sm text-white/60">Drop files here or click to attach</p>
              <p className="text-xs text-white/30 mt-1">Max 500MB total</p>
            </div>
            <textarea
              placeholder="Describe what you're delivering..."
              className="w-full mt-3 h-20 rounded-lg bg-white/[0.04] border border-white/[0.06] px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-[rgba(0,212,255,0.25)] focus:shadow-[0_0_15px_rgba(0,212,255,0.15)] outline-none resize-none transition-all"
            />
            <button className="w-full mt-3 py-2.5 gradient-purple text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
              Deliver Now
            </button>
          </div>
        )}

        {/* Message Input */}
        {order.status !== 'completed' && (
          <div className="border-t border-white/[0.06] p-4 flex items-end gap-3" style={{ background: '#0D1233' }}>
            <button className="w-9 h-9 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.04] transition-colors flex-shrink-0">
              <Paperclip size={18} />
            </button>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
              placeholder="Type a message..."
              className="flex-1 min-h-[40px] max-h-[100px] rounded-lg bg-white/[0.04] border border-white/[0.06] px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-[rgba(0,212,255,0.25)] outline-none resize-none transition-all"
            />
            <button
              onClick={handleSendMessage}
              disabled={!message.trim()}
              className="w-9 h-9 rounded-lg gradient-purple flex items-center justify-center text-white hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            >
              <Send size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


