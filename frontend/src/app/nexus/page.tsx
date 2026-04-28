"use client";

import React, { useState, useEffect, useCallback } from "react";
import DashboardShell from "@/components/DashboardShell";
import NexusCanvas from "@/components/nexus/NexusCanvas";
import SwarmOrchestrator from "@/components/nexus/SwarmOrchestrator";
import NexusIntercom from "@/components/nexus/NexusIntercom";
import { useFlux } from "@/hooks/useFlux";
import { motion, AnimatePresence } from "framer-motion";
import { Network, ShieldAlert, Cpu, Activity } from "lucide-react";

export default function NexusPage() {
  const [sessionId] = useState(() => `nexus_session_${Math.random().toString(36).substring(7)}`);
  const { snapshots, traces } = useFlux(sessionId);
  
  const [swarmState, setSwarmState] = useState<{
    nodes: any[];
    edges: any[];
    status: string;
    message: string;
    isLaunching: boolean;
  }>({
    nodes: [],
    edges: [],
    status: "STANDBY",
    message: "Awaiting initialization sequence...",
    isLaunching: false
  });

  const [intercomMessages, setIntercomMessages] = useState<any[]>([]);

  // Listen for Nexus Sync events via WebSockets
  useEffect(() => {
    if (traces.length > 0) {
      const lastTrace = traces[traces.length - 1];
      
      // The useFlux hook currently only exposes traces of type TRACE_STEP
      // We need to handle the custom NEXUS_SYNC type.
      // For this demo, we'll simulate the graph logic based on TRACE_STEP 
      // but in a real app, useFlux would handle the custom event type.
    }
    
    // Manual WebSocket listener for custom NEXUS_SYNC events
    const ws = new WebSocket("ws://localhost:8000/ws/trace");
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "NEXUS_SYNC") {
            if (data.status) setSwarmState(prev => ({ ...prev, status: data.status, message: data.message || prev.message }));
            if (data.nodes) {
                // Layout nodes
                const laidOutNodes = data.nodes.map((n: any, i: number) => {
                    if (n.type === 'origin') return { ...n, x: 100, y: 250 };
                    // Grid-like layout for agents
                    const col = Math.floor((i - 1) / 2);
                    const row = (i - 1) % 2;
                    return { ...n, x: 300 + col * 200, y: 150 + row * 200 };
                });
                setSwarmState(prev => ({ ...prev, nodes: laidOutNodes }));
            }
            if (data.edges) setSwarmState(prev => ({ ...prev, edges: data.edges }));
            if (data.update_node) {
                setSwarmState(prev => ({
                    ...prev,
                    nodes: prev.nodes.map(n => n.id === data.update_node.id ? { ...n, ...data.update_node } : n)
                }));
            }
        }
    };
    return () => ws.close();
  }, [traces]);

  // Sync snapshots to intercom
  useEffect(() => {
    const nexusSnapshots = snapshots
        .filter(s => s.metadata?.is_nexus)
        .map(s => ({
            id: s.id,
            role: s.metadata.role,
            text: s.response,
            timestamp: s.timestamp,
            violations: s.output_audit.violations
        }));
    setIntercomMessages(nexusSnapshots);
  }, [snapshots]);

  const handleLaunch = async (prompt: string) => {
    setSwarmState(prev => ({ ...prev, isLaunching: true, status: "INITIALIZING", nodes: [], edges: [] }));
    setIntercomMessages([]);
    
    try {
      await fetch("http://localhost:8000/api/nexus/launch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, prompt })
      });
    } catch (e) {
      setSwarmState(prev => ({ ...prev, isLaunching: false, status: "ERROR", message: "Connection failed." }));
    }
  };

  const handleStop = () => {
    // Logic to signal stop
    setSwarmState(prev => ({ ...prev, isLaunching: false, status: "STANDBY" }));
  };

  return (
    <DashboardShell>
      <div className="h-full flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-transparent border border-cyan-500/20 shadow-lg shadow-cyan-500/10">
              <Network className="text-cyan-400" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white/90">Aether Nexus</h1>
              <p className="text-[10px] text-cyan-500 font-bold uppercase tracking-[0.2em]">Neural Swarm Orchestration</p>
            </div>
          </div>

          <div className="flex gap-4">
            {[
                { label: "Active Nodes", val: swarmState.nodes.length, icon: Cpu },
                { label: "Neural Traffic", val: `${intercomMessages.length * 4.2} kb/s`, icon: Activity },
                { label: "Sentry Load", val: "Optimal", icon: ShieldAlert }
            ].map(s => (
                <div key={s.label} className="glass-panel px-4 py-2 flex flex-col items-end">
                    <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest flex items-center gap-2">
                        <s.icon size={10} />
                        {s.label}
                    </span>
                    <span className="text-xs font-mono font-bold text-white/80">{s.val}</span>
                </div>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
          {/* Left Column: Canvas & Status */}
          <div className="col-span-8 flex flex-col gap-6 min-h-0">
             <div className="flex-1 min-h-0 relative">
                <NexusCanvas nodes={swarmState.nodes} edges={swarmState.edges} />
                
                {/* Status HUD */}
                <div className="absolute top-6 right-6 glass-panel px-4 py-3 border-cyan-500/20">
                   <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${swarmState.isLaunching ? 'bg-cyan-400 animate-pulse' : 'bg-white/10'}`} />
                      <div>
                        <p className="text-[10px] font-black text-white/80 uppercase leading-none mb-1">{swarmState.status}</p>
                        <p className="text-[9px] text-white/40 font-medium italic">{swarmState.message}</p>
                      </div>
                   </div>
                </div>
             </div>
             
             <div className="h-64">
                <NexusIntercom messages={intercomMessages} />
             </div>
          </div>

          {/* Right Column: Orchestration Control */}
          <div className="col-span-4 flex flex-col min-h-0">
             <SwarmOrchestrator 
                onLaunch={handleLaunch} 
                onStop={handleStop}
                isLaunching={swarmState.isLaunching}
                status={swarmState.status}
             />
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
