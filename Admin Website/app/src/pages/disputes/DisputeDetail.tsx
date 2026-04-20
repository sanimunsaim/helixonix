import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { mockDisputes } from "@/stores/mockData";
import { ArrowLeft, Brain, CheckCircle, XCircle, AlertTriangle, UserPlus, FileText, Clock } from "lucide-react";

export default function DisputeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispute = mockDisputes.find((d) => d.id === id);
  const [resolution, setResolution] = useState("full_refund");
  const [refundPercent, setRefundPercent] = useState(50);
  const [resolutionMsg, setResolutionMsg] = useState("");
  const [notes, setNotes] = useState("");
  const [selfAssigned, setSelfAssigned] = useState(!!dispute?.assignedTo);

  if (!dispute) return <div className="flex h-96 items-center justify-center text-slate-500">Dispute not found</div>;

  return (
    <div className="animate-fade-in">
      <button onClick={() => navigate("/disputes")} className="mb-4 flex items-center gap-1.5 text-xs text-slate-500 hover:text-hx-cyan">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Disputes
      </button>

      <PageHeader title={dispute.id} subtitle={`${dispute.orderNumber} — ${dispute.reason}`}>
        <StatusBadge label={dispute.status} variant={dispute.status === "urgent" ? "error" : dispute.status === "open" ? "warning" : "success"} />
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-4 lg:col-span-3">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> Timeline
          </h3>
          <div className="space-y-3">
            {dispute.timeline.map((evt) => (
              <div key={evt.id} className="flex gap-2">
                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-hx-cyan shrink-0" />
                <div>
                  <div className="text-xs text-slate-300">{evt.event}</div>
                  <div className="text-[10px] text-slate-600">{evt.actor} · {new Date(evt.timestamp).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 lg:col-span-6">
          <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Evidence Review</h3>

            <div className="mb-4 rounded-lg bg-hx-red/5 border border-hx-red/20 p-3">
              <div className="text-[10px] uppercase tracking-wider text-hx-red mb-1">Buyer Evidence</div>
              {dispute.buyerEvidence.map((ev) => (
                <div key={ev.id}>
                  <div className="text-xs text-slate-300">{ev.reason}</div>
                  {ev.messageExcerpts.map((msg, i) => (
                    <div key={i} className="mt-1 text-[11px] italic text-slate-500">"{msg}"</div>
                  ))}
                </div>
              ))}
            </div>

            <div className="rounded-lg bg-hx-purple/5 border border-hx-purple/20 p-3">
              <div className="text-[10px] uppercase tracking-wider text-hx-purple mb-1">Seller Evidence</div>
              {dispute.sellerEvidence.map((ev) => (
                <div key={ev.id}>
                  <div className="text-xs text-slate-300">{ev.reason}</div>
                  {ev.messageExcerpts.map((msg, i) => (
                    <div key={i} className="mt-1 text-[11px] italic text-slate-500">"{msg}"</div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-hx-cyan/30 bg-hx-cyan/5 p-4">
            <h3 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-hx-cyan">
              <Brain className="h-3.5 w-3.5" /> HELIX-BRAIN Assessment
            </h3>
            <div className="rounded-lg bg-hx-surface p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300">Recommendation</span>
                <span className="text-xs font-semibold text-hx-cyan">{dispute.aiRecommendation}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-slate-500">Confidence</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-24 overflow-hidden rounded-full bg-hx-surface-hover">
                    <div className="h-full rounded-full bg-gradient-to-r from-hx-cyan to-hx-purple" style={{ width: `${dispute.aiConfidence}%` }} />
                  </div>
                  <span className="text-xs font-bold text-slate-200">{dispute.aiConfidence}%</span>
                </div>
              </div>
              <p className="mt-2 text-[11px] text-slate-500 italic">{dispute.aiReasoning}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 lg:col-span-3">
          <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Decision Panel</h3>

            {!selfAssigned ? (
              <button onClick={() => setSelfAssigned(true)} className="flex w-full items-center gap-2 rounded-lg bg-hx-cyan/10 px-3 py-2 text-xs text-hx-cyan hover:bg-hx-cyan/20">
                <UserPlus className="h-3.5 w-3.5" /> Self-Assign This Case
              </button>
            ) : (
              <>
                <div className="mb-3">
                  <label className="block text-[11px] text-slate-500 mb-1">Internal Notes</label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
                    className="w-full rounded-lg border border-[#1E293B] bg-hx-surface px-3 py-2 text-xs text-slate-200 outline-none placeholder:text-slate-600"
                    placeholder="Private notes..." />
                </div>

                <div className="mb-3 space-y-1.5">
                  <label className="block text-[11px] text-slate-500">Resolution</label>
                  {[
                    { value: "full_refund", label: "Full Refund to Buyer", icon: <CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> },
                    { value: "partial_refund", label: `Partial Refund (${refundPercent}%)`, icon: <AlertTriangle className="h-3.5 w-3.5 text-amber-400" /> },
                    { value: "seller_wins", label: "No Refund — Seller Wins", icon: <XCircle className="h-3.5 w-3.5 text-hx-red" /> },
                    { value: "mutual", label: "Mutual Resolution", icon: <FileText className="h-3.5 w-3.5 text-hx-purple" /> },
                  ].map((opt) => (
                    <button key={opt.value} onClick={() => setResolution(opt.value)}
                      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs transition-colors ${resolution === opt.value ? "bg-hx-cyan/10 text-hx-cyan border border-hx-cyan/30" : "bg-hx-surface text-slate-300 hover:bg-hx-surface-hover border border-transparent"}`}>
                      {opt.icon} {opt.label}
                    </button>
                  ))}
                </div>

                {resolution === "partial_refund" && (
                  <div className="mb-3">
                    <label className="block text-[11px] text-slate-500 mb-1">Refund %: {refundPercent}%</label>
                    <input type="range" min={10} max={90} value={refundPercent} onChange={(e) => setRefundPercent(Number(e.target.value))}
                      className="w-full accent-hx-cyan" />
                  </div>
                )}

                <div className="mb-3">
                  <label className="block text-[11px] text-slate-500 mb-1">Resolution Message</label>
                  <textarea value={resolutionMsg} onChange={(e) => setResolutionMsg(e.target.value)} rows={3}
                    className="w-full rounded-lg border border-[#1E293B] bg-hx-surface px-3 py-2 text-xs text-slate-200 outline-none placeholder:text-slate-600"
                    placeholder="Message sent to both parties..." />
                </div>

                <button className="w-full rounded-lg bg-emerald-500/10 py-2 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30">
                  Apply Resolution
                </button>
                <button className="mt-2 w-full rounded-lg bg-hx-surface py-2 text-xs text-slate-500 hover:bg-hx-surface-hover">
                  Escalate to Senior Admin
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
