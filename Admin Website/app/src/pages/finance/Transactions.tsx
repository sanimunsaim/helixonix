import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { mockTransactions } from "@/stores/mockData";
import { Search, Download, DollarSign } from "lucide-react";

export default function Transactions() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = mockTransactions.filter((t) => {
    const matchSearch = !search || t.user.toLowerCase().includes(search.toLowerCase()) || t.reference.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || t.type === typeFilter;
    return matchSearch && matchType;
  });

  const totalVolume = mockTransactions.reduce((s, t) => s + t.amount, 0);
  const totalFees = mockTransactions.reduce((s, t) => s + t.fee, 0);
  const totalNet = mockTransactions.reduce((s, t) => s + t.net, 0);

  const typeVariant = (t: string) => {
    switch (t) {
      case "payment": return "success";
      case "payout": return "info";
      case "refund": return "error";
      case "credit_purchase": return "purple";
      case "subscription": return "warning";
      default: return "neutral";
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="Transaction Ledger" subtitle="Full-platform financial transaction log">
        <button className="flex items-center gap-1.5 rounded-lg border border-[#1E293B] bg-hx-surface px-3 py-1.5 text-xs text-slate-300 hover:bg-hx-surface-hover">
          <Download className="h-3.5 w-3.5" /> Export
        </button>
      </PageHeader>

      <div className="mb-4 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-3">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-500"><DollarSign className="h-3 w-3" /> Total Volume</div>
          <div className="mt-1 text-xl font-bold text-slate-100">${totalVolume.toLocaleString()}</div>
        </div>
        <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-3">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-500">Total Fees</div>
          <div className="mt-1 text-xl font-bold text-amber-400">${totalFees.toLocaleString()}</div>
        </div>
        <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-3">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-500">Net Revenue</div>
          <div className="mt-1 text-xl font-bold text-emerald-400">${totalNet.toLocaleString()}</div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search transactions..."
            className="w-full rounded-lg border border-[#1E293B] bg-hx-surface py-1.5 pl-8 pr-3 text-xs text-slate-200 outline-none placeholder:text-slate-600 focus:border-hx-cyan/50" />
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-[#1E293B] bg-hx-surface p-0.5">
          {["all", "payment", "payout", "refund", "credit_purchase", "subscription"].map((t) => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-medium capitalize transition-colors ${typeFilter === t ? "bg-hx-cyan/10 text-hx-cyan" : "text-slate-500 hover:text-slate-300"}`}>
              {t.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#1E293B] bg-[#111827]">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#1E293B] bg-hx-surface/50">
              <th className="px-3 py-2.5 font-semibold uppercase tracking-wider text-slate-500">ID</th>
              <th className="px-3 py-2.5 font-semibold uppercase tracking-wider text-slate-500">Date</th>
              <th className="px-3 py-2.5 font-semibold uppercase tracking-wider text-slate-500">Type</th>
              <th className="px-3 py-2.5 font-semibold uppercase tracking-wider text-slate-500">User</th>
              <th className="px-3 py-2.5 font-semibold uppercase tracking-wider text-slate-500">Amount</th>
              <th className="px-3 py-2.5 font-semibold uppercase tracking-wider text-slate-500">Fee</th>
              <th className="px-3 py-2.5 font-semibold uppercase tracking-wider text-slate-500">Net</th>
              <th className="px-3 py-2.5 font-semibold uppercase tracking-wider text-slate-500">Status</th>
              <th className="px-3 py-2.5 font-semibold uppercase tracking-wider text-slate-500">Reference</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id} className="border-b border-[#1E293B]/50 transition-colors hover:bg-hx-surface-hover">
                <td className="px-3 py-2.5 font-mono text-slate-400">{t.id}</td>
                <td className="px-3 py-2.5 text-slate-400">{new Date(t.date).toLocaleDateString()}</td>
                <td className="px-3 py-2.5"><StatusBadge label={t.type.replace("_", "-")} variant={typeVariant(t.type)} className="!capitalize" /></td>
                <td className="px-3 py-2.5 text-slate-300">{t.user}</td>
                <td className="px-3 py-2.5 font-mono text-slate-200">${t.amount.toFixed(2)}</td>
                <td className="px-3 py-2.5 font-mono text-slate-500">${t.fee.toFixed(2)}</td>
                <td className={`px-3 py-2.5 font-mono ${t.net < 0 ? "text-hx-red" : "text-emerald-400"}`}>${t.net.toFixed(2)}</td>
                <td className="px-3 py-2.5"><StatusBadge label={t.status} variant={t.status === "completed" ? "success" : t.status === "processing" ? "warning" : "neutral"} /></td>
                <td className="px-3 py-2.5 font-mono text-[10px] text-slate-600">{t.reference}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
