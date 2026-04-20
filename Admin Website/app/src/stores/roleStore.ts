import { create } from "zustand";

export type AdminRole = "super_admin" | "finance_admin" | "manager" | "moderator";

export const ROLE_HIERARCHY: Record<AdminRole, number> = {
  super_admin: 4,
  finance_admin: 3,
  manager: 2,
  moderator: 1,
};

interface RoleState {
  currentRole: AdminRole;
  setRole: (role: AdminRole) => void;
  canAccess: (requiredRole: AdminRole) => boolean;
}

export const useRoleStore = create<RoleState>((set, get) => ({
  currentRole: "super_admin",
  setRole: (role) => set({ currentRole: role }),
  canAccess: (requiredRole) => {
    const currentLevel = ROLE_HIERARCHY[get().currentRole];
    const requiredLevel = ROLE_HIERARCHY[requiredRole];
    return currentLevel >= requiredLevel;
  },
}));
