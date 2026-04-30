"use client";

import React from "react";
import { ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { AlertTriangle, Activity, Database, FileWarning } from "lucide-react";

interface ImpactRadarProps {
  metrics: {
    file_pressure: number;
    data_entropy: number;
    integrity_risk: number;
    access_drift: number;
    network_noise: number;
  };
}

const ImpactRadar: React.FC<ImpactRadarProps> = ({ metrics }) => {
  const data = [
    { subject: 'File Pressure', A: metrics.file_pressure * 100, fullMark: 100 },
    { subject: 'Data Entropy', A: metrics.data_entropy * 100, fullMark: 100 },
    { subject: 'Integrity Risk', A: metrics.integrity_risk * 100, fullMark: 100 },
    { subject: 'Access Drift', A: metrics.access_drift * 100, fullMark: 100 },
    { subject: 'Network Noise', A: metrics.network_noise * 100, fullMark: 100 },
  ];

  return (
    <div className="glass-panel p-6 bg-[#0a0a0c]/80 border-cyan-500/10 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-white/80 uppercase tracking-widest">Impact Assessment</h3>
          <p className="text-[10px] text-cyan-500/60 font-bold uppercase tracking-widest">Blast Radius Radar</p>
        </div>
        <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
          <Activity size={18} className="text-cyan-400" />
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="rgba(255,255,255,0.05)" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9, fontWeight: 700 }}
            />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="Impact"
              dataKey="A"
              stroke="#22d3ee"
              fill="#22d3ee"
              fillOpacity={0.3}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4">
         <div className="p-3 rounded-2xl bg-white/2 border border-white/5">
            <div className="flex items-center gap-2 mb-1">
               <FileWarning size={12} className="text-orange-400" />
               <span className="text-[10px] font-bold text-white/40 uppercase">High Risk</span>
            </div>
            <span className="text-sm font-black text-white/80">{(metrics.integrity_risk * 100).toFixed(0)}%</span>
         </div>
         <div className="p-3 rounded-2xl bg-white/2 border border-white/5">
            <div className="flex items-center gap-2 mb-1">
               <Database size={12} className="text-cyan-400" />
               <span className="text-[10px] font-bold text-white/40 uppercase">Entropy</span>
            </div>
            <span className="text-sm font-black text-white/80">{(metrics.data_entropy * 10).toFixed(1)}x</span>
         </div>
      </div>

      <div className="mt-auto pt-4 border-t border-white/5">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle size={12} className="text-orange-500" />
          <span className="text-[9px] font-bold text-orange-500/80 uppercase">Simulated Risk Threshold</span>
        </div>
        <p className="text-[10px] text-white/40 leading-relaxed italic">
          "The current agent trajectory indicates a potential 30% drift in system configuration integrity within the simulated twin."
        </p>
      </div>
    </div>
  );
};

export default ImpactRadar;
