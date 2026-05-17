'use client';

import React, { useState, useEffect } from 'react';
import DashboardShell from '@/components/DashboardShell';
import FeedbackConsole from '@/components/echo/FeedbackConsole';
import AlignmentTrends from '@/components/echo/AlignmentTrends';
import DatasetExporter from '@/components/echo/DatasetExporter';
import ExemplarManager from '@/components/echo/ExemplarManager';
import { Volume2, Award, FileSpreadsheet, RefreshCw } from 'lucide-react';

export default function EchoPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'console' | 'exporter' | 'exemplars'>('console');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [logsRes, statsRes] = await Promise.all([
        fetch('http://localhost:8000/api/echo/logs'),
        fetch('http://localhost:8000/api/echo/stats')
      ]);
      const logsData = await logsRes.json();
      const statsData = await statsRes.json();
      setLogs(logsData);
      setStats(statsData);
    } catch (err) {
      console.error("Aether Echo: Failed to load alignment logs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <DashboardShell>
      <div className="min-h-screen bg-[#050505] text-white p-6 space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-900">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-gradient-to-br from-emerald-500/20 to-transparent border border-emerald-500/30 rounded-xl shadow-lg shadow-emerald-500/10">
                <Volume2 className="w-6 h-6 text-emerald-400" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white">
                Aether <span className="bg-gradient-to-r from-emerald-400 to-indigo-400 bg-clip-text text-transparent">Echo</span>
              </h1>
            </div>
            <p className="text-zinc-400 max-w-2xl text-sm leading-relaxed">
              RLHF Alignment & Prompt Tuning Studio. Direct, live human-in-the-loop response corrections, prompt exemplar management, and dataset compilations for fine-tuning.
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {stats && (
              <div className="flex gap-6 pr-6 border-r border-zinc-800 hidden sm:flex">
                <div className="text-right">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Alignment Rate</span>
                  <span className="text-xl font-bold font-mono text-emerald-400">{stats.alignment_score}%</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Total Audited</span>
                  <span className="text-xl font-bold font-mono text-zinc-300">{stats.total_reviews}</span>
                </div>
              </div>
            )}

            <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-xl">
              <button 
                onClick={() => setActiveTab('console')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'console' ? 'bg-emerald-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <Award className="w-3.5 h-3.5" />
                CRITIC CONSOLE
              </button>
              <button 
                onClick={() => setActiveTab('exporter')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'exporter' ? 'bg-emerald-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                TUNING COMPILER
              </button>
              <button 
                onClick={() => setActiveTab('exemplars')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'exemplars' ? 'bg-emerald-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                EXEMPLARS
              </button>
            </div>

            <button 
              onClick={fetchData}
              className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-colors flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 text-zinc-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        {loading && logs.length === 0 ? (
          <div className="flex items-center justify-center py-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-500 border-r-2" />
          </div>
        ) : (
          <main className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            <div className="xl:col-span-3 space-y-8">
              {activeTab === 'console' && (
                <FeedbackConsole logs={logs} onSubmitted={fetchData} />
              )}
              {activeTab === 'exporter' && (
                <DatasetExporter logs={logs} />
              )}
              {activeTab === 'exemplars' && (
                <ExemplarManager logs={logs} />
              )}
            </div>

            {/* Sidebar analytics */}
            <div className="space-y-8">
              {stats && <AlignmentTrends data={stats.timeline} stats={stats} />}
            </div>
          </main>
        )}
      </div>
    </DashboardShell>
  );
}
