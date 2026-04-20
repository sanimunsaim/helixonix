import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { mockAutomationRules } from "@/stores/mockData";
import { Zap, Play, Pause, Plus, Trash2, ChevronRight } from "lucide-react";

export default function AutomationRules() {
  const [rules, setRules] = useState(mockAutomationRules);
  const [showBuilder, setShowBuilder] = useState(false);

  const toggleRule = (id: string) => {
    setRules((prev) => prev.map((r) => r.id === id ? { ...r, status: r.status === "active" ? "paused" : "active" as const } : r));
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="Automation Rules" subtitle="Visual IF/THEN rule builder for HELIX-BRAIN">
        <button onClick={() => setShowBuilder(!showBuilder)}
          className="flex items-center gap-1.5 rounded-lg bg-hx-cyan/10 px-3 py-1.5 text-xs text-hx-cyan hover:bg-hx-cyan/20 border border-hx-cyan/30">
          <Plus className="h-3.5 w-3.5" /> New Rule
        </button>
      </PageHeader>

      {showBuilder && (
        <div className="mb-6 rounded-xl border border-hx-cyan/30 bg-hx-cyan/5 p-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-hx-cyan">Create New Rule</h3>
          <div className="grid gap-4 lg:grid-cols-4">
            <div className="rounded-lg border border-[#1E293B] bg-hx-surface p-3">
              <div className="mb-2 text-[10px] uppercase tracking-wider text-slate-500">Step 1: Trigger</div>
              <select className="w-full rounded-md border border-[#1E293B] bg-hx-surface-hover px-2 py-1.5 text-xs text-slate-200 outline-none">
                <option>Event — Order status changes</option>
                <option>Schedule — Daily at 2:00 AM</option>
                <option>Threshold — Fraud score exceeds</option>
              </select>
            </div>
            <div className="rounded-lg border border-[#1E293B] bg-hx-surface p-3">
              <div className="mb-2 text-[10px] uppercase tracking-wider text-slate-500">Step 2: Conditions</div>
              <div className="flex items-center gap-1">
                <select className="rounded-md border border-[#1E293B] bg-hx-surface-hover px-2 py-1 text-xs text-slate-200 outline-none">
                  <option>quality_score</option>
                </select>
                <select className="rounded-md border border-[#1E293B] bg-hx-surface-hover px-2 py-1 text-xs text-slate-200 outline-none">
                  <option>{">"}</option>
                </select>
                <input placeholder="80" className="w-12 rounded-md border border-[#1E293B] bg-hx-surface-hover px-2 py-1 text-xs text-slate-200 outline-none" />
              </div>
            </div>
            <div className="rounded-lg border border-[#1E293B] bg-hx-surface p-3">
              <div className="mb-2 text-[10px] uppercase tracking-wider text-slate-500">Step 3: Actions</div>
              <select className="w-full rounded-md border border-[#1E293B] bg-hx-surface-hover px-2 py-1.5 text-xs text-slate-200 outline-none">
                <option>Approve asset</option>
                <option>Suspend user</option>
                <option>Send notification</option>
                <option>Flag for review</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button onClick={() => setShowBuilder(false)} className="flex-1 rounded-lg bg-emerald-500/10 py-2 text-xs text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30">
                Save Rule
              </button>
              <button onClick={() => setShowBuilder(false)} className="rounded-lg bg-hx-surface px-3 py-2 text-xs text-slate-500 hover:bg-hx-surface-hover">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {rules.map((rule) => (
          <div key={rule.id} className="rounded-xl border border-[#1E293B] bg-[#111827] p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-hx-surface">
                  <Zap className="h-4 w-4 text-hx-cyan" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-200">{rule.name}</span>
                    <StatusBadge label={rule.status} variant={rule.status === "active" ? "success" : "warning"} className="!text-[10px]" />
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-500">
                    <span className="rounded bg-hx-surface px-1.5 py-0.5">{rule.triggerType}</span>
                    <ChevronRight className="h-3 w-3" />
                    <span>{rule.conditions.length} conditions</span>
                    <ChevronRight className="h-3 w-3" />
                    <span>{rule.actions.length} actions</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-[11px] text-slate-500">Last Run</div>
                  <div className="text-xs text-slate-300">{new Date(rule.lastRun).toLocaleTimeString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-slate-500">Total Runs</div>
                  <div className="font-mono text-xs text-slate-300">{rule.totalRuns.toLocaleString()}</div>
                </div>
                <button onClick={() => toggleRule(rule.id)}
                  className={`rounded-lg p-2 transition-colors ${rule.status === "active" ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20" : "bg-hx-red/10 text-hx-red hover:bg-hx-red/20"}`}>
                  {rule.status === "active" ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
                </button>
                <button className="rounded-lg p-2 text-slate-500 hover:bg-hx-red/10 hover:text-hx-red transition-colors">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
