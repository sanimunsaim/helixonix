import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { mockCommissionRules } from "@/stores/mockData";
import { Save, RotateCcw } from "lucide-react";

export default function Commissions() {
  const [rules, setRules] = useState(mockCommissionRules);
  const [editing, setEditing] = useState(false);

  const updateRule = (index: number, field: "commissionPercent" | "revenueShare" | "notes", value: string | number) => {
    setRules((prev) => prev.map((r, i) => i === index ? { ...r, [field]: value } : r));
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="Commission Rules" subtitle="Configure platform commission rates per seller tier">
        <button onClick={() => setEditing(!editing)}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-colors ${editing ? "bg-hx-cyan/10 text-hx-cyan border border-hx-cyan/30" : "border border-[#1E293B] bg-hx-surface text-slate-300 hover:bg-hx-surface-hover"}`}>
          {editing ? "Done Editing" : "Edit Rates"}
        </button>
      </PageHeader>

      <div className="overflow-hidden rounded-xl border border-[#1E293B] bg-[#111827]">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#1E293B] bg-hx-surface/50">
              <th className="px-4 py-3 font-semibold uppercase tracking-wider text-slate-500">Seller Tier</th>
              <th className="px-4 py-3 font-semibold uppercase tracking-wider text-slate-500">Commission %</th>
              <th className="px-4 py-3 font-semibold uppercase tracking-wider text-slate-500">Revenue Share</th>
              <th className="px-4 py-3 font-semibold uppercase tracking-wider text-slate-500">Notes</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((rule, i) => (
              <tr key={rule.tier} className="border-b border-[#1E293B]/50">
                <td className="px-4 py-3">
                  <span className="text-sm font-semibold text-slate-200">{rule.tier}</span>
                </td>
                <td className="px-4 py-3">
                  {editing ? (
                    <div className="flex items-center gap-2">
                      <input type="number" value={rule.commissionPercent}
                        onChange={(e) => updateRule(i, "commissionPercent", Number(e.target.value))}
                        className="w-16 rounded-md border border-[#1E293B] bg-hx-surface px-2 py-1 text-center font-mono text-slate-200 outline-none focus:border-hx-cyan/50" />
                      <span className="text-slate-500">%</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-hx-surface-hover">
                        <div className="h-full rounded-full bg-gradient-to-r from-hx-cyan to-hx-purple" style={{ width: `${(rule.commissionPercent / 25) * 100}%` }} />
                      </div>
                      <span className="font-mono font-bold text-slate-200">{rule.commissionPercent}%</span>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 font-mono text-slate-300">{rule.revenueShare}</td>
                <td className="px-4 py-3">
                  {editing ? (
                    <input value={rule.notes}
                      onChange={(e) => updateRule(i, "notes", e.target.value)}
                      className="w-full rounded-md border border-[#1E293B] bg-hx-surface px-2 py-1 text-slate-200 outline-none focus:border-hx-cyan/50" />
                  ) : (
                    <span className="text-slate-400">{rule.notes}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="mt-4 flex items-center gap-3">
          <button className="flex items-center gap-1.5 rounded-lg bg-hx-cyan/10 px-4 py-2 text-xs text-hx-cyan hover:bg-hx-cyan/20 border border-hx-cyan/30">
            <Save className="h-3.5 w-3.5" /> Save Changes
          </button>
          <button onClick={() => { setRules(mockCommissionRules); setEditing(false); }}
            className="flex items-center gap-1.5 rounded-lg bg-hx-surface px-4 py-2 text-xs text-slate-400 hover:bg-hx-surface-hover">
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
        </div>
      )}
    </div>
  );
}
