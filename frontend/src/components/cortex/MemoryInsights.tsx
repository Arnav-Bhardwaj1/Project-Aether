'use client';

import React from 'react';
import { BarChart3, TrendingUp, Cpu, Hash } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

interface MemoryInsightsProps {
  stats: any;
  nodes: any[];
}

export default function MemoryInsights({ stats, nodes }: MemoryInsightsProps) {
  // Mock trend data based on current counts
  const data = [
    { name: 'Entities', value: stats?.node_count || 0, color: '#6366f1' },
    { name: 'Synapses', value: stats?.edge_count || 0, color: '#818cf8' },
    { name: 'Density', value: Math.round((stats?.density || 0) * 100), color: '#a5b4fc' },
  ];

  // Top entities by degree
  const topEntities = [...nodes]
    .sort((a, b) => b.degree - a.degree)
    .slice(0, 5);

  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 backdrop-blur-xl space-y-6">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-indigo-500" />
        Cognitive Insights
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-black/40 border border-zinc-800/50 rounded-2xl">
          <div className="flex items-center gap-2 text-zinc-500 mb-1">
            <Cpu className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Brain Density</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {data[2].value}%
          </div>
          <div className="text-[10px] text-zinc-600 mt-1">Connectivity saturation</div>
        </div>
        <div className="p-4 bg-black/40 border border-zinc-800/50 rounded-2xl">
          <div className="flex items-center gap-2 text-zinc-500 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Growth Rate</span>
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            +12%
          </div>
          <div className="text-[10px] text-zinc-600 mt-1">Since last session</div>
        </div>
      </div>

      <div className="h-[180px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 10 }} />
            <Tooltip 
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', fontSize: '12px' }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 ml-1 flex items-center gap-2">
          <Hash className="w-4 h-4" />
          High-Value Entities
        </h4>
        <div className="space-y-2">
          {topEntities.map((node, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 bg-black/20 rounded-lg border border-white/5">
              <span className="text-xs text-zinc-300 font-medium">{node.label}</span>
              <span className="text-[10px] font-mono text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded">
                {node.degree} Conn
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
