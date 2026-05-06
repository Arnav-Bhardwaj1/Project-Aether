'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Lock, AlertTriangle, Activity, CheckCircle, Database, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GovernanceDashboard from '@/components/citadel/GovernanceDashboard';
import PolicyGrid from '@/components/citadel/PolicyGrid';
import ViolationFeed from '@/components/citadel/ViolationFeed';

export default function CitadelPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'policies' | 'audit'>('overview');
  const [stats, setStats] = useState<any>(null);
  const [policies, setPolicies] = useState<any[]>([]);
  const [violations, setViolations] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, policiesRes, violationsRes] = await Promise.all([
          fetch('http://localhost:8000/api/citadel/stats'),
          fetch('http://localhost:8000/api/citadel/policies'),
          fetch('http://localhost:8000/api/citadel/violations'),
        ]);
        
        setStats(await statsRes.json());
        setPolicies(await policiesRes.json());
        setViolations(await violationsRes.json());
      } catch (err) {
        console.error("Failed to fetch Citadel data", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // Polling for demo purposes
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      {/* Header */}
      <header className="mb-12 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
              <Shield className="w-6 h-6 text-blue-400" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white">
              Aether <span className="text-blue-500">Citadel</span>
            </h1>
          </div>
          <p className="text-zinc-400 max-w-2xl">
            Enterprise-grade Governance & Compliance suite. Real-time policy enforcement for autonomous agents.
          </p>
        </div>

        <div className="flex bg-zinc-900/50 border border-zinc-800 rounded-xl p-1 gap-1">
          {['overview', 'policies', 'audit'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-2 rounded-lg transition-all ${
                activeTab === tab 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </header>

      <main className="space-y-8">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <GovernanceDashboard stats={stats} />
            </motion.div>
          )}

          {activeTab === 'policies' && (
            <motion.div
              key="policies"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <PolicyGrid policies={policies} />
            </motion.div>
          )}

          {activeTab === 'audit' && (
            <motion.div
              key="audit"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ViolationFeed violations={violations} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
