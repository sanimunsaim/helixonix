import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { mockDisputes } from "@/stores/mockData";
import { Search, Clock } from "lucide-react";

export default function DisputeList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = mockDisputes.filter((d) => {
    const matchSearch = !search || d.orderNumber.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="animate-fade-in">
      <PageHeader title="Dispute Resolution Center" subtitle="Review and resolve buyer-seller disputes" badge={`${mockDisputes.length} OPEN`} badgeColor="bg-hx-red/10 text-hx-red" />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search disputes..."
            className="w-full rounded-lg border border-[#1E293B] bg-hx-surface py-1.5 pl-8 pr-3 text-xs text-slate-200 outline-none placeholder:text-slate-600 focus:border-hx-cyan/50" />
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-[#1E293B] bg-hx-surface p-0.5">
          {["all", "open", "urgent", "resolved", "escalated"].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-medium capitalize transition-colors ${statusFilter === s ? "bg-hx-cyan/10 text-hx-cyan" : "text-slate-500 hover:text-slate-300"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((dispute) => (
          <div key={dispute.id} onClick={() => navigate(`/disputes/${dispute.id}`)}
            className="cursor-pointer rounded-xl border border-[#1E293B] bg-[#111827] p-4 transition-all hover:border-[#2D3A50]">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-hx-cyan">{dispute.id}</span>
                  <span className="text-xs text-slate-500">· {dispute.orderNumber}</span>
                  <StatusBadge label={dispute.status} variant={dispute.status === "urgent" ? "error" : dispute.status === "open" ? "warning" : dispute.status === "resolved" ? "success" : "purple"} />
                </div>
                <div className="mt-1.5 text-xs text-slate-400">
                  Opened by <span className="text-slate-200">{dispute.openedBy}</span> against <span className="text-slate-200">{dispute.against}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">{dispute.reason}</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${dispute.aiConfidence > 80 ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                    AI {dispute.aiConfidence}% confident
                  </div>
                  <span className="text-[10px] text-slate-600">{dispute.aiRecommendation}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                  <Clock className="h-3 w-3" /> {dispute.age}
                </div>
                {dispute.assignedTo && (
                  <div className="mt-1 text-[10px] text-slate-600">Assigned: {dispute.assignedTo}</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
