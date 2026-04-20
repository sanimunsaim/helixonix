import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { mockPayouts } from "@/stores/mockData";
import { CheckCircle, XCircle, Clock, AlertTriangle, Download } from "lucide-react";

export default function Payouts() {
  return (
    <div className="animate-fade-in">
      <PageHeader title="Payout Queue" subtitle="Approve and process seller payouts" badge={`${mockPayouts.length} PENDING`} badgeColor="bg-hx-orange/10 text-hx-orange">
        <button className="flex items-center gap-1.5 rounded-lg border border-[#1E293B] bg-hx-surface px-3 py-1.5 text-xs text-slate-300 hover:bg-hx-surface-hover">
          <Download className="h-3.5 w-3.5" /> Export
        </button>
      </PageHeader>

      <div className="space-y-3">
        {mockPayouts.map((payout) => (
          <div key={payout.id} className="rounded-xl border border-[#1E293B] bg-[#111827] p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-hx-cyan">{payout.requestNumber}</span>
                  <StatusBadge label={payout.status} variant={payout.status === "pending" ? "warning" : payout.status === "approved" ? "success" : "neutral"} />
                </div>
                <div className="mt-1 text-xs text-slate-300">{payout.seller} · {payout.method}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <VerificationBadge passed={payout.verification.noActiveDisputes} label="No disputes" />
                  <VerificationBadge passed={payout.verification.fundsCleared} label="Funds cleared" />
                  <VerificationBadge passed={payout.verification.accountVerified} label="Verified" />
                  <VerificationBadge passed={payout.verification.taxInfoComplete} label="Tax info" />
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-slate-100">${payout.amount.toLocaleString()}</div>
                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                  <Clock className="h-3 w-3" /> {payout.daysWaiting} days waiting
                </div>
                {payout.daysWaiting > 2 && (
                  <div className="mt-1 text-[10px] text-hx-orange flex items-center gap-1 justify-end">
                    <AlertTriangle className="h-3 w-3" /> Overdue
                  </div>
                )}
              </div>
            </div>
            <div className="mt-3 flex gap-2 border-t border-[#1E293B] pt-3">
              <button className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30">
                <CheckCircle className="h-3.5 w-3.5" /> Approve
              </button>
              <button className="flex items-center gap-1.5 rounded-lg bg-hx-red/10 px-3 py-1.5 text-xs text-hx-red hover:bg-hx-red/20 border border-hx-red/30">
                <XCircle className="h-3.5 w-3.5" /> Reject
              </button>
              <button className="flex items-center gap-1.5 rounded-lg bg-hx-surface px-3 py-1.5 text-xs text-slate-400 hover:bg-hx-surface-hover">
                <Download className="h-3.5 w-3.5" /> Manual Process
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VerificationBadge({ passed, label }: { passed: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
      passed ? "bg-emerald-500/10 text-emerald-400" : "bg-hx-red/10 text-hx-red"
    }`}>
      {passed ? <CheckCircle className="h-2.5 w-2.5" /> : <XCircle className="h-2.5 w-2.5" />}
      {label}
    </div>
  );
}
