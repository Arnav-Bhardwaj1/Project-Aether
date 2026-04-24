"use client";

import React, { useState } from "react";
import { 
  Shield, 
  Activity, 
  Zap, 
  Clock, 
  Search, 
  Settings, 
  Menu,
  ChevronRight,
  Database
} from "lucide-react";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0a0c]">
      {/* Sidebar */}
      <aside 
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } glass m-4 mr-0 flex flex-col transition-all duration-300 ease-in-out`}
      >
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)]">
              <Zap size={20} className="text-white" />
            </div>
            {sidebarOpen && <h1 className="font-bold text-xl tracking-tight">Aether</h1>}
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 py-4">
          <NavItem icon={<Activity size={20} />} label="Observability" active sidebarOpen={sidebarOpen} />
          <NavItem icon={<Shield size={20} />} label="The Sentry" sidebarOpen={sidebarOpen} />
          <NavItem icon={<Clock size={20} />} label="History" sidebarOpen={sidebarOpen} />
          <NavItem icon={<Database size={20} />} label="Dataset" sidebarOpen={sidebarOpen} />
        </nav>

        <div className="p-4 border-t border-[rgba(255,255,255,0.05)]">
          <NavItem icon={<Settings size={20} />} label="Settings" sidebarOpen={sidebarOpen} />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden p-4">
        <header className="h-16 flex items-center justify-between px-6 mb-4 glass">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-sm font-medium text-white/60">Dashboard / <span className="text-white">Observability</span></h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
              <input 
                type="text" 
                placeholder="Search traces..." 
                className="bg-white/5 border border-white/10 rounded-full py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 transition-colors w-64"
              />
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 border border-white/20" />
          </div>
        </header>

        <div className="flex-1 overflow-auto scroll-smooth">
          {children}
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false, sidebarOpen }: { icon: React.ReactNode, label: string, active?: boolean, sidebarOpen: boolean }) {
  return (
    <div className={`
      flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-all
      ${active ? "bg-blue-600/10 text-blue-400 border border-blue-600/20" : "text-white/60 hover:bg-white/5 hover:text-white"}
    `}>
      {icon}
      {sidebarOpen && <span className="font-medium text-sm">{label}</span>}
      {active && sidebarOpen && <ChevronRight size={14} className="ml-auto" />}
    </div>
  );
}
