import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { mockAITools } from "@/stores/mockData";
import { Cpu, Settings2, Power, BarChart3 } from "lucide-react";

export default function AITools() {
  const [tools, setTools] = useState(mockAITools);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const toggleTool = (id: string) => {
    setTools((prev) => prev.map((t) => t.id === id ? { ...t, status: t.status === "enabled" ? "disabled" : "enabled" as const } : t));
  };

  const selected = tools.find((t) => t.id === selectedTool);

  return (
    <div className="animate-fade-in">
      <PageHeader title="AI Tool Configuration" subtitle="Manage all 8 AI generation tools" />

      <div className="mb-4 rounded-xl border border-hx-cyan/20 bg-hx-cyan/5 p-4">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-5 w-5 text-hx-cyan" />
          <div>
            <div className="text-xs font-semibold text-hx-cyan">Today's API Spend</div>
            <div className="text-lg font-bold text-slate-100">$847.23</div>
          </div>
          <div className="ml-6 h-8 w-px bg-hx-cyan/20" />
          <div>
            <div className="text-xs text-slate-500">Projected Monthly</div>
            <div className="text-sm font-mono text-slate-300">~$25,400</div>
          </div>
          <div className="ml-6 h-8 w-px bg-hx-cyan/20" />
          <div>
            <div className="text-xs text-slate-500">Total Generations Today</div>
            <div className="text-sm font-mono text-slate-300">10,213</div>
          </div>
        </div>
      </div>

      <div className="grid gap-3">
        {tools.map((tool) => (
          <div key={tool.id} onClick={() => setSelectedTool(tool.id)}
            className={`cursor-pointer rounded-xl border p-4 transition-all ${selectedTool === tool.id ? "border-hx-cyan/50 bg-hx-cyan/5" : "border-[#1E293B] bg-[#111827] hover:border-[#2D3A50]"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-hx-surface">
                  <Cpu className="h-4 w-4 text-hx-cyan" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-200">{tool.name}</div>
                  <div className="text-[11px] text-slate-500">{tool.modelVersion} · ${tool.apiCost}/gen</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-xs text-slate-500">Today</div>
                  <div className="font-mono text-xs text-slate-300">{tool.todayUsage.toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500">Success</div>
                  <div className={`font-mono text-xs ${tool.successRate > 90 ? "text-emerald-400" : "text-amber-400"}`}>{tool.successRate}%</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500">Avg Time</div>
                  <div className="font-mono text-xs text-slate-300">{tool.avgTime}s</div>
                </div>
                <StatusBadge label={tool.status} variant={tool.status === "enabled" ? "success" : "error"} />
                <button onClick={(e) => { e.stopPropagation(); toggleTool(tool.id); }}
                  className={`rounded-lg p-2 transition-colors ${tool.status === "enabled" ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20" : "bg-hx-red/10 text-hx-red hover:bg-hx-red/20"}`}>
                  <Power className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="mt-4 rounded-xl border border-[#1E293B] bg-[#111827] p-4">
          <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <Settings2 className="h-3.5 w-3.5" /> {selected.name} Settings
          </h3>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">Credit Cost</label>
              <input type="number" defaultValue={selected.creditCost}
                className="w-full rounded-lg border border-[#1E293B] bg-hx-surface px-3 py-2 text-xs text-slate-200 outline-none focus:border-hx-cyan/50" />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">Concurrent Limit</label>
              <input type="number" defaultValue={selected.concurrentLimit}
                className="w-full rounded-lg border border-[#1E293B] bg-hx-surface px-3 py-2 text-xs text-slate-200 outline-none focus:border-hx-cyan/50" />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">Safety Filter (1-5)</label>
              <input type="range" min={1} max={5} defaultValue={selected.safetyFilter}
                className="w-full accent-hx-cyan mt-2" />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">Output Moderation</label>
              <button className={`mt-1 rounded-lg px-3 py-1.5 text-xs ${selected.outputModeration ? "bg-emerald-500/10 text-emerald-400" : "bg-hx-red/10 text-hx-red"}`}>
                {selected.outputModeration ? "Enabled" : "Disabled"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
