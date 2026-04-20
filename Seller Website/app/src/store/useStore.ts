import { create } from 'zustand';

interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface AppState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;

  unreadMessages: number;
  unreadOrders: number;
  setUnreadMessages: (count: number) => void;
  setUnreadOrders: (count: number) => void;

  pageTitle: string;
  setPageTitle: (title: string) => void;

  activeModal: string | null;
  modalData: Record<string, unknown> | null;
  openModal: (modal: string, data?: Record<string, unknown>) => void;
  closeModal: () => void;
}

export const useStore = create<AppState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  toasts: [],
  addToast: (toast) =>
    set((s) => ({
      toasts: [...s.toasts, { ...toast, id: Math.random().toString(36).slice(2) }],
    })),
  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  unreadMessages: 3,
  unreadOrders: 2,
  setUnreadMessages: (count) => set({ unreadMessages: count }),
  setUnreadOrders: (count) => set({ unreadOrders: count }),

  pageTitle: 'Dashboard',
  setPageTitle: (title) => set({ pageTitle: title }),

  activeModal: null,
  modalData: null,
  openModal: (modal, data) => set({ activeModal: modal, modalData: data || null }),
  closeModal: () => set({ activeModal: null, modalData: null }),
}));
