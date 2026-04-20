import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User, Shield, CreditCard, Bell, Lock, Globe, Smartphone,
  CheckCircle, AlertTriangle, Upload
} from 'lucide-react';
import { GlassCard } from '@/components/shared/GlassCard';
import { Switch } from '@/components/ui/switch';
import { payoutMethods, notificationSettings } from '@/data/mockData';
import { useStore } from '@/store/useStore';

const tabs = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'account', label: 'Account', icon: Shield },
  { key: 'payout', label: 'Payout Methods', icon: CreditCard },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'privacy', label: 'Privacy', icon: Lock },
  { key: 'security', label: 'Security', icon: Globe },
];

function ProfileTab() {
  const completionPercentage = 78;

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="p-4 rounded-lg bg-white/[0.04] border border-white/[0.06]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-white font-medium">Profile Completion</span>
          <span className="text-sm text-[#8B2FFF] font-semibold">{completionPercentage}%</span>
        </div>
        <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 0.8 }}
            className="h-full rounded-full gradient-purple"
          />
        </div>
        <div className="flex gap-3 mt-3">
          {['Add portfolio URL +10%', 'Add bio +5%', 'Verify phone +7%'].map((tip) => (
            <span key={tip} className="text-[10px] px-2 py-1 rounded-full bg-white/[0.06] text-white/50">{tip}</span>
          ))}
        </div>
      </div>

      {/* Profile Photo */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <img src="/assets/avatar-placeholder.jpg" alt="Profile" className="w-24 h-24 rounded-full object-cover" />
          <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full gradient-purple flex items-center justify-center text-white hover:opacity-90 transition-opacity">
            <Upload size={14} />
          </button>
        </div>
        <div>
          <h3 className="text-sm text-white font-medium">Profile Photo</h3>
          <p className="text-xs text-white/40">Recommended: 400x400px, JPG or PNG</p>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: 'Display Name', placeholder: 'Alex Creator', type: 'text' },
          { label: 'Username', placeholder: '@alexcreator', type: 'text' },
          { label: 'Professional Headline', placeholder: 'Cinematic Video Creator & AI Specialist', type: 'text' },
          { label: 'Location', placeholder: 'United States', type: 'select' },
        ].map((field) => (
          <div key={field.label}>
            <label className="text-sm text-white/70 mb-1.5 block">{field.label}</label>
            <input
              type={field.type}
              defaultValue={field.placeholder}
              className="w-full h-10 rounded-lg bg-white/[0.04] border border-white/[0.06] px-3 text-sm text-white placeholder:text-white/40 focus:border-[rgba(0,212,255,0.25)] outline-none transition-all"
            />
          </div>
        ))}
        <div className="md:col-span-2">
          <label className="text-sm text-white/70 mb-1.5 block">Bio</label>
          <textarea
            defaultValue="Professional video creator specializing in cinematic motion graphics, logo animations, and AI-generated art. 5+ years of experience helping brands tell their stories visually."
            className="w-full h-28 rounded-lg bg-white/[0.04] border border-white/[0.06] px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-[rgba(0,212,255,0.25)] outline-none resize-none transition-all"
          />
          <p className="text-xs text-white/30 mt-1 text-right">245 / 500</p>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="px-6 h-10 rounded-lg gradient-purple text-white text-sm font-semibold hover:opacity-90 transition-opacity">
          Save Changes
        </button>
      </div>
    </div>
  );
}

function AccountTab() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm text-white font-medium mb-3">Email Address</h3>
        <div className="flex items-center gap-3">
          <input
            type="email"
            defaultValue="creator@helixonix.com"
            className="flex-1 h-10 rounded-lg bg-white/[0.04] border border-white/[0.06] px-3 text-sm text-white focus:border-[rgba(0,212,255,0.25)] outline-none transition-all"
          />
          <button className="px-4 h-10 rounded-lg bg-white/[0.06] text-white text-sm hover:bg-white/[0.1] transition-colors border border-white/[0.06]">
            Change
          </button>
        </div>
      </div>

      <div className="border-t border-white/[0.06] pt-6">
        <h3 className="text-sm text-white font-medium mb-3">Change Password</h3>
        <div className="space-y-3 max-w-md">
          <input type="password" placeholder="Current password" className="w-full h-10 rounded-lg bg-white/[0.04] border border-white/[0.06] px-3 text-sm text-white placeholder:text-white/40 focus:border-[rgba(0,212,255,0.25)] outline-none transition-all" />
          <input type="password" placeholder="New password" className="w-full h-10 rounded-lg bg-white/[0.04] border border-white/[0.06] px-3 text-sm text-white placeholder:text-white/40 focus:border-[rgba(0,212,255,0.25)] outline-none transition-all" />
          <input type="password" placeholder="Confirm new password" className="w-full h-10 rounded-lg bg-white/[0.04] border border-white/[0.06] px-3 text-sm text-white placeholder:text-white/40 focus:border-[rgba(0,212,255,0.25)] outline-none transition-all" />
          <button className="px-6 h-10 rounded-lg bg-white/[0.06] text-white text-sm hover:bg-white/[0.1] transition-colors border border-white/[0.06]">
            Update Password
          </button>
        </div>
      </div>

      <div className="border-t border-white/[0.06] pt-6">
        <h3 className="text-sm text-white font-medium mb-3">Seller Plan</h3>
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base text-white font-semibold">Pro Plan</p>
              <p className="text-xs text-white/50">$29/month • Renews May 15, 2025</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-purple-500/15 text-purple-400 text-xs font-medium">Current</span>
          </div>
          <div className="mt-3 space-y-1">
            {['Unlimited gigs', 'Priority support', 'Advanced analytics', '0% fee on extras'].map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-xs text-white/70">
                <CheckCircle size={12} className="text-emerald-400" />
                {feature}
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function PayoutTab() {
  const methodIcons: Record<string, React.ElementType> = {
    PayPal: CreditCard,
    Stripe: CreditCard,
    'Bank Transfer': CreditCard,
    Wise: CreditCard,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button className="px-4 h-10 rounded-lg bg-white/[0.06] text-white text-sm hover:bg-white/[0.1] transition-colors border border-white/[0.06]">
          + Add Payout Method
        </button>
      </div>

      {payoutMethods.map((method) => {
        const Icon = methodIcons[method.type] || CreditCard;
        return (
          <GlassCard key={method.id}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/[0.06] flex items-center justify-center">
                  <Icon size={20} className="text-[#8B2FFF]" />
                </div>
                <div>
                  <p className="text-sm text-white font-medium">{method.type}</p>
                  <p className="text-xs text-white/50">{method.detail}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {method.default && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-medium">Default</span>
                )}
                <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-white/50 text-[10px]">{method.status}</span>
              </div>
            </div>
            <div className="flex gap-2 mt-4 pt-3 border-t border-white/[0.06]">
              {!method.default && <button className="text-xs text-[#00D4FF] hover:underline">Set Default</button>}
              <button className="text-xs text-red-400 hover:underline ml-auto">Remove</button>
            </div>
          </GlassCard>
        );
      })}

      <div className="border-t border-white/[0.06] pt-6">
        <h3 className="text-sm text-white font-medium mb-3">Tax Documents</h3>
        <div className="flex items-center gap-3 p-4 rounded-lg bg-white/[0.04] border border-white/[0.06]">
          <FileTextIcon />
          <div className="flex-1">
            <p className="text-sm text-white">W-9 (US Taxpayer)</p>
            <p className="text-xs text-emerald-400">Submitted • Apr 01, 2025</p>
          </div>
          <button className="text-xs text-[#00D4FF] hover:underline">Update</button>
        </div>
      </div>
    </div>
  );
}

function NotificationsTab() {
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="text-left text-[11px] text-white/50 uppercase font-medium py-3 px-4">Event</th>
              <th className="text-center text-[11px] text-white/50 uppercase font-medium py-3 px-4">Email</th>
              <th className="text-center text-[11px] text-white/50 uppercase font-medium py-3 px-4">In-App</th>
              <th className="text-center text-[11px] text-white/50 uppercase font-medium py-3 px-4">Push</th>
            </tr>
          </thead>
          <tbody>
            {notificationSettings.map((setting) => (
              <tr key={setting.event} className="border-b border-white/[0.03]">
                <td className="py-3 px-4 text-sm text-white">{setting.event}</td>
                <td className="py-3 px-4 text-center">
                  <Switch defaultChecked={setting.email} className="data-[state=checked]:bg-[#8B2FFF]" />
                </td>
                <td className="py-3 px-4 text-center">
                  <Switch defaultChecked={setting.inApp} className="data-[state=checked]:bg-[#8B2FFF]" />
                </td>
                <td className="py-3 px-4 text-center">
                  <Switch defaultChecked={setting.push} className="data-[state=checked]:bg-[#8B2FFF]" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PrivacyTab() {
  return (
    <div className="space-y-6">
      {[
        { label: 'Public Profile', desc: 'Make your profile visible to everyone', defaultChecked: true },
        { label: 'Show Earnings on Profile', desc: 'Display your total earnings publicly', defaultChecked: false },
        { label: 'Allow Direct Messages', desc: 'Let anyone message you', defaultChecked: true },
        { label: 'Show Online Status', desc: 'Display when you are active', defaultChecked: true },
      ].map((item) => (
        <div key={item.label} className="flex items-center justify-between py-3 border-b border-white/[0.04]">
          <div>
            <p className="text-sm text-white font-medium">{item.label}</p>
            <p className="text-xs text-white/40">{item.desc}</p>
          </div>
          <Switch defaultChecked={item.defaultChecked} className="data-[state=checked]:bg-[#8B2FFF]" />
        </div>
      ))}

      <div className="pt-4">
        <button className="flex items-center gap-2 px-4 h-10 rounded-lg bg-white/[0.06] text-white text-sm hover:bg-white/[0.1] transition-colors border border-white/[0.06]">
          <Upload size={14} />
          Download My Data
        </button>
      </div>
    </div>
  );
}

function SecurityTab() {
  const { addToast } = useStore();

  return (
    <div className="space-y-6">
      {/* 2FA */}
      <div>
        <h3 className="text-sm text-white font-medium mb-2">Two-Factor Authentication</h3>
        <p className="text-xs text-white/50 mb-3">Add an extra layer of security to your account</p>
        <button
          onClick={() => addToast({ message: '2FA setup wizard coming soon!', type: 'info' })}
          className="px-5 h-10 rounded-lg bg-white/[0.06] text-white text-sm hover:bg-white/[0.1] transition-colors border border-white/[0.06]"
        >
          Enable 2FA
        </button>
      </div>

      <div className="border-t border-white/[0.06] pt-6">
        <h3 className="text-sm text-white font-medium mb-3">Active Sessions</h3>
        <div className="space-y-3">
          {[
            { device: 'Chrome on macOS', location: 'New York, US', active: 'Now', current: true },
            { device: 'Safari on iPhone', location: 'New York, US', active: '2 hours ago', current: false },
            { device: 'Firefox on Windows', location: 'Boston, US', active: '3 days ago', current: false },
          ].map((session) => (
            <div key={session.device} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.04] border border-white/[0.06]">
              <div className="flex items-center gap-3">
                <Smartphone size={16} className="text-white/40" />
                <div>
                  <p className="text-sm text-white">{session.device} {session.current && <span className="text-emerald-400 text-xs">(Current)</span>}</p>
                  <p className="text-xs text-white/40">{session.location} • {session.active}</p>
                </div>
              </div>
              {!session.current && (
                <button className="text-xs text-red-400 hover:underline">Sign Out</button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/[0.06] pt-6">
        <GlassCard className="!border-red-500/30">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm text-white font-medium">Danger Zone</h3>
              <p className="text-xs text-white/50 mt-1">Once you deactivate your account, there is no going back. Please be certain.</p>
              <p className="text-xs text-red-400 mt-1">All pending payouts must be cleared before deactivation.</p>
              <button
                onClick={() => addToast({ message: 'Account deactivation requires confirmation', type: 'warning' })}
                className="mt-3 px-4 h-9 rounded-lg bg-red-500/15 text-red-400 text-xs font-medium hover:bg-red-500/25 transition-colors border border-red-500/30"
              >
                Deactivate Account
              </button>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

export function Settings() {
  const [activeTab, setActiveTab] = useState('profile');

  const tabContent: Record<string, React.ReactNode> = {
    profile: <ProfileTab />,
    account: <AccountTab />,
    payout: <PayoutTab />,
    notifications: <NotificationsTab />,
    privacy: <PrivacyTab />,
    security: <SecurityTab />,
  };

  return (
    <div className="space-y-6">
      {/* Settings Tabs */}
      <div className="flex gap-1 border-b border-white/[0.06]">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === tab.key ? 'text-white' : 'text-white/50 hover:text-white/80'
            }`}
          >
            <tab.icon size={16} />
            <span className="hidden sm:inline">{tab.label}</span>
            {activeTab === tab.key && (
              <motion.div layoutId="settingsTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8B2FFF]" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {tabContent[activeTab]}
      </motion.div>
    </div>
  );
}

function FileTextIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40">
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    </svg>
  );
}
