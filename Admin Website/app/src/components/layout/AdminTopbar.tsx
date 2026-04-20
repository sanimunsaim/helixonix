import { useState, useEffect } from "react";
import { useRoleStore } from "@/stores/roleStore";
import { useUIStore } from "@/stores/uiStore";
import { Bell, Shield, CreditCard, Users, UserCheck, Clock } from "lucide-react";

const ROLE_CONFIG = {
  super_admin: { label: "SUPER ADMIN", color: "bg-hx-purple/20 text-hx-purple border-hx-purple/30", icon: Shield },
  finance_admin: { label: "FINANCE", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30", icon: CreditCard },
  manager: { label: "MANAGER", color: "bg-amber-500/10 text-amber-400 border-amber-500/30", icon: UserCheck },
  moderator: { label: "MODERATOR", color: "bg-sky-500/10 text-sky-400 border-sky-500/30", icon: Users },
};

export function AdminTopbar() {
  const currentRole = useRoleStore((s) => s.currentRole);
  const setRole = useRoleStore((s) => s.setRole);
  const notifications = useUIStore((s) => s.notifications);
  const markNotificationRead = useUIStore((s) => s.markNotificationRead);
  const unreadCount = useUIStore((s) => s.unreadCount)();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const roleConfig = ROLE_CONFIG[currentRole];
  const RoleIcon = roleConfig.icon;

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        useUIStore.getState().setCommandSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#1E293B] bg-[#080C18]/80 backdrop-blur-md px-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          <span>Platform Online</span>
        </div>
        <div className="h-3 w-px bg-[#1E293B]" />
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
          <Clock className="h-3 w-3" />
          <span>{currentTime.toISOString().slice(0, 19).replace("T", " ")} UTC</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wider ${roleConfig.color}`}
          >
            <RoleIcon className="h-3 w-3" />
            {roleConfig.label}
          </button>
          {showRoleSwitcher && (
            <div className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-lg border border-[#1E293B] bg-hx-surface-elevated shadow-xl z-50">
              <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-[#1E293B]">
                Switch Role
              </div>
              {(Object.keys(ROLE_CONFIG) as Array<keyof typeof ROLE_CONFIG>).map((role) => {
                const cfg = ROLE_CONFIG[role];
                const CfgIcon = cfg.icon;
                return (
                  <button
                    key={role}
                    onClick={() => { setRole(role); setShowRoleSwitcher(false); }}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-xs transition-colors ${
                      currentRole === role ? "bg-hx-cyan/10 text-hx-cyan" : "text-slate-300 hover:bg-hx-surface-hover"
                    }`}
                  >
                    <CfgIcon className="h-3.5 w-3.5" />
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-md p-2 text-slate-400 hover:bg-hx-surface-hover hover:text-slate-200"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-hx-red px-1 text-[9px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 overflow-hidden rounded-lg border border-[#1E293B] bg-hx-surface-elevated shadow-xl z-50">
              <div className="flex items-center justify-between px-4 py-2 border-b border-[#1E293B]">
                <span className="text-xs font-semibold text-slate-300">Notifications</span>
                <span className="text-[10px] text-slate-500">{unreadCount} unread</span>
              </div>
              <div className="max-h-72 overflow-y-auto hx-scrollbar">
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => { markNotificationRead(n.id); }}
                    className={`flex w-full items-start gap-2.5 px-4 py-2.5 text-left transition-colors hover:bg-hx-surface-hover ${
                      !n.read ? "bg-hx-cyan/5" : ""
                    }`}
                  >
                    <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${
                      n.type === "error" ? "bg-hx-red" : n.type === "warning" ? "bg-hx-orange" : n.type === "success" ? "bg-hx-green" : "bg-hx-cyan"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-slate-200 truncate">{n.title}</span>
                        {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-hx-cyan" />}
                      </div>
                      <p className="mt-0.5 text-[11px] text-slate-500 line-clamp-2">{n.message}</p>
                      <p className="mt-1 text-[10px] text-slate-600">
                        {new Date(n.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-[#1E293B]" />

        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-hx-cyan to-hx-purple text-[10px] font-bold text-white">
            SA
          </div>
          <div className="hidden md:block">
            <div className="text-xs font-medium text-slate-200">Admin (Super)</div>
            <div className="text-[10px] text-slate-500">admin@helixonix.com</div>
          </div>
        </div>
      </div>
    </header>
  );
}
