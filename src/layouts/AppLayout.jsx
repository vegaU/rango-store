import { useState } from "react";
import { Outlet } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

export default function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-[#111318] transition-colors duration-200 dark:from-[#0f172a] dark:to-[#020617] dark:text-white">
      <Sidebar mobileOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="flex min-h-screen w-full flex-col lg:pl-64">
        <TopBar onOpenSidebar={() => setIsSidebarOpen(true)} />

        <div className="p-4 lg:p-8">
          <Outlet />
        </div>

        <footer className="mt-auto border-t border-slate-200 bg-white/70 px-4 py-4 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400 lg:px-8">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <p>Rango Store Dashboard</p>
            <p>Actualizado en tiempo real para sucursal principal</p>
          </div>
        </footer>

        <div className="h-16 lg:hidden" />
      </main>

      <BottomNav />
    </div>
  );
}
