import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { mockSellers } from "@/stores/mockData";
import { ArrowLeft, Star, CheckCircle, XCircle, FileText } from "lucide-react";

export default function SellerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const seller = mockSellers.find((s) => s.id === id);

  if (!seller) return <div className="flex h-96 items-center justify-center text-slate-500">Seller not found</div>;

  return (
    <div className="animate-fade-in">
      <button onClick={() => navigate("/sellers")} className="mb-4 flex items-center gap-1.5 text-xs text-slate-500 hover:text-hx-cyan">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Sellers
      </button>

      <PageHeader title={seller.name} subtitle={`@${seller.username}`}>
        <div className="flex items-center gap-2">
          <StatusBadge label={seller.level} variant="purple" />
          <StatusBadge label={seller.verification} variant={seller.verification === "verified" ? "success" : "warning"} />
        </div>
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Revenue Summary</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-hx-surface p-3">
                <div className="text-[11px] text-slate-500">Total Revenue</div>
                <div className="mt-1 text-xl font-bold text-slate-100">${seller.totalRevenue.toLocaleString()}</div>
              </div>
              <div className="rounded-lg bg-hx-surface p-3">
                <div className="text-[11px] text-slate-500">This Month</div>
                <div className="mt-1 text-xl font-bold text-hx-cyan">${seller.monthlyRevenue.toLocaleString()}</div>
              </div>
              <div className="rounded-lg bg-hx-surface p-3">
                <div className="text-[11px] text-slate-500">Pending Clearance</div>
                <div className="mt-1 text-xl font-bold text-amber-400">${seller.pendingClearance.toLocaleString()}</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Verification Status</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-lg bg-hx-surface p-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-500" />
                  <span className="text-xs text-slate-300">Identity Documents</span>
                </div>
                <div className="flex items-center gap-2">
                  {seller.verification === "verified" ? (
                    <><CheckCircle className="h-4 w-4 text-emerald-400" /><span className="text-xs text-emerald-400">Verified</span></>
                  ) : seller.verification === "pending" ? (
                    <><span className="text-xs text-amber-400">Pending Review</span></>
                  ) : (
                    <><XCircle className="h-4 w-4 text-slate-500" /><span className="text-xs text-slate-500">Not Submitted</span></>
                  )}
                </div>
              </div>
              {seller.verification === "pending" && (
                <div className="flex gap-2 mt-2">
                  <button className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-400 hover:bg-emerald-500/20">
                    <CheckCircle className="h-3.5 w-3.5" /> Verify
                  </button>
                  <button className="flex items-center gap-1.5 rounded-lg bg-hx-red/10 px-3 py-1.5 text-xs text-hx-red hover:bg-hx-red/20">
                    <XCircle className="h-3.5 w-3.5" /> Reject
                  </button>
                </div>
              )}
            </div>
          </div>

          {seller.fraudSignals && seller.fraudSignals.length > 0 && (
            <div className="rounded-xl border border-hx-red/30 bg-hx-red/5 p-4">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-hx-red">Fraud Signals</h3>
              {seller.fraudSignals.map((signal, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-hx-orange">
                  <XCircle className="h-3 w-3" /> {signal}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-xs"><span className="text-slate-500">Assets</span><span className="text-slate-200">{seller.assets}</span></div>
              <div className="flex justify-between text-xs"><span className="text-slate-500">Gigs</span><span className="text-slate-200">{seller.gigs}</span></div>
              <div className="flex justify-between text-xs"><span className="text-slate-500">Rating</span>
                <div className="flex items-center gap-1"><Star className="h-3 w-3 fill-amber-400 text-amber-400" /><span className="text-slate-200">{seller.rating}</span></div>
              </div>
              <div className="flex justify-between text-xs"><span className="text-slate-500">Plan</span><span className="text-hx-cyan capitalize">{seller.plan}</span></div>
              <div className="flex justify-between text-xs"><span className="text-slate-500">Country</span><span className="text-slate-200">{seller.country}</span></div>
              <div className="flex justify-between text-xs"><span className="text-slate-500">Joined</span><span className="text-slate-200">{seller.joinDate}</span></div>
            </div>
          </div>

          <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Admin Actions</h3>
            <div className="space-y-1.5">
              <button className="flex w-full items-center gap-2 rounded-lg bg-hx-surface px-3 py-2 text-xs text-slate-300 hover:bg-hx-surface-hover hover:text-emerald-400">
                <CheckCircle className="h-3.5 w-3.5" /> Verify Account
              </button>
              <button className="flex w-full items-center gap-2 rounded-lg bg-hx-surface px-3 py-2 text-xs text-slate-300 hover:bg-hx-surface-hover hover:text-hx-orange">
                <FileText className="h-3.5 w-3.5" /> View Payout History
              </button>
              <button className="flex w-full items-center gap-2 rounded-lg bg-hx-surface px-3 py-2 text-xs text-slate-300 hover:bg-hx-surface-hover hover:text-hx-purple">
                <Star className="h-3.5 w-3.5" /> Feature Seller
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
