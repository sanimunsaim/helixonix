import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useUIStore } from "@/stores/uiStore";
import { mockBuyers, mockSellers, mockOrders, mockAssets } from "@/stores/mockData";
import { Search, X, User, ShoppingBag, Package, FileText, ArrowRight } from "lucide-react";

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: "user" | "order" | "asset" | "page";
  icon: React.ReactNode;
  path: string;
}

const pageResults: SearchResult[] = [
  { id: "page_1", title: "Dashboard", subtitle: "Overview", type: "page", icon: <FileText className="h-4 w-4" />, path: "/" },
  { id: "page_2", title: "Moderation Queue", subtitle: "Content", type: "page", icon: <FileText className="h-4 w-4" />, path: "/content" },
  { id: "page_3", title: "Transaction Ledger", subtitle: "Finance", type: "page", icon: <FileText className="h-4 w-4" />, path: "/finance/transactions" },
  { id: "page_4", title: "HELIX-BRAIN Console", subtitle: "Intelligence", type: "page", icon: <FileText className="h-4 w-4" />, path: "/helix-brain" },
  { id: "page_5", title: "Disputes", subtitle: "Marketplace", type: "page", icon: <FileText className="h-4 w-4" />, path: "/disputes" },
  { id: "page_6", title: "Payout Queue", subtitle: "Finance", type: "page", icon: <FileText className="h-4 w-4" />, path: "/finance/payouts" },
];

export function CommandSearch() {
  const open = useUIStore((s) => s.commandSearchOpen);
  const setOpen = useUIStore((s) => s.setCommandSearchOpen);
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const results = useMemo(() => {
    if (!query.trim()) return pageResults;
    const q = query.toLowerCase();
    const entityResults: SearchResult[] = [
      ...mockBuyers.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)).map((u) => ({
        id: u.id, title: u.name, subtitle: u.email, type: "user" as const,
        icon: <User className="h-4 w-4" />, path: `/users/${u.id}`,
      })),
      ...mockSellers.filter((s) => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)).map((s) => ({
        id: s.id, title: s.name, subtitle: s.email, type: "user" as const,
        icon: <User className="h-4 w-4" />, path: `/sellers/${s.id}`,
      })),
      ...mockOrders.filter((o) => o.orderNumber.toLowerCase().includes(q)).map((o) => ({
        id: o.id, title: o.orderNumber, subtitle: `${o.buyer} → ${o.seller}`, type: "order" as const,
        icon: <ShoppingBag className="h-4 w-4" />, path: `/orders/${o.id}`,
      })),
      ...mockAssets.filter((a) => a.title.toLowerCase().includes(q)).map((a) => ({
        id: a.id, title: a.title, subtitle: a.seller, type: "asset" as const,
        icon: <Package className="h-4 w-4" />, path: `/content/all-assets`,
      })),
      ...pageResults.filter((p) => p.title.toLowerCase().includes(q)),
    ];
    return entityResults.slice(0, 12);
  }, [query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const r = results[selectedIndex];
        if (r) { navigate(r.path); setOpen(false); setQuery(""); }
      } else if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, results, selectedIndex, navigate, setOpen]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 pt-[15vh]" onClick={() => { setOpen(false); setQuery(""); }}>
      <div className="w-full max-w-xl overflow-hidden rounded-xl border border-[#1E293B] bg-hx-surface-elevated shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-[#1E293B] px-4">
          <Search className="h-4 w-4 text-slate-500" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users, orders, assets, pages..."
            className="flex-1 bg-transparent py-3.5 text-sm text-slate-200 outline-none placeholder:text-slate-600"
          />
          <button onClick={() => { setOpen(false); setQuery(""); }} className="rounded p-1 text-slate-500 hover:text-slate-300">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto hx-scrollbar py-1">
          {results.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-slate-500">No results found</div>
          )}
          {results.map((r, i) => (
            <button
              key={r.id + r.type}
              onClick={() => { navigate(r.path); setOpen(false); setQuery(""); }}
              onMouseEnter={() => setSelectedIndex(i)}
              className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                i === selectedIndex ? "bg-hx-cyan/10" : "hover:bg-hx-surface-hover"
              }`}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-hx-surface text-slate-400">
                {r.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-slate-200 truncate">{r.title}</div>
                <div className="text-[11px] text-slate-500 truncate">{r.subtitle}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-hx-surface px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-slate-500">
                  {r.type}
                </span>
                {i === selectedIndex && <ArrowRight className="h-3 w-3 text-hx-cyan" />}
              </div>
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-[#1E293B] px-4 py-1.5 text-[10px] text-slate-600">
          <div className="flex items-center gap-3">
            <span><kbd className="rounded bg-hx-surface px-1 font-mono">↑↓</kbd> Navigate</span>
            <span><kbd className="rounded bg-hx-surface px-1 font-mono">↵</kbd> Open</span>
          </div>
          <span><kbd className="rounded bg-hx-surface px-1 font-mono">Esc</kbd> Close</span>
        </div>
      </div>
    </div>
  );
}
