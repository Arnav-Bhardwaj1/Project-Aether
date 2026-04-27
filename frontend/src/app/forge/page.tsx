"use client";

import React, { useState, useEffect, useCallback } from "react";
import DashboardShell from "@/components/DashboardShell";
import RedTeamConsole from "@/components/forge/RedTeamConsole";
import SecurityHeatmap from "@/components/forge/SecurityHeatmap";
import GovernanceScorecard from "@/components/forge/GovernanceScorecard";
import PersonaManager from "@/components/forge/PersonaManager";
import { useFlux } from "@/hooks/useFlux";
import { motion } from "framer-motion";
import { ShieldAlert, Zap, Layers, Cpu } from "lucide-react";

export default function ForgePage() {
  const [sessionId] = useState(() => `forge_session_${Math.random().toString(36).substring(7)}`);
  const { snapshots, traces } = useFlux(sessionId);
  
  const [isSimulating, setIsSimulating] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [analytics, setAnalytics] = useState<{
    risk_report: any;
    heatmap: any[];
  } | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/forge/analytics/${sessionId}`);
      const data = await res.json();
      setAnalytics(data);
    } catch (e) {
      console.error("Failed to fetch analytics", e);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 5000);
    return () => clearInterval(interval);
  }, [fetchAnalytics]);

  // Monitor traces to update logs in real-time
  useEffect(() => {
    if (traces.length > 0) {
      const lastTrace = traces[traces.length - 1];
      if (lastTrace.step === "INPUT_AUDIT" || lastTrace.step === "OUTPUT_AUDIT") {
        const logMsg = `${lastTrace.step}: ${lastTrace.status} ${lastTrace.data?.violations?.length ? `(${lastTrace.data.violations[0].type})` : ""}`;
        setLogs(prev => [...prev.slice(-49), logMsg]);
      }
    }
  }, [traces]);

  const handleSimulate = async (categories: string[]) => {
    setIsSimulating(true);
    setLogs(prev => [...prev, `>>> INITIALIZING FORGE SIMULATION: ${categories.join(", ")}`]);
    
    try {
      const res = await fetch("http://localhost:8000/api/forge/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, categories })
      });
      const data = await res.json();
      setLogs(prev => [...prev, `>>> SIMULATION ENGINE: ${data.message}`]);
      
      // Simulate end of batch (in real app, backend would send an event)
      setTimeout(() => setIsSimulating(false), 15000); 
    } catch (e) {
      setLogs(prev => [...prev, ">>> ERROR: Connection to Forge Engine failed"]);
      setIsSimulating(false);
    }
  };

  return (
    <DashboardShell>
      <div className="h-full flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500/20 to-transparent border border-orange-500/20 shadow-lg shadow-orange-500/10">
              <ShieldAlert className="text-orange-500" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white/90">Aether Forge</h1>
              <p className="text-[10px] text-orange-500 font-bold uppercase tracking-[0.2em]">Adversarial Simulation & Governance Lab</p>
            </div>
          </div>

          <div className="flex gap-4">
            {[
                { icon: Zap, label: "Core Speed", val: "1.2ms" },
                { icon: Layers, label: "Total Probes", val: analytics?.risk_report?.metrics?.total_interactions || 0 },
                { icon: Cpu, label: "Engine Status", val: isSimulating ? "SIMULATING" : "STANDBY" }
            ].map(s => (
                <div key={s.label} className="glass-panel px-4 py-2 flex flex-col items-end">
                    <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest flex items-center gap-2">
                        <s.icon size={10} />
                        {s.label}
                    </span>
                    <span className={`text-xs font-mono font-bold ${s.val === 'SIMULATING' ? 'text-orange-500 animate-pulse' : 'text-white/80'}`}>{s.val}</span>
                </div>
            ))}
          </div>
        </div>

        {/* Top Analytics Bar */}
        <GovernanceScorecard report={analytics?.risk_report} />

        {/* Main Grid */}
        <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
          {/* Left Column: Console & Heatmap */}
          <div className="col-span-8 grid grid-rows-2 gap-6 min-h-0">
            <div className="min-h-0">
              <RedTeamConsole 
                onSimulate={handleSimulate} 
                isSimulating={isSimulating}
                logs={logs}
              />
            </div>
            <div className="min-h-0">
               <SecurityHeatmap data={analytics?.heatmap || []} />
            </div>
          </div>

          {/* Right Column: Personas & Settings */}
          <div className="col-span-4 flex flex-col gap-6 min-h-0">
             <PersonaManager />
             
             {/* Security Feed (Recent Violations) */}
             <div className="flex-1 glass-panel p-6 flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white/90">Policy Exceptions</h3>
                  <span className="text-[9px] font-bold text-red-500 uppercase px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20">Critical Alert</span>
                </div>
                <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
                   {snapshots.filter(s => s.input_audit.violations.length > 0 || s.output_audit.violations.length > 0).slice(-5).map(v => (
                      <div key={v.id} className="p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
                         <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-red-400 uppercase tracking-tight">Violation: {v.input_audit.violations[0]?.type || v.output_audit.violations[0]?.type}</span>
                            <span className="text-[8px] font-mono text-white/20">{new Date(v.timestamp * 1000).toLocaleTimeString()}</span>
                         </div>
                         <p className="text-[10px] text-white/40 italic line-clamp-1">"{v.prompt}"</p>
                      </div>
                   ))}
                   {snapshots.length === 0 && (
                      <div className="h-full flex items-center justify-center opacity-10">
                        <p className="text-[10px] uppercase font-bold tracking-widest">No active threats detected</p>
                      </div>
                   )}
                </div>
             </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
