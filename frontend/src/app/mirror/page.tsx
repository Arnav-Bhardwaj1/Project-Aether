"use client";

import React, { useState, useEffect } from "react";
import DashboardShell from "@/components/DashboardShell";
import WorldExplorer from "@/components/mirror/WorldExplorer";
import ImpactRadar from "@/components/mirror/ImpactRadar";
import MutationTimeline from "@/components/mirror/MutationTimeline";
import SandboxControls from "@/components/mirror/SandboxControls";
import { useFlux } from "@/hooks/useFlux";
import { Layers, Activity, ShieldAlert, Cpu } from "lucide-react";

export default function MirrorPage() {
  const [sessionId] = useState(() => `mirror_session_${Math.random().toString(36).substring(7)}`);
  const { snapshots, traces } = useFlux(sessionId);
  
  const [worldState, setWorldState] = useState<{
    files: Record<string, string>;
    database: Record<string, any[]>;
    mutations: any[];
    status: string;
    templateId: string;
    isSyncing: boolean;
  }>({
    files: {},
    database: {},
    mutations: [],
    status: "STANDBY",
    templateId: "CORP_DEV_BOX",
    isSyncing: false
  });

  const [impactMetrics, setImpactMetrics] = useState({
    file_pressure: 0.1,
    data_entropy: 0.05,
    integrity_risk: 0.02,
    access_drift: 0.01,
    network_noise: 0.01
  });

  // Listen for World Sync/Mutation events via WebSockets
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws/trace");
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "WORLD_SYNC") {
            setWorldState(prev => ({
                ...prev,
                status: data.status,
                files: data.files,
                database: data.database,
                isSyncing: false
            }));
        } else if (data.type === "WORLD_MUTATION") {
            setWorldState(prev => ({
                ...prev,
                mutations: [...prev.mutations, data.mutation],
                files: data.files,
                database: data.database
            }));
            // Update metrics based on mutation
            setImpactMetrics(prev => ({
                ...prev,
                file_pressure: Math.min(1, prev.file_pressure + 0.1),
                integrity_risk: Math.min(1, prev.integrity_risk + 0.05)
            }));
        }
    };
    return () => ws.close();
  }, []);

  const handleReset = async (templateId: string) => {
    setWorldState(prev => ({ ...prev, isSyncing: true, templateId }));
    try {
      await fetch("http://localhost:8000/api/mirror/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, template_id: templateId })
      });
    } catch (e) {
      setWorldState(prev => ({ ...prev, isSyncing: false, status: "ERROR" }));
    }
  };

  const handleSnapshot = () => {
    // Logic to trigger backend snapshot
  };

  return (
    <DashboardShell>
      <div className="h-full flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-transparent border border-cyan-500/20 shadow-lg shadow-cyan-500/10">
              <Layers className="text-cyan-400" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white/90">Aether Mirror</h1>
              <p className="text-[10px] text-cyan-500 font-bold uppercase tracking-[0.2em]">Digital Twin Simulation Engine</p>
            </div>
          </div>

          <div className="flex gap-4">
            {[
                { label: "Twin Integrity", val: "98.4%", icon: ShieldAlert, color: "text-emerald-400" },
                { label: "Sync Latency", val: "12ms", icon: Activity, color: "text-cyan-400" },
                { label: "Memory Load", val: "2.4 GB", icon: Cpu, color: "text-white/60" }
            ].map(s => (
                <div key={s.label} className="glass-panel px-4 py-2 flex flex-col items-end">
                    <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest flex items-center gap-2">
                        <s.icon size={10} />
                        {s.label}
                    </span>
                    <span className={`text-xs font-mono font-bold ${s.color}`}>{s.val}</span>
                </div>
            ))}
          </div>
        </div>

        {/* Main Grid */}
        <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
          {/* Left: Explorer & Timeline */}
          <div className="col-span-8 flex flex-col gap-6 min-h-0">
            <div className="flex-1 min-h-0 relative">
               <WorldExplorer files={worldState.files} database={worldState.database} />
               {worldState.isSyncing && (
                 <div className="absolute inset-0 glass flex items-center justify-center z-50">
                    <div className="flex flex-col items-center gap-4">
                       <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
                       <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Synchronizing Blueprints...</span>
                    </div>
                 </div>
               )}
            </div>
            <div className="h-64">
               <MutationTimeline mutations={worldState.mutations} />
            </div>
          </div>

          {/* Right: Controls & Impact */}
          <div className="col-span-4 flex flex-col gap-6 min-h-0">
             <SandboxControls 
                onReset={handleReset} 
                onSnapshot={handleSnapshot}
                isSyncing={worldState.isSyncing}
                currentTemplate={worldState.templateId}
             />
             <div className="flex-1 min-h-0">
                <ImpactRadar metrics={impactMetrics} />
             </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
