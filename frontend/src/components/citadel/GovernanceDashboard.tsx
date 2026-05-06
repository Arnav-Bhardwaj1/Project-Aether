'use client';

import React from 'react';
import { Shield, AlertCircle, Activity, TrendingUp, Lock, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface DashboardProps {
  stats: any;
}

export default function GovernanceDashboard({ stats }: DashboardProps) {
  if (!stats) return <div className="text-zinc-500 animate-pulse">Initializing Citadel Engine...</div>;

  const trustScore = stats.report.trust_score;
  const status = stats.report.compliance_status;

  return (
    <div className="space-y-8">
      {/* High Level Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard 
          title="Trust Score" 
          value={`${trustScore}%`} 
          subValue={status}
          icon={<Shield className={trustScore > 90 ? "text-green-400" : "text-amber-400"} />}
          trend="+2.4%"
        />
        <MetricCard 
          title="Active Guardrails" 
          value={stats.active_policies.length} 
          subValue="Active Policies"
          icon={<Lock className="text-blue-400" />}
        />
        <MetricCard 
          title="Total Incidents" 
          value={stats.report.total_incidents} 
          subValue="Logged Violations"
          icon={<AlertCircle className="text-red-400" />}
        />
        <MetricCard 
          title="Data Entropy" 
          value="Low" 
          subValue="Secret Protection"
          icon={<Activity className="text-purple-400" />}
        />
      </div>

      {/* Main Visualization Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 backdrop-blur-sm">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            Compliance Drift (Timeline)
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.timeline}>
                <defs>
                  <linearGradient id="colorViolations" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="index" stroke="#4b5563" />
                <YAxis stroke="#4b5563" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                  itemStyle={{ color: '#3b82f6' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="violations" 
                  stroke="#3b82f6" 
                  fillOpacity={1} 
                  fill="url(#colorViolations)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 backdrop-blur-sm">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-500" />
            Policy Distribution
          </h3>
          <div className="space-y-4">
            {Object.entries(stats.report.category_breakdown).map(([name, count]: any) => (
              <div key={name} className="flex flex-col gap-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400 capitalize">{name.replace(/-/g, ' ')}</span>
                  <span className="text-zinc-200">{count} events</span>
                </div>
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (count / (stats.report.total_incidents || 1)) * 100)}%` }}
                    className="h-full bg-blue-500"
                  />
                </div>
              </div>
            ))}
            {Object.keys(stats.report.category_breakdown).length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
                <CheckCircle2 className="w-12 h-12 mb-4 opacity-20" />
                <p>No violations detected</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, subValue, icon, trend }: any) {
  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-zinc-800/50 rounded-xl group-hover:bg-zinc-800 transition-colors">
          {icon}
        </div>
        {trend && (
          <span className="text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-zinc-400 text-sm mb-1">{title}</p>
        <h4 className="text-2xl font-bold text-white">{value}</h4>
        <p className="text-xs text-zinc-500 mt-1">{subValue}</p>
      </div>
    </div>
  );
}
