import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { RiskScoreBar } from "@/components/shared/RiskScoreBar";
import { mockBuyers } from "@/stores/mockData";
import {
  Search, Download, ChevronDown, ChevronUp,
  Mail, Ban, Clock, CreditCard,
} from "lucide-react";

type StatusFilter = "all" | "active" | "suspended" | "banned";
type PlanFilter = "all" | "free" | "creator" | "pro" | "studio";

export default function UserList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [planFilter, setPlanFilter] = useState<PlanFilter>("all");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  const filtered = mockBuyers.filter((u) => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || u.status === statusFilter;
    const matchPlan = planFilter === "all" || u.plan === planFilter;
    return matchSearch && matchStatus && matchPlan;
  });

  const toggleSelect = (id: string) => {
    setSelectedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedUsers.size === filtered.length) setSelectedUsers(new Set());
    else setSelectedUsers(new Set(filtered.map((u) => u.id)));
  };

  const statusVariant = (s: string) => {
    switch (s) {
      case "active": return "success";
      case "suspended": return "warning";
      case "banned": return "error";
      default: return "neutral";
    }
  };

  const planColors: Record<string, string> = { free: "text-slate-400", creator: "text-sky-400", pro: "text-hx-cyan", studio: "text-hx-purple" };

  return (
    <div className="animate-fade-in">
      <PageHeader title="Buyer Management" subtitle="View and manage all buyer accounts">
        <div className="flex items-center gap-2">
          {selectedUsers.size > 0 && (
            <span className="text-[11px] text-slate-500">{selectedUsers.size} selected</span>
          )}
          <button className="flex items-center gap-1.5 rounded-lg border border-[#1E293B] bg-hx-surface px-3 py-1.5 text-xs text-slate-300 hover:bg-hx-surface-hover">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
        </div>
      </PageHeader>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full rounded-lg border border-[#1E293B] bg-hx-surface py-1.5 pl-8 pr-3 text-xs text-slate-200 outline-none placeholder:text-slate-600 focus:border-hx-cyan/50"
          />
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-[#1E293B] bg-hx-surface p-0.5">
          {(["all", "active", "suspended", "banned"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-medium capitalize transition-colors ${
                statusFilter === s ? "bg-hx-cyan/10 text-hx-cyan" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-[#1E293B] bg-hx-surface p-0.5">
          {(["all", "free", "creator", "pro", "studio"] as PlanFilter[]).map((p) => (
            <button
              key={p}
              onClick={() => setPlanFilter(p)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-medium capitalize transition-colors ${
                planFilter === p ? "bg-hx-purple/10 text-hx-purple" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#1E293B] bg-[#111827]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1E293B] bg-hx-surface/50">
                <th className="px-3 py-2.5 w-8">
                  <input
                    type="checkbox"
                    checked={selectedUsers.size === filtered.length && filtered.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-[#1E293B] bg-hx-surface"
                  />
                </th>
                <th className="px-3 py-2.5 font-semibold uppercase tracking-wider text-slate-500">User</th>
                <th className="px-3 py-2.5 font-semibold uppercase tracking-wider text-slate-500">Plan</th>
                <th className="px-3 py-2.5 font-semibold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-3 py-2.5 font-semibold uppercase tracking-wider text-slate-500">Join Date</th>
                <th className="px-3 py-2.5 font-semibold uppercase tracking-wider text-slate-500">Total Spent</th>
                <th className="px-3 py-2.5 font-semibold uppercase tracking-wider text-slate-500">Orders</th>
                <th className="px-3 py-2.5 font-semibold uppercase tracking-wider text-slate-500">Risk</th>
                <th className="px-3 py-2.5 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <>
                  <tr
                    key={user.id}
                    className="border-b border-[#1E293B]/50 transition-colors hover:bg-hx-surface-hover cursor-pointer"
                    onClick={() => navigate(`/users/${user.id}`)}
                  >
                    <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(user.id)}
                        onChange={() => toggleSelect(user.id)}
                        className="rounded border-[#1E293B] bg-hx-surface"
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-hx-surface-hover to-hx-surface-elevated text-xs font-bold text-slate-300">
                          {user.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div>
                          <div className="font-medium text-slate-200">{user.name}</div>
                          <div className="text-[11px] text-slate-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`text-xs font-semibold capitalize ${planColors[user.plan]}`}>{user.plan}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusBadge label={user.status} variant={statusVariant(user.status)} />
                    </td>
                    <td className="px-3 py-2.5 text-slate-400">{user.joinDate}</td>
                    <td className="px-3 py-2.5 font-mono text-slate-300">${user.totalSpent.toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-slate-400">{user.orders}</td>
                    <td className="px-3 py-2.5">
                      <RiskScoreBar score={user.riskScore} size="sm" />
                    </td>
                    <td className="px-3 py-2.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); setExpandedRow(expandedRow === user.id ? null : user.id); }}
                        className="rounded p-1 text-slate-500 hover:bg-hx-surface-hover"
                      >
                        {expandedRow === user.id ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </button>
                    </td>
                  </tr>
                  {expandedRow === user.id && (
                    <tr className="border-b border-[#1E293B] bg-hx-surface/30">
                      <td colSpan={9} className="px-4 py-3">
                        <div className="grid grid-cols-4 gap-4 text-[11px]">
                          <div>
                            <span className="text-slate-600">Bio:</span>
                            <p className="mt-0.5 text-slate-400">{user.bio || "No bio provided"}</p>
                          </div>
                          <div>
                            <span className="text-slate-600">Last Login:</span>
                            <p className="mt-0.5 text-slate-400">{new Date(user.lastLogin).toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-slate-600">Devices:</span>
                            <p className="mt-0.5 text-slate-400">{user.deviceCount} registered</p>
                          </div>
                          <div className="flex items-end gap-1.5">
                            <button className="flex items-center gap-1 rounded bg-hx-surface-hover px-2 py-1 text-slate-400 hover:text-hx-cyan"><Mail className="h-3 w-3" /> Email</button>
                            <button className="flex items-center gap-1 rounded bg-hx-surface-hover px-2 py-1 text-slate-400 hover:text-hx-orange"><Clock className="h-3 w-3" /> Suspend</button>
                            <button className="flex items-center gap-1 rounded bg-hx-surface-hover px-2 py-1 text-slate-400 hover:text-hx-red"><Ban className="h-3 w-3" /> Ban</button>
                            <button className="flex items-center gap-1 rounded bg-hx-surface-hover px-2 py-1 text-slate-400 hover:text-emerald-400"><CreditCard className="h-3 w-3" /> Credits</button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-slate-500">No buyers found matching your filters</div>
        )}
      </div>
    </div>
  );
}
