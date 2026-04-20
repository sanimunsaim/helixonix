import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { mockSellers } from "@/stores/mockData";
import { Search, Star, ChevronDown, ChevronUp, Download } from "lucide-react";

type LevelFilter = "all" | "new" | "bronze" | "silver" | "gold" | "platinum";
type VerificationFilter = "all" | "verified" | "pending" | "unverified";

export default function SellerList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("all");
  const [verificationFilter, setVerificationFilter] = useState<VerificationFilter>("all");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const filtered = mockSellers.filter((s) => {
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase());
    const matchLevel = levelFilter === "all" || s.level === levelFilter;
    const matchVerif = verificationFilter === "all" || s.verification === verificationFilter;
    return matchSearch && matchLevel && matchVerif;
  });

  const levelColors: Record<string, string> = {
    new: "text-slate-400",
    bronze: "text-amber-600",
    silver: "text-slate-300",
    gold: "text-amber-400",
    platinum: "text-hx-cyan",
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="Seller Management" subtitle="View and manage all seller accounts">
        <button className="flex items-center gap-1.5 rounded-lg border border-[#1E293B] bg-hx-surface px-3 py-1.5 text-xs text-slate-300 hover:bg-hx-surface-hover">
          <Download className="h-3.5 w-3.5" /> Export CSV
        </button>
      </PageHeader>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search sellers..."
            className="w-full rounded-lg border border-[#1E293B] bg-hx-surface py-1.5 pl-8 pr-3 text-xs text-slate-200 outline-none placeholder:text-slate-600 focus:border-hx-cyan/50" />
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-[#1E293B] bg-hx-surface p-0.5">
          {(["all", "new", "bronze", "silver", "gold", "platinum"] as LevelFilter[]).map((l) => (
            <button key={l} onClick={() => setLevelFilter(l)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-medium capitalize transition-colors ${levelFilter === l ? "bg-hx-cyan/10 text-hx-cyan" : "text-slate-500 hover:text-slate-300"}`}>
              {l}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-[#1E293B] bg-hx-surface p-0.5">
          {(["all", "verified", "pending", "unverified"] as VerificationFilter[]).map((v) => (
            <button key={v} onClick={() => setVerificationFilter(v)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-medium capitalize transition-colors ${verificationFilter === v ? "bg-emerald-500/10 text-emerald-400" : "text-slate-500 hover:text-slate-300"}`}>
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#1E293B] bg-[#111827]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1E293B] bg-hx-surface/50">
                <th className="px-3 py-2.5 font-semibold uppercase tracking-wider text-slate-500">Seller</th>
                <th className="px-3 py-2.5 font-semibold uppercase tracking-wider text-slate-500">Level</th>
                <th className="px-3 py-2.5 font-semibold uppercase tracking-wider text-slate-500">Verification</th>
                <th className="px-3 py-2.5 font-semibold uppercase tracking-wider text-slate-500">Assets</th>
                <th className="px-3 py-2.5 font-semibold uppercase tracking-wider text-slate-500">Revenue</th>
                <th className="px-3 py-2.5 font-semibold uppercase tracking-wider text-slate-500">Rating</th>
                <th className="px-3 py-2.5 font-semibold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-3 py-2.5 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((seller) => (
                <>
                  <tr key={seller.id} className="border-b border-[#1E293B]/50 transition-colors hover:bg-hx-surface-hover cursor-pointer" onClick={() => navigate(`/sellers/${seller.id}`)}>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-hx-purple/30 to-hx-cyan/30 text-xs font-bold text-slate-300">
                          {seller.name[0]}
                        </div>
                        <div>
                          <div className="font-medium text-slate-200">{seller.name}</div>
                          <div className="text-[11px] text-slate-500">@{seller.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`text-xs font-bold capitalize ${levelColors[seller.level]}`}>{seller.level}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusBadge label={seller.verification}
                        variant={seller.verification === "verified" ? "success" : seller.verification === "pending" ? "warning" : "neutral"} />
                    </td>
                    <td className="px-3 py-2.5 text-slate-400">{seller.assets} <span className="text-slate-600">/ {seller.gigs} gigs</span></td>
                    <td className="px-3 py-2.5 font-mono text-slate-300">${seller.totalRevenue.toLocaleString()}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span className="text-xs text-slate-300">{seller.rating}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusBadge label={seller.status} variant={seller.status === "active" ? "success" : "warning"} />
                    </td>
                    <td className="px-3 py-2.5">
                      <button onClick={(e) => { e.stopPropagation(); setExpandedRow(expandedRow === seller.id ? null : seller.id); }}
                        className="rounded p-1 text-slate-500 hover:bg-hx-surface-hover">
                        {expandedRow === seller.id ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </button>
                    </td>
                  </tr>
                  {expandedRow === seller.id && (
                    <tr className="border-b border-[#1E293B] bg-hx-surface/30">
                      <td colSpan={8} className="px-4 py-3">
                        <div className="grid grid-cols-3 gap-4 text-[11px]">
                          <div><span className="text-slate-600">Monthly Revenue:</span> <span className="text-slate-300">${seller.monthlyRevenue.toLocaleString()}</span></div>
                          <div><span className="text-slate-600">Pending Clearance:</span> <span className="text-slate-300">${seller.pendingClearance.toLocaleString()}</span></div>
                          <div><span className="text-slate-600">Country:</span> <span className="text-slate-300">{seller.country}</span></div>
                          {seller.fraudSignals && seller.fraudSignals.length > 0 && (
                            <div className="col-span-3">
                              <span className="text-hx-red">Fraud Signals:</span>
                              {seller.fraudSignals.map((f, i) => (
                                <span key={i} className="ml-2 text-hx-orange">{f}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
