import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { RiskScoreBar } from "@/components/shared/RiskScoreBar";
import { mockBuyers } from "@/stores/mockData";
import {
  ArrowLeft, Ban, Clock, CreditCard, Shield, Trash2,
  KeyRound, RefreshCw,
} from "lucide-react";

export default function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = mockBuyers.find((u) => u.id === id);

  if (!user) {
    return (
      <div className="flex h-96 items-center justify-center text-slate-500">
        User not found
      </div>
    );
  }

  const riskSignals = [
    { label: "Payment method changes", value: user.riskScore > 50 ? "High" : "Low", level: user.riskScore > 50 ? "error" : "success" as const },
    { label: "Login location variance", value: user.deviceCount > 3 ? "Medium" : "Low", level: user.deviceCount > 3 ? "warning" : "success" as const },
    { label: "Chargeback history", value: user.riskScore > 75 ? "High" : "None", level: user.riskScore > 75 ? "error" : "success" as const },
    { label: "Account age", value: "Established", level: "success" as const },
  ];

  return (
    <div className="animate-fade-in">
      <button onClick={() => navigate("/users")} className="mb-4 flex items-center gap-1.5 text-xs text-slate-500 hover:text-hx-cyan">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Buyers
      </button>

      <PageHeader title={user.name} subtitle={user.email}>
        <div className="flex items-center gap-2">
          <StatusBadge label={user.status} variant={user.status === "active" ? "success" : user.status === "suspended" ? "warning" : "error"} />
          <StatusBadge label={user.plan} variant="info" />
        </div>
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Risk Assessment</h3>
            <div className="flex items-center gap-4">
              <div className={`text-4xl font-bold ${user.riskScore <= 25 ? "text-emerald-400" : user.riskScore <= 50 ? "text-amber-400" : user.riskScore <= 75 ? "text-orange-400" : "text-hx-red"}`}>
                {user.riskScore}
                <span className="ml-1 text-sm font-medium text-slate-500">/100</span>
              </div>
              <RiskScoreBar score={user.riskScore} size="lg" showLabel={false} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {riskSignals.map((sig) => (
                <div key={sig.label} className="flex items-center justify-between rounded-lg bg-hx-surface p-2.5">
                  <span className="text-[11px] text-slate-500">{sig.label}</span>
                  <StatusBadge label={sig.value} variant={sig.level as "success" | "warning" | "error"} className="!text-[10px]" />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Login Activity</h3>
            <div className="space-y-2">
              {user.loginHistory.map((login) => (
                <div key={login.id} className="flex items-center gap-3 rounded-lg bg-hx-surface p-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-hx-surface-elevated">
                    <Shield className="h-3.5 w-3.5 text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-slate-300">{login.device}</div>
                    <div className="text-[10px] text-slate-500">{login.ip} · {login.location}</div>
                  </div>
                  <div className="text-[10px] text-slate-500">{new Date(login.timestamp).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Subscription History</h3>
            {user.subscriptionHistory.length === 0 ? (
              <p className="text-sm text-slate-500">No subscriptions</p>
            ) : (
              <div className="space-y-2">
                {user.subscriptionHistory.map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between rounded-lg bg-hx-surface p-2.5">
                    <div className="text-xs text-slate-300 capitalize">{sub.plan} Plan</div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-slate-400">${sub.amount}</span>
                      <StatusBadge label={sub.status} variant={sub.status === "active" ? "success" : "neutral"} className="!text-[10px]" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Total Spent</span>
                <span className="font-mono font-semibold text-slate-200">${user.totalSpent.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Orders</span>
                <span className="font-mono text-slate-200">{user.orders}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Devices</span>
                <span className="font-mono text-slate-200">{user.deviceCount}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Country</span>
                <span className="text-slate-200">{user.country}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Joined</span>
                <span className="text-slate-200">{user.joinDate}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Actions</h3>
            <div className="space-y-1.5">
              <button className="flex w-full items-center gap-2 rounded-lg bg-hx-surface px-3 py-2 text-xs text-slate-300 hover:bg-hx-surface-hover hover:text-hx-orange">
                <Clock className="h-3.5 w-3.5" /> Suspend Account
              </button>
              <button className="flex w-full items-center gap-2 rounded-lg bg-hx-surface px-3 py-2 text-xs text-slate-300 hover:bg-hx-surface-hover hover:text-hx-red">
                <Ban className="h-3.5 w-3.5" /> Ban Account
              </button>
              <button className="flex w-full items-center gap-2 rounded-lg bg-hx-surface px-3 py-2 text-xs text-slate-300 hover:bg-hx-surface-hover hover:text-slate-200">
                <KeyRound className="h-3.5 w-3.5" /> Reset Password
              </button>
              <button className="flex w-full items-center gap-2 rounded-lg bg-hx-surface px-3 py-2 text-xs text-slate-300 hover:bg-hx-surface-hover hover:text-emerald-400">
                <CreditCard className="h-3.5 w-3.5" /> Add Credits
              </button>
              <button className="flex w-full items-center gap-2 rounded-lg bg-hx-surface px-3 py-2 text-xs text-slate-300 hover:bg-hx-surface-hover hover:text-slate-200">
                <RefreshCw className="h-3.5 w-3.5" /> Change Plan
              </button>
              <button className="flex w-full items-center gap-2 rounded-lg bg-hx-red/10 px-3 py-2 text-xs text-hx-red hover:bg-hx-red/20">
                <Trash2 className="h-3.5 w-3.5" /> Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
