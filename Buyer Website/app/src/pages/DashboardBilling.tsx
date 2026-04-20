import { useState } from 'react';
import { Check, CreditCard, Zap, Download } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

const plans = [
  { name: 'Free', price: 0, features: ['10 downloads/month', '50 AI credits', 'Standard license', 'Community support'] },
  { name: 'Pro', price: 19, features: ['Unlimited downloads', '500 AI credits/mo', 'All licenses', 'Priority support', 'HD generation'], current: true },
  { name: 'Team', price: 49, features: ['Everything in Pro', '2000 AI credits/mo', '5 team seats', 'Admin dashboard', 'Dedicated support'] },
];

const history = [
  { date: 'Apr 15, 2025', desc: 'Pro Plan - Monthly', amount: 19.00, status: 'Paid' },
  { date: 'Mar 15, 2025', desc: 'Pro Plan - Monthly', amount: 19.00, status: 'Paid' },
  { date: 'Mar 10, 2025', desc: 'Credit Pack - 500', amount: 29.00, status: 'Paid' },
  { date: 'Feb 15, 2025', desc: 'Pro Plan - Monthly', amount: 19.00, status: 'Paid' },
];

const creditPacks = [
  { credits: 100, price: 9 },
  { credits: 500, price: 29, popular: true },
  { credits: 2000, price: 79 },
];

export default function DashboardBilling() {
  const { user } = useAuthStore();
  const [showCreditModal, setShowCreditModal] = useState(false);

  return (
    <div className="min-h-screen bg-[#050815] pt-8 pb-20">
      <div className="page-gutter max-w-5xl mx-auto">
        <h1 className="font-heading font-bold text-2xl text-white mb-6">Subscription & Billing</h1>

        {/* Current Plan */}
        <div className="glass-surface rounded-card-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-[#8892B0]">Current Plan</p>
              <h2 className="font-display font-bold text-2xl text-white">{user?.plan === 'pro' ? 'Pro' : user?.plan === 'team' ? 'Team' : 'Free'}</h2>
            </div>
            <div className="text-right">
              <p className="font-display font-bold text-3xl text-white">${user?.plan === 'pro' ? '19' : user?.plan === 'team' ? '49' : '0'}<span className="text-sm text-[#8892B0]">/mo</span></p>
              <p className="text-xs text-[#8892B0]">Renews May 15, 2025</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {plans.find((p) => p.name.toLowerCase() === (user?.plan || 'free'))?.features.map((f) => (
              <span key={f} className="flex items-center gap-1 text-xs text-[#8892B0]"><Check size={12} className="text-[#00E676]" /> {f}</span>
            ))}
          </div>
        </div>

        {/* Credits */}
        <div className="glass-surface rounded-card-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#00D4FF]/10 flex items-center justify-center">
                <Zap size={18} className="text-[#00D4FF]" />
              </div>
              <div>
                <p className="text-sm text-[#8892B0]">Credit Balance</p>
                <p className="font-mono text-2xl text-[#00D4FF] font-bold">{user?.credits || 0}</p>
              </div>
            </div>
            <button onClick={() => setShowCreditModal(true)} className="px-4 py-2 bg-gradient-to-r from-[#00D4FF] to-[#8B2FFF] text-white rounded-button text-sm font-heading font-semibold">
              Buy More Credits
            </button>
          </div>
          <div className="h-2 bg-[#0A0F2E] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#00D4FF] to-[#8B2FFF] rounded-full" style={{ width: `${Math.min(((user?.credits || 0) / 500) * 100, 100)}%` }} />
          </div>
          <p className="text-xs text-[#8892B0] mt-1">{user?.credits || 0} / 500 credits used this period</p>
        </div>

        {/* Credit Pack Modal */}
        {showCreditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="glass-surface-strong rounded-card-lg p-6 w-full max-w-lg">
              <h3 className="font-heading font-bold text-white mb-4">Buy Credits</h3>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {creditPacks.map((pack) => (
                  <button key={pack.credits} className={cn('p-4 rounded-card border text-center transition-all hover:border-[#00D4FF]', pack.popular ? 'border-[#00D4FF] bg-[#00D4FF]/5' : 'border-[rgba(0,212,255,0.15)]')}>
                    {pack.popular && <span className="text-[10px] text-[#00D4FF] font-mono mb-1 block">POPULAR</span>}
                    <p className="font-mono text-xl text-white font-bold">{pack.credits}</p>
                    <p className="text-xs text-[#8892B0]">credits</p>
                    <p className="font-mono text-[#00D4FF] mt-1">${pack.price}</p>
                  </button>
                ))}
              </div>
              <button onClick={() => setShowCreditModal(false)} className="w-full py-2 glass-surface rounded-button text-sm text-[#8892B0]">Cancel</button>
            </div>
          </div>
        )}

        {/* Payment Method */}
        <div className="glass-surface rounded-card p-6 mb-8">
          <h3 className="font-heading font-bold text-white mb-3">Payment Method</h3>
          <div className="flex items-center gap-3">
            <CreditCard size={20} className="text-[#00D4FF]" />
            <div>
              <p className="text-sm text-white">Visa ending in 4242</p>
              <p className="text-xs text-[#8892B0]">Expires 12/26</p>
            </div>
            <button className="ml-auto text-xs text-[#00D4FF] hover:underline">Update</button>
          </div>
        </div>

        {/* Billing History */}
        <div className="glass-surface rounded-card p-6">
          <h3 className="font-heading font-bold text-white mb-4">Billing History</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-[#8892B0] border-b border-[rgba(0,212,255,0.1)]">
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium">Description</th>
                  <th className="pb-2 font-medium">Amount</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => (
                  <tr key={i} className="border-b border-[rgba(0,212,255,0.05)]">
                    <td className="py-3 text-sm text-[#8892B0]">{h.date}</td>
                    <td className="py-3 text-sm text-white">{h.desc}</td>
                    <td className="py-3 text-sm font-mono text-white">${h.amount.toFixed(2)}</td>
                    <td className="py-3"><span className="text-xs text-[#00E676]">{h.status}</span></td>
                    <td className="py-3"><button className="text-[#8892B0] hover:text-[#00D4FF]"><Download size={14} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
