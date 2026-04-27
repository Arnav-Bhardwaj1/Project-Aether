"use client";

import React from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

interface HeatmapProps {
  data: Array<{ category: string; intensity: number }>;
}

const SecurityHeatmap: React.FC<HeatmapProps> = ({ data }) => {
  return (
    <div className="glass-panel p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-bold text-white/90">Vulnerability Distribution</h3>
          <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Vector Intensity Analysis</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
          <span className="text-[10px] font-bold text-orange-500/80 uppercase">Live Sensor</span>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#ffffff10" />
            <PolarAngleAxis 
              dataKey="category" 
              tick={{ fill: "#ffffff40", fontSize: 10, fontWeight: "bold" }} 
            />
            <Radar
              name="Intensity"
              dataKey="intensity"
              stroke="#f97316"
              fill="#f97316"
              fillOpacity={0.3}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {data.map(item => (
          <div key={item.category} className="flex items-center justify-between p-2 bg-white/5 rounded border border-white/5">
            <span className="text-[10px] text-white/60 font-bold truncate pr-2">{item.category}</span>
            <span className={`text-[10px] font-mono font-bold ${item.intensity > 50 ? "text-orange-500" : "text-white/40"}`}>
              {Math.round(item.intensity)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SecurityHeatmap;
