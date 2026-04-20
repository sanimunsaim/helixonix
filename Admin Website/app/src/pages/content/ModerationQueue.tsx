import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { contentApi } from "@/lib/api";
import {
  CheckCircle, XCircle, Edit3, SkipForward, SkipBack, Image, Music,
  Video, Box, FileCode, AlertTriangle, Sparkles, Shield, Loader2
} from "lucide-react";

const typeIcons: Record<string, React.ReactNode> = {
  template: <FileCode className="h-4 w-4" />,
  stock: <Image className="h-4 w-4" />,
  image: <Image className="h-4 w-4" />,
  audio: <Music className="h-4 w-4" />,
  video: <Video className="h-4 w-4" />,
  "3d": <Box className="h-4 w-4" />,
  vector: <Box className="h-4 w-4" />,
};

export default function ModerationQueue() {
  const queryClient = useQueryClient();
  const { data: queueData, isLoading } = useQuery({
    queryKey: ['moderation-queue'],
    queryFn: () => contentApi.queue(),
  });

  const assets = queueData?.data || [];
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [showAI, setShowAI] = useState(true);
  const [decisionModal, setDecisionModal] = useState<"approve" | "reject" | "changes" | null>(null);
  const [rejectReason, setRejectReason] = useState("Missing metadata");

  const current = assets[currentIndex];

  const approveMutation = useMutation({
    mutationFn: (id: string) => contentApi.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderation-queue'] });
      setDecisionModal(null);
      if (currentIndex > 0 && currentIndex === assets.length - 1) {
        setCurrentIndex(currentIndex - 1);
      }
    }
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string, reason: string }) => contentApi.reject(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderation-queue'] });
      setDecisionModal(null);
      if (currentIndex > 0 && currentIndex === assets.length - 1) {
        setCurrentIndex(currentIndex - 1);
      }
    }
  });

  const handleApprove = useCallback(() => {
    if (!current) return;
    setDecisionModal("approve");
    approveMutation.mutate(current.id);
  }, [current, approveMutation]);

  const handleReject = useCallback(() => setDecisionModal("reject"), []);
  const handleChanges = useCallback(() => setDecisionModal("changes"), []);
  
  const nextAsset = useCallback(() => setCurrentIndex((i) => Math.min(i + 1, assets.length - 1)), [assets.length]);
  const prevAsset = useCallback(() => setCurrentIndex((i) => Math.max(i - 1, 0)), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (decisionModal) return;
      const key = e.key.toLowerCase();
      if (key === "a") handleApprove();
      else if (key === "r") handleReject();
      else if (key === "n") nextAsset();
      else if (key === "p") prevAsset();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleApprove, handleReject, nextAsset, prevAsset, decisionModal]);

  return (
    <div className="animate-fade-in">
      <PageHeader title="Moderation Queue" subtitle="Review and approve submitted assets" badge={`${assets.length} PENDING`} badgeColor="bg-hx-orange/10 text-hx-orange" />

      <div className="mb-4 grid grid-cols-4 gap-3">
        <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-3 text-center">
          <div className="text-2xl font-bold text-hx-orange">{assets.length}</div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500">Total Pending</div>
        </div>
        <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-3 text-center">
          <div className="text-2xl font-bold text-emerald-400">23</div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500">Auto-Approved Today</div>
        </div>
        <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-3 text-center">
          <div className="text-2xl font-bold text-hx-cyan">19</div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500">Manually Approved</div>
        </div>
        <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-3 text-center">
          <div className="text-2xl font-bold text-hx-red">3</div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500">Rejected Today</div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center rounded-xl border border-[#1E293B] bg-[#111827] text-slate-500">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading queue...
        </div>
      ) : !current ? (
        <div className="flex h-64 items-center justify-center rounded-xl border border-[#1E293B] bg-[#111827] text-slate-500">
          <CheckCircle className="mr-2 h-5 w-5 text-emerald-400" /> Queue is empty!
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-5">
          <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-4 lg:col-span-1">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Filters</h3>
            <div className="mb-3">
              <label className="mb-1 block text-[11px] text-slate-500">Status</label>
              <div className="space-y-1">
                {["pending", "auto-flagged", "manual-review"].map((s) => (
                  <button key={s} onClick={() => setStatusFilter(s)}
                    className={`w-full rounded-md px-2.5 py-1.5 text-left text-[11px] capitalize transition-colors ${statusFilter === s ? "bg-hx-cyan/10 text-hx-cyan" : "text-slate-400 hover:bg-hx-surface-hover"}`}>
                    {s.replace("-", " ")}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-3">
              <label className="mb-1 block text-[11px] text-slate-500">Type</label>
              <div className="space-y-1">
                {(["all", "template", "stock", "audio", "video", "3d"] as const).map((t) => (
                  <button key={t} onClick={() => setTypeFilter(t)}
                    className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-[11px] capitalize transition-colors ${typeFilter === t ? "bg-hx-cyan/10 text-hx-cyan" : "text-slate-400 hover:bg-hx-surface-hover"}`}>
                    {t !== "all" && typeIcons[t]} {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4 border-t border-[#1E293B] pt-3">
              <div className="text-[10px] text-slate-600">Keyboard Shortcuts</div>
              <div className="mt-1 space-y-0.5 text-[10px] text-slate-500 font-mono">
                <div><kbd className="rounded bg-hx-surface px-1">A</kbd> Approve</div>
                <div><kbd className="rounded bg-hx-surface px-1">R</kbd> Reject</div>
                <div><kbd className="rounded bg-hx-surface px-1">N</kbd> Next</div>
                <div><kbd className="rounded bg-hx-surface px-1">P</kbd> Previous</div>
              </div>
            </div>
          </div>

          <div className="space-y-4 lg:col-span-4">
            <div className="flex items-center justify-between rounded-xl border border-[#1E293B] bg-[#111827] px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500">Asset {currentIndex + 1} of {assets.length}</span>
                <div className="h-3 w-px bg-[#1E293B]" />
                <StatusBadge label={current.type} variant="info" className="!capitalize" />
                <StatusBadge label={current.aiQualityScore > 70 ? "auto-approve" : "manual-review"} variant={current.aiQualityScore > 70 ? "success" : "warning"} />
              </div>
              <div className="flex items-center gap-2">
                <button onClick={prevAsset} disabled={currentIndex === 0} className="rounded-lg bg-hx-surface px-3 py-1.5 text-xs text-slate-300 hover:bg-hx-surface-hover disabled:opacity-30 flex items-center gap-1">
                  <SkipBack className="h-3 w-3" /> Prev
                </button>
                <button onClick={nextAsset} disabled={currentIndex === assets.length - 1} className="rounded-lg bg-hx-surface px-3 py-1.5 text-xs text-slate-300 hover:bg-hx-surface-hover disabled:opacity-30 flex items-center gap-1">
                  Next <SkipForward className="h-3 w-3" />
                </button>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-5">
              <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-4 lg:col-span-3">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-slate-200">{current.title}</h2>
                  <span className="font-mono text-[11px] text-slate-500">{current.price > 0 ? `$${current.price}` : "Free"}</span>
                </div>
                <div className="flex h-64 items-center justify-center rounded-lg bg-hx-surface">
                  <div className="text-center">
                    {typeIcons[current.type] || <FileCode className="h-4 w-4" />}
                    <p className="mt-2 text-xs text-slate-500">{current.type} preview</p>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-xs text-slate-400">{current.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {current.tags?.map((tag: string) => (
                      <span key={tag} className="rounded-full bg-hx-surface px-2 py-0.5 text-[10px] text-slate-500">#{tag}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4 lg:col-span-2">
                <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-4">
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Metadata</h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between"><span className="text-slate-500">Seller ID</span><span className="text-slate-300">{current.sellerId}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Category</span><span className="text-slate-300">{current.category}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">License</span><span className="text-slate-300">{current.licenseType}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Price</span><span className="font-mono text-slate-300">${current.price / 100}</span></div>
                  </div>
                </div>

                <div className={`rounded-xl border ${showAI ? "border-hx-cyan/30" : "border-[#1E293B]"} bg-[#111827] p-4`}>
                  <button onClick={() => setShowAI(!showAI)} className="mb-3 flex w-full items-center justify-between">
                    <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-hx-cyan">
                      <Sparkles className="h-3.5 w-3.5" /> AI Assessment
                    </h3>
                    <span className="text-[10px] text-slate-500">{showAI ? "Hide" : "Show"}</span>
                  </button>
                  {showAI && (
                    <div className="space-y-2">
                      <AIScoreBar label="NSFW Score" score={current.aiNsfwScore || 0} color="green" />
                      <AIScoreBar label="Copyright" score={current.aiCopyrightScore || 0} color={(current.aiCopyrightScore || 0) > 30 ? "red" : "green"} />
                      <AIScoreBar label="Quality" score={current.aiQualityScore || 0} color={(current.aiQualityScore || 0) > 70 ? "green" : "orange"} />
                      <div className="mt-3 rounded-lg bg-hx-surface p-2.5">
                        <div className="flex items-center gap-1.5">
                          <Shield className="h-3 w-3 text-hx-cyan" />
                          <span className="text-[11px] font-semibold text-slate-300">AI Recommendation:</span>
                          <StatusBadge label={(current.aiQualityScore || 0) > 70 ? "auto-approve" : "manual-review"}
                            variant={(current.aiQualityScore || 0) > 70 ? "success" : "warning"}
                            className="!text-[10px]" />
                        </div>
                        {current.copyrightScore > 20 && (
                          <p className="mt-1 text-[10px] text-hx-orange">
                            <AlertTriangle className="mr-1 inline h-3 w-3" />
                            Copyright similarity detected with known watermark
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button onClick={handleApprove} className="flex flex-col items-center gap-1 rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-3 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-colors">
                    <CheckCircle className="h-5 w-5" /> Approve
                  </button>
                  <button onClick={handleChanges} className="flex flex-col items-center gap-1 rounded-xl border border-amber-500/30 bg-amber-500/10 py-3 text-xs font-semibold text-amber-400 hover:bg-amber-500/20 transition-colors">
                    <Edit3 className="h-5 w-5" /> Changes
                  </button>
                  <button onClick={handleReject} className="flex flex-col items-center gap-1 rounded-xl border border-hx-red/30 bg-hx-red/10 py-3 text-xs font-semibold text-hx-red hover:bg-hx-red/20 transition-colors">
                    <XCircle className="h-5 w-5" /> Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {decisionModal === "reject" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md rounded-xl border border-[#1E293B] bg-hx-surface-elevated p-5 shadow-2xl">
            <h3 className="text-sm font-semibold text-hx-red">Reject Asset</h3>
            <p className="mt-1 text-xs text-slate-500">{current?.title}</p>
            <div className="mt-3">
              <label className="block text-[11px] text-slate-500 mb-1">Reason</label>
              <select value={rejectReason} onChange={e => setRejectReason(e.target.value)} className="w-full rounded-lg border border-[#1E293B] bg-hx-surface px-3 py-2 text-xs text-slate-200 outline-none">
                <option value="Missing metadata">Missing metadata</option>
                <option value="Quality too low">Quality too low</option>
                <option value="Copyright concern">Copyright concern</option>
                <option value="Violates content policy">Violates content policy</option>
                <option value="Duplicate submission">Duplicate submission</option>
              </select>
            </div>
            <div className="mt-3">
              <label className="block text-[11px] text-slate-500 mb-1">Message to seller (optional)</label>
              <textarea rows={3} className="w-full rounded-lg border border-[#1E293B] bg-hx-surface px-3 py-2 text-xs text-slate-200 outline-none placeholder:text-slate-600"
                placeholder="Explain why this asset was rejected..." />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setDecisionModal(null)} className="rounded-lg border border-[#1E293B] px-4 py-2 text-xs text-slate-300 hover:bg-hx-surface-hover">Cancel</button>
              <button onClick={() => { rejectMutation.mutate({ id: current.id, reason: rejectReason }); }} disabled={rejectMutation.isPending} className="rounded-lg bg-hx-red/10 px-4 py-2 text-xs text-hx-red hover:bg-hx-red/20 disabled:opacity-50">{rejectMutation.isPending ? 'Rejecting...' : 'Confirm Reject'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AIScoreBar({ label, score, color }: { label: string; score: number; color: "green" | "orange" | "red" }) {
  const colors = { green: "from-emerald-500 to-emerald-400", orange: "from-amber-500 to-amber-400", red: "from-hx-red to-red-400" };
  const textColors = { green: "text-emerald-400", orange: "text-amber-400", red: "text-hx-red" };
  const riskLabels = { green: "Low", orange: "Medium", red: "High" };

  return (
    <div>
      <div className="mb-0.5 flex items-center justify-between">
        <span className="text-[11px] text-slate-500">{label}</span>
        <span className={`text-[11px] font-bold ${textColors[color]}`}>{score}% ({riskLabels[color]})</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-hx-surface-hover">
        <div className={`h-full rounded-full bg-gradient-to-r ${colors[color]}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}
