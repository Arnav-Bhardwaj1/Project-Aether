'use client';

import React from 'react';
import { Target, ThumbsUp, ThumbsDown, BarChart2 } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface AlignmentTrendsProps {
  data: any[];
  stats: any;
}

export default function AlignmentTrends({ data, stats }: AlignmentTrendsProps) {
  return (
    <div className="space-y-8">
      {/* Target Alignment Card */}
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 backdrop-blur-xl space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block">System Alignment Score</span>
            <div className="text-4xl font-extrabold text-white tracking-tight flex items-end gap-1.5">
              {stats?.alignment_score}%
              <span className="text-xs text-emerald-400 font-semibold mb-1">Target 95%</span>
            </div>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
            <Target className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        {/* Dynamic progress bar */}
        <div className="space-y-1">
          <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
              style={{ width: `${stats?.alignment_score || 0}%` }}
            />
          </div>
          <div className="flex justify-between text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
            <span>Divergent</span>
            <span>Aligned</span>
          </div>
        </div>
      </div>

      {/* KPI breakdown grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-2xl flex items-center gap-4">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <ThumbsUp className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Positive</span>
            <span className="text-lg font-bold font-mono text-zinc-200">{stats?.positive_count || 0}</span>
          </div>
        </div>

        <div className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-2xl flex items-center gap-4">
          <div className="p-2.5 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20">
            <ThumbsDown className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Negative</span>
            <span className="text-lg font-bold font-mono text-zinc-200">{stats?.negative_count || 0}</span>
          </div>
        </div>
      </div>

      {/* Trend graph */}
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 backdrop-blur-xl space-y-4">
        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-emerald-400" />
          Alignment Convergence
        </h4>

        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#52525b', fontSize: 10 }} />
              <YAxis domain={[0, 100]} hide />
              <Tooltip
                contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px', fontSize: '11px', color: '#f4f4f5' }}
              />
              <Area 
                type="monotone" 
                dataKey="score" 
                stroke="#10b981" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorScore)" 
                name="Alignment %"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
