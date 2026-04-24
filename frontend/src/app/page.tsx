"use client";

import React, { useState, useCallback } from "react";
import DashboardShell from "@/components/DashboardShell";
import AgentChat from "@/components/AgentChat";
import AetherFlow from "@/components/AetherFlow";
import { Shield, Activity, Lock, Cpu, Globe } from "lucide-react";

export default function DashboardPage() {
  const [currentTraces, setCurrentTraces] = useState<any[]>([]);

  const handleTraceUpdate = useCallback((trace: any) => {
    setCurrentTraces(prev => {
      // If it's a new session, reset traces
      if (prev.length > 0 && prev[0].session_id !== trace.session_id) {
        return [trace];
      }
      // Otherwise append or update
      const existing = prev.findIndex(t => t.step === trace.step);
      if (existing !== -1) {
        const updated = [...prev];
        updated[existing] = trace;
        return updated;
      }
      return [...prev, trace];
    });
  }, []);

  return (
    <DashboardShell>
      <div className="grid grid-cols-12 gap-6 h-full pb-6">
        {/* Stats Row */}
        <div className="col-span-12 grid grid-cols-4 gap-4">
          <StatCard icon={<Shield className="text-blue-400" />} label="Security Score" value="98.2%" sub="High Resilience" />
          <StatCard icon={<Lock className="text-green-400" />} label="Redactions" value="14" sub="Last 24h" />
          <StatCard icon={<Cpu className="text-purple-400" />} label="Avg Latency" value="312ms" sub="-12% vs prev" />
          <StatCard icon={<Globe className="text-yellow-400" />} label="Active Agents" value="3" sub="Gemini Flash" />
        </div>

        {/* Main Interaction Area */}
        <div className="col-span-4 h-[calc(100vh-250px)]">
          <AgentChat onTraceUpdate={handleTraceUpdate} />
        </div>

        {/* Visualization Area */}
        <div className="col-span-8 h-[calc(100vh-250px)]">
          <AetherFlow traces={currentTraces} />
        </div>
      </div>
    </DashboardShell>
  );
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode, label: string, value: string, subText?: string, sub: string }) {
  return (
    <div className="card flex items-center gap-4">
      <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
        {icon}
      </div>
      <div>
        <p className="text-xs text-white/40 font-medium uppercase tracking-wider">{label}</p>
        <div className="flex items-baseline gap-2">
          <h4 className="text-2xl font-bold">{value}</h4>
          <span className="text-[10px] text-green-400 font-bold">{sub}</span>
        </div>
      </div>
    </div>
  );
}
