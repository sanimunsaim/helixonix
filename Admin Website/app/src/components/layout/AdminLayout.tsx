import { Outlet } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";
import { CommandSearch } from "./CommandSearch";
import { useUIStore } from "@/stores/uiStore";

export function AdminLayout() {
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);

  return (
    <div className="flex h-screen bg-[#0B0F1E] text-slate-200">
      <AdminSidebar />
      <CommandSearch />
      <div className={`flex flex-1 flex-col transition-all duration-200 ${sidebarCollapsed ? "ml-14" : "ml-60"}`}>
        <AdminTopbar />
        <main className="flex-1 overflow-y-auto hx-scrollbar p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
