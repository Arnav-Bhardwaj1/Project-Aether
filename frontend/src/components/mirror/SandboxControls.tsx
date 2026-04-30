"use client";

import React from "react";
import { Layers, RotateCcw, Camera, Box, ArrowRight } from "lucide-react";

interface SandboxControlsProps {
  onReset: (templateId: string) => void;
  onSnapshot: () => void;
  isSyncing: boolean;
  currentTemplate?: string;
}

const SandboxControls: React.FC<SandboxControlsProps> = ({ onReset, onSnapshot, isSyncing, currentTemplate }) => {
  const templates = [
    { id: "CORP_DEV_BOX", name: "Dev Box", desc: "Corporate Workstation" },
    { id: "FINANCE_CORE", name: "Finance Hub", desc: "Banking Simulation" },
    { id: "INFRA_LAB", name: "Infra Lab", desc: "Cloud & K8s State" }
  ];

  return (
    <div className="glass-panel p-6 bg-[#0a0a0c]/80 border-cyan-500/10 flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 shadow-lg shadow-cyan-500/5">
          <Layers className="text-cyan-400" size={24} />
        </div>
        <div>
          <h2 className="text-lg font-black tracking-tight text-white/90">Sandbox Control</h2>
          <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">Environment Management</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
           <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest px-2">Load Blueprint</span>
           <div className="flex flex-col gap-2">
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => onReset(t.id)}
                  disabled={isSyncing}
                  className={`text-left p-4 rounded-2xl border transition-all group relative overflow-hidden ${
                    currentTemplate === t.id 
                    ? "bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_20px_rgba(34,211,238,0.1)]" 
                    : "bg-white/2 border-white/5 hover:bg-white/5 hover:border-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between relative z-10">
                    <div>
                      <h4 className="text-[11px] font-black text-white/80 group-hover:text-cyan-400 transition-colors uppercase tracking-tighter">{t.name}</h4>
                      <p className="text-[9px] text-white/30 font-medium">{t.desc}</p>
                    </div>
                    <Box size={16} className={`${currentTemplate === t.id ? "text-cyan-400" : "text-white/10"} group-hover:text-cyan-400 transition-colors`} />
                  </div>
                  {currentTemplate === t.id && (
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent pointer-events-none" />
                  )}
                </button>
              ))}
           </div>
        </div>

        <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-3">
          <button 
            onClick={onSnapshot}
            disabled={isSyncing}
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white/60 hover:text-white"
          >
            <Camera size={14} />
            <span className="text-[10px] font-bold uppercase">Snapshot</span>
          </button>
          <button 
            disabled={isSyncing}
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white/60 hover:text-white"
          >
            <RotateCcw size={14} />
            <span className="text-[10px] font-bold uppercase">Reset</span>
          </button>
        </div>
      </div>

      <div className="mt-auto p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/10">
         <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-bold text-cyan-400 uppercase">State Isolation</span>
            <div className="flex gap-1">
               {[1,2,3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-cyan-400/50" />)}
            </div>
         </div>
         <p className="text-[9px] text-white/30 font-medium italic leading-relaxed">
           "The digital twin is currently isolated from the production network. All tool-calls redirected to simulation engine."
         </p>
      </div>
    </div>
  );
};

export default SandboxControls;
