import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { mockAuditEntries } from "@/stores/mockData";
import { Search, Download, Shield } from "lucide-react";

export default function AuditLog() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const filtered = mockAuditEntries.filter((e) => {
    const matchSearch = !search || e.admin.toLowerCase().includes(search.toLowerCase()) || e.action.toLowerCase().includes(search.toLowerCase());
    const matchAction = actionFilter === "all" || e.action.includes(actionFilter);
    return matchSearch && matchAction;
  });

  return (
    <div className="animate-fade-in">
      <PageHeader title="Audit Log" subtitle="Immutable record of all admin actions">
        <button className="flex items-center gap-1.5 rounded-lg border border-[#1E293B] bg-hx-surface px-3 py-1.5 text-xs text-slate-300 hover:bg-hx-surface-hover">
          <Download className="h-3.5 w-3.5" /> Export CSV
        </button>
      </PageHeader>

      <div className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 flex items-center gap-2">
        <Shield className="h-4 w-4 text-amber-400" />
        <span className="text-xs text-amber-400">This log is append-only. No entries can be modified or deleted.</span>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search audit log..."
            className="w-full rounded-lg border border-[#1E293B] bg-hx-surface py-1.5 pl-8 pr-3 text-xs text-slate-200 outline-none placeholder:text-slate-600 focus:border-hx-cyan/50" />
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-[#1E293B] bg-hx-surface p-0.5">
          {["all", "payout", "asset", "user", "commission", "ai"].map((a) => (
            <button key={a} onClick={() => setActionFilter(a)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-medium capitalize transition-colors ${actionFilter === a ? "bg-hx-cyan/10 text-hx-cyan" : "text-slate-500 hover:text-slate-300"}`}>
              {a}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#1E293B] bg-[#111827]">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#1E293B] bg-hx-surface/50">
              <th className="px-3 py-2.5 font-semibold uppercase tracking-wider text-slate-500">Timestamp</th>
              <th className="px-3 py-2.5 font-semibold uppercase tracking-wider text-slate-500">Admin</th>
              <th className="px-3 py-2.5 font-semibold uppercase tracking-wider text-slate-500">Action</th>
              <th className="px-3 py-2.5 font-semibold uppercase tracking-wider text-slate-500">Entity</th>
              <th className="px-3 py-2.5 font-semibold uppercase tracking-wider text-slate-500">Change</th>
              <th className="px-3 py-2.5 font-semibold uppercase tracking-wider text-slate-500">IP</th>
              <th className="px-3 py-2.5 font-semibold uppercase tracking-wider text-slate-500">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((entry) => (
              <tr key={entry.id} className="border-b border-[#1E293B]/50 transition-colors hover:bg-hx-surface-hover">
                <td className="px-3 py-2.5 font-mono text-[11px] text-slate-400">{new Date(entry.timestamp).toLocaleString()}</td>
                <td className="px-3 py-2.5">
                  <div className="text-xs text-slate-200">{entry.admin}</div>
                  <div className="text-[10px] text-slate-600">{entry.adminRole.replace("_", " ")}</div>
                </td>
                <td className="px-3 py-2.5">
                  <span className="rounded bg-hx-surface px-1.5 py-0.5 text-[10px] text-slate-400">{entry.action.replace("_", " ")}</span>
                </td>
                <td className="px-3 py-2.5 text-slate-300">{entry.entity}</td>
                <td className="px-3 py-2.5">
                  {entry.before && entry.after && (
                    <div className="text-[10px]">
                      <span className="text-hx-red">{entry.before}</span>
                      <span className="mx-1 text-slate-600">→</span>
                      <span className="text-emerald-400">{entry.after}</span>
                    </div>
                  )}
                </td>
                <td className="px-3 py-2.5 font-mono text-[10px] text-slate-600">{entry.ip}</td>
                <td className="px-3 py-2.5"><StatusBadge label={entry.status} variant={entry.status === "success" ? "success" : "error"} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
