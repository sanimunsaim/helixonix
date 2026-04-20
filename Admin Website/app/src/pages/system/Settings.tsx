import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Settings2, Save, Globe, Lock } from "lucide-react";

export default function Settings() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [registration, setRegistration] = useState("open");
  const [sellerApps, setSellerApps] = useState("open");
  const [siteName, setSiteName] = useState("HelixOnix");
  const [tagline, setTagline] = useState("The Creative Asset Marketplace");

  return (
    <div className="animate-fade-in">
      <PageHeader title="Platform Settings" subtitle="Configure global platform parameters" />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-4">
          <h3 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <Globe className="h-3.5 w-3.5" /> Platform Info
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">Site Name</label>
              <input value={siteName} onChange={(e) => setSiteName(e.target.value)}
                className="w-full rounded-lg border border-[#1E293B] bg-hx-surface px-3 py-2 text-xs text-slate-200 outline-none focus:border-hx-cyan/50" />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">Tagline</label>
              <input value={tagline} onChange={(e) => setTagline(e.target.value)}
                className="w-full rounded-lg border border-[#1E293B] bg-hx-surface px-3 py-2 text-xs text-slate-200 outline-none focus:border-hx-cyan/50" />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">Contact Email</label>
              <input defaultValue="support@helixonix.com"
                className="w-full rounded-lg border border-[#1E293B] bg-hx-surface px-3 py-2 text-xs text-slate-200 outline-none focus:border-hx-cyan/50" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-4">
          <h3 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <Lock className="h-3.5 w-3.5" /> Access Control
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-300">Maintenance Mode</span>
                <button onClick={() => setMaintenanceMode(!maintenanceMode)}
                  className={`relative h-5 w-9 rounded-full transition-colors ${maintenanceMode ? "bg-hx-cyan" : "bg-hx-surface-hover"}`}>
                  <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${maintenanceMode ? "translate-x-4.5" : "translate-x-0.5"}`} />
                </button>
              </div>
              {maintenanceMode && (
                <textarea placeholder="Maintenance message..." rows={2}
                  className="w-full rounded-lg border border-[#1E293B] bg-hx-surface px-3 py-2 text-xs text-slate-200 outline-none placeholder:text-slate-600" />
              )}
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">Registration</label>
              <select value={registration} onChange={(e) => setRegistration(e.target.value)}
                className="w-full rounded-lg border border-[#1E293B] bg-hx-surface px-3 py-2 text-xs text-slate-200 outline-none">
                <option value="open">Open</option>
                <option value="invite_only">Invite Only</option>
                <option value="paused">Paused</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">Seller Applications</label>
              <select value={sellerApps} onChange={(e) => setSellerApps(e.target.value)}
                className="w-full rounded-lg border border-[#1E293B] bg-hx-surface px-3 py-2 text-xs text-slate-200 outline-none">
                <option value="open">Open</option>
                <option value="invite_only">Invite Only</option>
                <option value="paused">Paused</option>
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-4 lg:col-span-2">
          <h3 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <Settings2 className="h-3.5 w-3.5" /> Feature Flags
          </h3>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { name: "AI Generation", enabled: true },
              { name: "Gig Marketplace", enabled: true },
              { name: "Subscriptions", enabled: true },
              { name: "Credit System", enabled: true },
              { name: "Affiliate Program", enabled: false },
              { name: "Live Chat", enabled: true },
              { name: "API Access", enabled: true },
              { name: "Bulk Upload", enabled: false },
            ].map((flag) => (
              <div key={flag.name} className="flex items-center justify-between rounded-lg bg-hx-surface p-2.5">
                <span className="text-xs text-slate-300">{flag.name}</span>
                <StatusBadge label={flag.enabled ? "ON" : "OFF"} variant={flag.enabled ? "success" : "neutral"} className="!text-[9px]" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button className="flex items-center gap-1.5 rounded-lg bg-hx-cyan/10 px-4 py-2 text-xs text-hx-cyan hover:bg-hx-cyan/20 border border-hx-cyan/30">
          <Save className="h-3.5 w-3.5" /> Save Changes
        </button>
      </div>
    </div>
  );
}
