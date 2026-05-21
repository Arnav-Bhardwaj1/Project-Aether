'use client';

import React from 'react';
import { Shield, ShieldAlert, Radio, AlertTriangle, ToggleLeft, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface AegisDashboardProps {
  stats: {
    threat_level: string;
    health_score: number;
    total_alerts: number;
    active_rules_count: number;
    total_rules_count: number;
    triggered_decoys: number;
    coverage_percentage: number;
  } | null;
  alerts: any[];
}

export default function AegisDashboard({ stats, alerts }: AegisDashboardProps) {
  if (!stats) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-amber-500 border-r-2" />
      </div>
    );
  }

  // Determine colors based on threat level
  const getThreatColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'text-red-500 border-red-500/20 bg-red-500/10 shadow-red-500/10';
      case 'HIGH': return 'text-orange-500 border-orange-500/20 bg-orange-500/10 shadow-orange-500/10';
      case 'MEDIUM': return 'text-yellow-500 border-yellow-500/20 bg-yellow-500/10 shadow-yellow-500/10';
      default: return 'text-green-500 border-green-500/20 bg-green-500/10 shadow-green-500/10';
    }
  };

  // Convert alerts list to timeline data for AreaChart
  const getTimelineData = () => {
    const counts: { [key: string]: number } = {};
    alerts.forEach((alert) => {
      const date = new Date(alert.timestamp * 1000);
      const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      counts[timeStr] = (counts[timeStr] || 0) + 1;
    });
    
    // Sort chronological or map last 10 points
    const points = Object.entries(counts).map(([time, count]) => ({ time, count }));
    if (points.length === 0) {
      return [
        { time: 'T-10s', count: 0 },
        { time: 'T-5s', count: 0 },
        { time: 'Now', count: 0 }
      ];
    }
    return points.slice(-10);
  };

  return (
    <div className="space-y-8">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Threat Level"
          value={stats.threat_level}
          subValue="Real-time evaluation"
          icon={<ShieldAlert className={getThreatColor(stats.threat_level).split(' ')[0]} />}
          statusClass={getThreatColor(stats.threat_level)}
        />
        <MetricCard
          title="Aegis Security Posture"
          value={`${stats.health_score}%`}
          subValue="Swarm compliance integrity"
          icon={<ShieldCheck className="text-green-400" />}
        />
        <MetricCard
          title="Active Firewalls"
          value={`${stats.active_rules_count}/${stats.total_rules_count}`}
          subValue={`${stats.coverage_percentage}% Rule Coverage`}
          icon={<ToggleLeft className="text-amber-400" />}
        />
        <MetricCard
          title="Triggered Honeypots"
          value={stats.triggered_decoys}
          subValue="Decoys breached"
          icon={<Radio className={stats.triggered_decoys > 0 ? "text-red-400 animate-pulse" : "text-zinc-500"} />}
        />
      </div>

      {/* Main Stats Block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Graph */}
        <div className="lg:col-span-2 bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 backdrop-blur-xl">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Radio className="w-5 h-5 text-amber-500 animate-pulse" />
            Security Incident Traffic (Timeline)
          </h3>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={getTimelineData()}>
                <defs>
                  <linearGradient id="colorAlerts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="time" stroke="#4b5563" fontSize={10} />
                <YAxis stroke="#4b5563" fontSize={10} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                  itemStyle={{ color: '#f59e0b' }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#f59e0b"
                  fillOpacity={1}
                  fill="url(#colorAlerts)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Alerts list */}
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 backdrop-blur-xl flex flex-col">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Active Alert Stream
          </h3>
          <div className="flex-1 overflow-y-auto space-y-4 max-h-[280px] custom-scrollbar pr-2">
            {alerts.slice(0, 5).map((alert, index) => (
              <motion.div
                key={alert.id || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-4 rounded-2xl border text-xs ${
                  alert.severity === 'CRITICAL'
                    ? 'bg-red-500/10 border-red-500/20 text-red-200'
                    : alert.severity === 'HIGH'
                    ? 'bg-orange-500/10 border-orange-500/20 text-orange-200'
                    : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-200'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold tracking-wider text-[9px] uppercase font-mono px-2 py-0.5 rounded bg-white/5 border border-white/5">
                    {alert.type}
                  </span>
                  <span className="text-[10px] text-zinc-500">
                    {new Date(alert.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
                <p className="text-zinc-300 font-medium mb-1">{alert.message}</p>
                <div className="text-[10px] text-zinc-500 font-mono mt-1 overflow-hidden text-ellipsis whitespace-nowrap">
                  Target: {alert.target}
                </div>
              </motion.div>
            ))}
            {alerts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-zinc-600">
                <Shield className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-xs font-semibold uppercase tracking-wider">Aegis Secured</p>
                <p className="text-[10px] italic">No active threat incidents</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, subValue, icon, statusClass }: any) {
  return (
    <div className={`bg-zinc-900/40 border border-zinc-800 rounded-3xl p-5 hover:border-zinc-700 transition-all group relative overflow-hidden backdrop-blur-xl ${statusClass ? 'shadow-[inset_0_0_20px_rgba(255,255,255,0.01)]' : ''}`}>
      {statusClass && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-current opacity-[0.02] rounded-full blur-2xl pointer-events-none" />
      )}
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-zinc-800/50 rounded-2xl group-hover:bg-zinc-800 transition-colors">
          {icon}
        </div>
      </div>
      <div>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
        <h4 className="text-2xl font-black tracking-tight text-white">{value}</h4>
        <p className="text-[10px] text-zinc-400 mt-1 font-medium italic">{subValue}</p>
      </div>
    </div>
  );
}
