import { create } from "zustand";

interface UIState {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  toggleSidebar: () => void;

  commandSearchOpen: boolean;
  setCommandSearchOpen: (v: boolean) => void;

  notifications: Array<{
    id: string;
    title: string;
    message: string;
    type: "info" | "warning" | "success" | "error";
    read: boolean;
    timestamp: Date;
  }>;
  markNotificationRead: (id: string) => void;
  unreadCount: () => number;

  toasts: Array<{
    id: string;
    message: string;
    type: "success" | "error" | "warning" | "info";
  }>;
  addToast: (toast: { message: string; type: "success" | "error" | "warning" | "info" }) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  sidebarCollapsed: false,
  setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  commandSearchOpen: false,
  setCommandSearchOpen: (v) => set({ commandSearchOpen: v }),

  notifications: [
    { id: "1", title: "New dispute opened", message: "Order #HX-8942 — buyer claims non-delivery", type: "warning", read: false, timestamp: new Date(Date.now() - 5 * 60000) },
    { id: "2", title: "Moderation queue high", message: "47 assets pending review — oldest is 6 hours", type: "warning", read: false, timestamp: new Date(Date.now() - 15 * 60000) },
    { id: "3", title: "Payout processed", message: "$12,450 transferred to 8 sellers", type: "success", read: true, timestamp: new Date(Date.now() - 30 * 60000) },
    { id: "4", title: "Fraud alert", message: "User u_xp920 flagged — score: 87/100", type: "error", read: false, timestamp: new Date(Date.now() - 45 * 60000) },
    { id: "5", title: "HELIX-BRAIN update", message: "Auto-approved 23 assets in last batch", type: "info", read: true, timestamp: new Date(Date.now() - 60 * 60000) },
  ],
  markNotificationRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),
  unreadCount: () => get().notifications.filter((n) => !n.read).length,

  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(7);
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
