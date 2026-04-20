import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { mockAssets } from "@/stores/mockData";
import { Search, Image, Music, Video, Box, FileCode } from "lucide-react";
import type { AssetType } from "@/types/admin";

const typeIcons: Record<string, React.ReactNode> = {
  template: <FileCode className="h-3.5 w-3.5" />,
  stock: <Image className="h-3.5 w-3.5" />,
  audio: <Music className="h-3.5 w-3.5" />,
  video: <Video className="h-3.5 w-3.5" />,
  "3d": <Box className="h-3.5 w-3.5" />,
};

export default function AllAssets() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<AssetType | "all">("all");

  const filtered = mockAssets.filter((a) => {
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || a.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="animate-fade-in">
      <PageHeader title="All Platform Assets" subtitle="Searchable, filterable asset catalog" />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search assets..."
            className="w-full rounded-lg border border-[#1E293B] bg-hx-surface py-1.5 pl-8 pr-3 text-xs text-slate-200 outline-none placeholder:text-slate-600 focus:border-hx-cyan/50" />
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-[#1E293B] bg-hx-surface p-0.5">
          {(["all", "template", "stock", "audio", "video", "3d"] as const).map((t) => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-medium capitalize transition-colors ${typeFilter === t ? "bg-hx-cyan/10 text-hx-cyan" : "text-slate-500 hover:text-slate-300"}`}>
              {typeIcons[t]} {t}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#1E293B] bg-[#111827]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1E293B] bg-hx-surface/50">
                <th className="px-3 py-2.5 font-semibold uppercase tracking-wider text-slate-500">Asset</th>
                <th className="px-3 py-2.5 font-semibold uppercase tracking-wider text-slate-500">Seller</th>
                <th className="px-3 py-2.5 font-semibold uppercase tracking-wider text-slate-500">Type</th>
                <th className="px-3 py-2.5 font-semibold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-3 py-2.5 font-semibold uppercase tracking-wider text-slate-500">Downloads</th>
                <th className="px-3 py-2.5 font-semibold uppercase tracking-wider text-slate-500">Revenue</th>
                <th className="px-3 py-2.5 font-semibold uppercase tracking-wider text-slate-500">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((asset) => (
                <tr key={asset.id} className="border-b border-[#1E293B]/50 transition-colors hover:bg-hx-surface-hover">
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-hx-surface text-slate-500">{typeIcons[asset.type]}</div>
                      <span className="font-medium text-slate-200">{asset.title}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-slate-400">{asset.seller}</td>
                  <td className="px-3 py-2.5"><StatusBadge label={asset.type} variant="info" className="!capitalize !text-[10px]" /></td>
                  <td className="px-3 py-2.5"><StatusBadge label={asset.status}
                    variant={asset.status === "approved" ? "success" : asset.status === "pending" ? "warning" : asset.status === "suspended" ? "error" : "purple"} /></td>
                  <td className="px-3 py-2.5 text-slate-400">{asset.downloads.toLocaleString()}</td>
                  <td className="px-3 py-2.5 font-mono text-slate-300">${asset.revenue.toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-slate-500">{asset.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
