import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { RiskScoreBar } from "@/components/shared/RiskScoreBar";
import { mockSecuritySessions, mockLoginAttempts, mockFraudAlerts } from "@/stores/mockData";
import { Shield, Monitor, AlertTriangle, Lock, Globe } from "lucide-react";

export default function Security() {
  return (
    <div className="animate-fade-in">
      <PageHeader title="Security Center" subtitle="Active sessions, threats, and fraud monitoring" />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-3 text-center">
          <div className="text-2xl font-bold text-slate-100">{mockSecuritySessions.length}</div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500">Active Sessions</div>
        </div>
        <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-3 text-center">
          <div className="text-2xl font-bold text-hx-red">{mockLoginAttempts.filter((a) => a.blocked).length}</div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500">Blocked IPs (24h)</div>
        </div>
        <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-3 text-center">
          <div className="text-2xl font-bold text-hx-orange">{mockFraudAlerts.filter((a) => a.status === "open").length}</div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500">Open Fraud Alerts</div>
        </div>
        <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-3 text-center">
          <div className="text-2xl font-bold text-emerald-400">0</div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500">Critical Incidents</div>
        </div>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-4">
          <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <Monitor className="h-3.5 w-3.5" /> Active Admin Sessions
          </h3>
          <div className="space-y-2">
            {mockSecuritySessions.map((session) => (
              <div key={session.id} className="flex items-center gap-3 rounded-lg bg-hx-surface p-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-hx-cyan/20">
                  <Shield className="h-4 w-4 text-hx-cyan" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-200">{session.admin}</span>
                    <StatusBadge label={session.role.replace("_", "-")} variant="purple" className="!text-[9px]" />
                  </div>
                  <div className="text-[10px] text-slate-500">{session.device} · {session.ip}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-500">{session.location}</div>
                  <div className="text-[10px] text-slate-600">{new Date(session.lastActive).toLocaleTimeString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-4">
          <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <AlertTriangle className="h-3.5 w-3.5" /> Failed Login Attempts (24h)
          </h3>
          <div className="space-y-2">
            {mockLoginAttempts.map((attempt) => (
              <div key={attempt.id} className={`flex items-center gap-3 rounded-lg p-2.5 ${attempt.blocked ? "bg-hx-red/5 border border-hx-red/20" : "bg-hx-surface"}`}>
                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${attempt.blocked ? "bg-hx-red/20" : "bg-amber-500/10"}`}>
                  <Lock className={`h-4 w-4 ${attempt.blocked ? "text-hx-red" : "text-amber-400"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-slate-300 font-mono">{attempt.ip}</div>
                  <div className="text-[10px] text-slate-500">{attempt.username} · {attempt.count} attempts</div>
                </div>
                <StatusBadge label={attempt.blocked ? "BLOCKED" : "MONITORING"} variant={attempt.blocked ? "error" : "warning"} className="!text-[9px]" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-4">
        <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <Globe className="h-3.5 w-3.5" /> Fraud Alerts
        </h3>
        <div className="space-y-2">
          {mockFraudAlerts.map((alert) => (
            <div key={alert.id} className="flex items-center gap-3 rounded-lg bg-hx-surface p-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-200">{alert.user}</span>
                  <StatusBadge label={alert.type} variant="error" className="!text-[10px]" />
                  <span className="text-[10px] text-slate-600">{alert.source}</span>
                </div>
                <div className="mt-1">
                  <RiskScoreBar score={alert.score} size="sm" />
                </div>
              </div>
              <StatusBadge label={alert.status} variant={alert.status === "open" ? "error" : alert.status === "investigating" ? "warning" : "success"} className="!text-[10px]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
