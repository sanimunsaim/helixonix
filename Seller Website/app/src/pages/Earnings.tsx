import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet, Info, Download, ChevronLeft, ChevronRight,
  DollarSign
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, ResponsiveContainer, Legend
} from 'recharts';
import { GlassCard } from '@/components/shared/GlassCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import {
  earningsSummary, earningsTransactions, payoutHistory, revenueBySource
} from '@/data/mockData';
import { useStore } from '@/store/useStore';

export function Earnings() {
  const [timeRange, setTimeRange] = useState('30D');
  const [currentPage, setCurrentPage] = useState(1);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const { addToast } = useStore();

  const itemsPerPage = 10;
  const totalPages = Math.ceil(earningsTransactions.length / itemsPerPage);
  const paginatedTransactions = earningsTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePayoutRequest = () => {
    const amount = parseFloat(payoutAmount);
    if (amount < 50) {
      addToast({ message: 'Minimum payout amount is $50', type: 'error' });
      return;
    }
    if (amount > earningsSummary.availableBalance) {
      addToast({ message: 'Amount exceeds available balance', type: 'error' });
      return;
    }
    addToast({ message: `Payout request of $${amount.toFixed(2)} submitted!`, type: 'success' });
    setShowPayoutModal(false);
    setPayoutAmount('');
  };

  const chartData = [
    { date: 'Apr 1', revenue: 120 },
    { date: 'Apr 3', revenue: 180 },
    { date: 'Apr 5', revenue: 95 },
    { date: 'Apr 7', revenue: 240 },
    { date: 'Apr 9', revenue: 310 },
    { date: 'Apr 11', revenue: 160 },
    { date: 'Apr 13', revenue: 280 },
    { date: 'Apr 15', revenue: 420 },
    { date: 'Apr 17', revenue: 190 },
    { date: 'Apr 19', revenue: 350 },
  ];

  return (
    <div className="space-y-6">
      {/* Balance Summary */}
      <GlassCard className="!p-7">
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 flex-1">
            <div>
              <p className="text-sm text-white/50 mb-1">Available Balance</p>
              <p className="font-display text-4xl font-bold text-[#8B2FFF]">
                ${earningsSummary.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-emerald-400 mt-1">Ready to withdraw</p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <p className="text-sm text-white/50">Pending Clearance</p>
                <div className="group relative">
                  <Info size={13} className="text-white/30 cursor-help" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-md bg-[#0D1233] border border-white/[0.06] text-xs text-white/80 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    Released 7 days after order completion
                  </div>
                </div>
              </div>
              <p className="font-display text-2xl font-bold text-amber-400">
                ${earningsSummary.pendingClearance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-sm text-white/50 mb-1">Total Earned (All Time)</p>
              <p className="font-display text-2xl font-bold text-white">
                ${earningsSummary.totalEarned.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowPayoutModal(true)}
            disabled={earningsSummary.availableBalance < earningsSummary.minPayout}
            className={`px-6 h-12 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${
              earningsSummary.availableBalance >= earningsSummary.minPayout
                ? 'gradient-purple text-white hover:opacity-90'
                : 'bg-white/[0.06] text-white/40 cursor-not-allowed'
            }`}
            title={earningsSummary.availableBalance < earningsSummary.minPayout ? 'Minimum payout is $50' : ''}
          >
            <Wallet size={18} />
            Request Payout
          </button>
        </div>
      </GlassCard>

      {/* Revenue Charts */}
      <div className="flex flex-col lg:flex-row gap-4">
        <GlassCard className="flex-[3]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold text-white">Revenue Over Time</h2>
            <div className="flex gap-1">
              {['7D', '30D', '90D', '1Y'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    timeRange === range
                      ? 'gradient-purple text-white'
                      : 'bg-white/[0.04] text-white/50 hover:text-white'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
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
              <Area type="monotone" dataKey="revenue" stroke="#8B2FFF" strokeWidth={2} fill="url(#earningsGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="flex-[2]">
          <h2 className="font-display text-lg font-semibold text-white mb-4">Revenue by Source</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueBySource}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(13, 18, 51, 0.95)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '13px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }} />
              <Bar dataKey="assets" fill="#00D4FF" radius={[4, 4, 0, 0]} />
              <Bar dataKey="services" fill="#8B2FFF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      {/* Earnings Table */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold text-white">Earnings History</h2>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.06] text-white/70 hover:bg-white/[0.1] text-xs font-medium transition-colors border border-white/[0.06]">
            <Download size={14} />
            Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]" style={{ background: '#0D1233' }}>
                <th className="text-left text-[11px] text-white/50 uppercase tracking-wider font-medium py-3 px-4">Date</th>
                <th className="text-left text-[11px] text-white/50 uppercase tracking-wider font-medium py-3 px-4">Order #</th>
                <th className="text-left text-[11px] text-white/50 uppercase tracking-wider font-medium py-3 px-4">Item</th>
                <th className="text-right text-[11px] text-white/50 uppercase tracking-wider font-medium py-3 px-4">Gross</th>
                <th className="text-right text-[11px] text-white/50 uppercase tracking-wider font-medium py-3 px-4">Fee</th>
                <th className="text-right text-[11px] text-white/50 uppercase tracking-wider font-medium py-3 px-4">Net</th>
                <th className="text-right text-[11px] text-white/50 uppercase tracking-wider font-medium py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTransactions.map((tx) => (
                <tr key={tx.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 text-xs text-white/70">{tx.date}</td>
                  <td className="py-3 px-4 font-mono text-xs text-white/50">{tx.orderId}</td>
                  <td className="py-3 px-4 text-sm text-white">{tx.item}</td>
                  <td className="py-3 px-4 text-sm text-white text-right">${tx.gross}</td>
                  <td className="py-3 px-4 text-sm text-red-400 text-right">-${tx.fee}</td>
                  <td className="py-3 px-4 text-sm text-[#8B2FFF] font-semibold text-right">${tx.net}</td>
                  <td className="py-3 px-4 text-right"><StatusBadge status={tx.status.toLowerCase()} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-white/[0.06]">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.04] disabled:opacity-30 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                currentPage === i + 1
                  ? 'gradient-purple text-white'
                  : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.04] disabled:opacity-30 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </GlassCard>

      {/* Payout History */}
      <GlassCard>
        <h2 className="font-display text-lg font-semibold text-white mb-4">Payout History</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]" style={{ background: '#0D1233' }}>
                <th className="text-left text-[11px] text-white/50 uppercase tracking-wider font-medium py-3 px-4">Date</th>
                <th className="text-right text-[11px] text-white/50 uppercase tracking-wider font-medium py-3 px-4">Amount</th>
                <th className="text-left text-[11px] text-white/50 uppercase tracking-wider font-medium py-3 px-4">Method</th>
                <th className="text-right text-[11px] text-white/50 uppercase tracking-wider font-medium py-3 px-4">Status</th>
                <th className="text-left text-[11px] text-white/50 uppercase tracking-wider font-medium py-3 px-4">Reference #</th>
                <th className="text-right text-[11px] text-white/50 uppercase tracking-wider font-medium py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payoutHistory.map((po) => (
                <tr key={po.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 text-xs text-white/70">{po.date}</td>
                  <td className="py-3 px-4 font-display text-base font-semibold text-white text-right">
                    ${po.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-sm text-white">{po.method}</td>
                  <td className="py-3 px-4 text-right"><StatusBadge status={po.status.toLowerCase()} /></td>
                  <td className="py-3 px-4 font-mono text-xs text-white/50">{po.reference}</td>
                  <td className="py-3 px-4 text-right">
                    <button className="text-xs text-[#00D4FF] hover:underline">Statement</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Payout Request Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setShowPayoutModal(false)}>
          <div className="absolute inset-0 bg-[rgba(5,8,21,0.75)] backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-md rounded-xl border border-white/[0.06] shadow-2xl overflow-hidden"
            style={{ background: '#0D1233' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-white/[0.06]">
              <h2 className="font-display text-xl font-semibold text-white">Request Payout</h2>
            </div>
            <div className="p-6 space-y-5">
              <div className="text-center p-4 rounded-lg bg-white/[0.04]">
                <p className="text-sm text-white/50">Available Balance</p>
                <p className="font-display text-3xl font-bold text-[#8B2FFF]">
                  ${earningsSummary.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div>
                <label className="text-sm text-white/70 mb-1.5 block">Payout Method</label>
                <div className="space-y-2">
                  {['PayPal (creator@helixonix.com)', 'Stripe (acct_1Oxxx...)'].map((method) => (
                    <label key={method} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.04] border border-white/[0.06] cursor-pointer hover:bg-white/[0.06] transition-colors">
                      <input type="radio" name="payoutMethod" className="accent-[#8B2FFF]" defaultChecked />
                      <span className="text-sm text-white">{method}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-white/70 mb-1.5 block">Amount (Min $50)</label>
                <div className="relative">
                  <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="number"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    placeholder="Enter amount"
                    min={50}
                    max={earningsSummary.availableBalance}
                    className="w-full h-11 pl-9 pr-4 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white text-sm placeholder:text-white/40 focus:border-[rgba(0,212,255,0.25)] outline-none transition-all"
                  />
                </div>
              </div>

              <p className="text-xs text-white/40 flex items-center gap-1">
                <Info size={12} />
                Processing time: 2-5 business days
              </p>
            </div>
            <div className="p-4 border-t border-white/[0.06] flex justify-end gap-3">
              <button
                onClick={() => setShowPayoutModal(false)}
                className="px-4 h-10 rounded-lg bg-white/[0.06] text-white text-sm font-medium hover:bg-white/[0.1] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePayoutRequest}
                className="px-6 h-10 rounded-lg gradient-purple text-white text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Request Payout
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
