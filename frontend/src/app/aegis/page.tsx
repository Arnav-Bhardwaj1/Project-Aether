'use client';

import React, { useState, useEffect } from 'react';
import { Shield, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardShell from '@/components/DashboardShell';
import AegisDashboard from '@/components/aegis/AegisDashboard';
import FirewallRules from '@/components/aegis/FirewallRules';
import HoneypotDecoys from '@/components/aegis/HoneypotDecoys';
import IntrusionConsole from '@/components/aegis/IntrusionConsole';

export default function AegisPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'firewall' | 'honeypot' | 'intrusion'>('overview');
  const [stats, setStats] = useState<any>(null);
  const [rules, setRules] = useState<any[]>([]);
  const [decoys, setDecoys] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsRes, rulesRes, decoysRes, alertsRes] = await Promise.all([
        fetch('http://localhost:8000/api/aegis/stats'),
        fetch('http://localhost:8000/api/aegis/rules'),
        fetch('http://localhost:8000/api/aegis/decoys'),
        fetch('http://localhost:8000/api/aegis/alerts'),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (rulesRes.ok) setRules(await rulesRes.json());
      if (decoysRes.ok) setDecoys(await decoysRes.json());
      if (alertsRes.ok) setAlerts(await alertsRes.json());
      
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch Aegis data', err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleRule = async (ruleId: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/aegis/rules/${ruleId}/toggle`, {
        method: 'POST',
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (e) {
      console.error('Failed to toggle rule', e);
    }
  };

  const handleAddDecoy = async (path: string, type: string, secretToken: string) => {
    try {
      const res = await fetch('http://localhost:8000/api/aegis/decoys/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path, type, secret_token: secretToken }),
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (e) {
      console.error('Failed to add decoy', e);
    }
  };

  const handleSimulateAttack = async (category: string) => {
    try {
      const res = await fetch('http://localhost:8000/api/aegis/simulate-attack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, session_id: 'aegis_sec_session' }),
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (e) {
      console.error('Failed to simulate attack', e);
    }
  };

  const handleClearAlerts = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/aegis/alerts/clear', {
        method: 'POST',
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (e) {
      console.error('Failed to clear alerts', e);
    }
  };

  return (
    <DashboardShell>
      <div className="min-h-screen bg-[#050505] text-white p-2">
        {/* Header */}
        <header className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-amber-500/20 rounded-2xl border border-amber-500/30 shadow-lg shadow-amber-500/10">
                <Shield className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight text-white">
                  Aether <span className="text-amber-500">Aegis</span>
                </h1>
                <p className="text-[10px] text-amber-500 font-bold uppercase tracking-[0.2em] leading-none mt-1">
                  Swarm Firewall & Decoy Intrusion System
                </p>
              </div>
            </div>
            <p className="text-zinc-400 text-xs max-w-xl leading-relaxed">
              Monitors swarm system calls, limits recursive depth, isolates untrusted host requests, and deploys digital honey-decoys.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center bg-zinc-900/50 border border-zinc-800 rounded-2xl p-1 gap-1">
            {(['overview', 'firewall', 'honeypot', 'intrusion'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                  activeTab === tab
                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 font-extrabold'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                {tab === 'honeypot' ? 'Honey Decoys' : tab === 'firewall' ? 'Firewall Rules' : tab}
              </button>
            ))}
          </div>
        </header>

        <main className="space-y-8 pb-10">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <AegisDashboard stats={stats} alerts={alerts} />
              </motion.div>
            )}

            {activeTab === 'firewall' && (
              <motion.div
                key="firewall"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <FirewallRules rules={rules} onToggleRule={handleToggleRule} loading={loading} />
              </motion.div>
            )}

            {activeTab === 'honeypot' && (
              <motion.div
                key="honeypot"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <HoneypotDecoys decoys={decoys} onAddDecoy={handleAddDecoy} loading={loading} />
              </motion.div>
            )}

            {activeTab === 'intrusion' && (
              <motion.div
                key="intrusion"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <IntrusionConsole
                  onSimulateAttack={handleSimulateAttack}
                  onClearAlerts={handleClearAlerts}
                  loading={loading}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </DashboardShell>
  );
}
