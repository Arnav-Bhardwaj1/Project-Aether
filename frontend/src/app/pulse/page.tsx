'use client';

import React, { useState, useEffect } from 'react';
import { Activity, Bell, Shield, Zap, RefreshCw, BarChart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LivePulseGraph from '@/components/pulse/LivePulseGraph';
import AnomalyRadar from '@/components/pulse/AnomalyRadar';
import SmartAlerts from '@/components/pulse/SmartAlerts';

export default function PulsePage() {
  const [pulseData, setPulseData] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [radarData, setRadarData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [pulseRes, alertsRes, metricsRes] = await Promise.all([
        fetch('http://localhost:8000/api/pulse/live'),
        fetch('http://localhost:8000/api/pulse/alerts'),
        fetch('http://localhost:8000/api/pulse/metrics/global'), // Mock session_id
      ]);
      
      setPulseData(await pulseRes.json());
      setAlerts(await alertsRes.json());
      const mData = await metricsRes.json();
      setRadarData(mData.radar);
      setLoading(false);
    } catch (err) {
      console.error("Pulse fetch failed", err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000); // Fast updates for the pulse
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      {/* Header */}
      <header className="mb-12 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/20 rounded-lg border border-green-500/30">
              <Activity className="w-6 h-6 text-green-400" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white">
              Aether <span className="text-green-500">Pulse</span>
            </h1>
          </div>
          <p className="text-zinc-400 max-w-2xl">
            Autonomous metric synthesis & anomaly detection. Real-time heartbeat of your agentic swarms.
          </p>
        </div>

        <button 
          onClick={fetchData}
          className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-colors"
        >
          <RefreshCw className="w-5 h-5 text-zinc-400" />
        </button>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-green-500 border-r-2" />
        </div>
      ) : (
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Live Heartbeat */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden">
               <div className="flex justify-between items-center mb-6">
                  <div>
                     <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Activity className="w-5 h-5 text-green-500" />
                        System Heartbeat
                     </h3>
                     <p className="text-sm text-zinc-500">Real-time health score synthesis</p>
                  </div>
                  <div className="text-3xl font-bold text-green-400 font-mono">
                     {pulseData?.health_score.toFixed(1)}%
                  </div>
               </div>
               
               <LivePulseGraph data={pulseData?.heartbeat} />
            </div>

            {/* Radar and Detailed Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                     <BarChart className="w-5 h-5 text-blue-500" />
                     Semantic Vectors
                  </h3>
                  {radarData && <AnomalyRadar data={radarData} />}
               </div>
               
               <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                     <Shield className="w-5 h-5 text-purple-500" />
                     Risk Posture
                  </h3>
                  <div className="space-y-4">
                     <MetricLine label="Anomaly Drift" value="Low" status="OPTIMAL" />
                     <MetricLine label="Semantic Variance" value="0.12" status="OPTIMAL" />
                     <MetricLine label="Active Alerts" value={pulseData?.active_alerts_count} status={pulseData?.active_alerts_count > 0 ? "WARNING" : "OPTIMAL"} />
                  </div>
               </div>
            </div>
          </div>

          {/* Alerts Sidebar */}
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-500" />
              Smart Alerts
            </h3>
            <SmartAlerts alerts={alerts} />
          </div>
        </main>
      )}
    </div>
  );
}

function MetricLine({ label, value, status }: any) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-zinc-800/50">
      <span className="text-zinc-500 text-sm">{label}</span>
      <div className="flex items-center gap-2">
         <div className={`w-1.5 h-1.5 rounded-full ${status === 'OPTIMAL' ? 'bg-green-500' : 'bg-amber-500'}`} />
         <span className="text-zinc-200 font-medium">{value}</span>
      </div>
    </div>
  );
}
