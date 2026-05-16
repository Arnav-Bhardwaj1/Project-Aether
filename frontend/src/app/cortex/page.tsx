'use client';

import React, { useState, useEffect } from 'react';
import { BrainCircuit, DatabaseZap, RefreshCw, LayoutDashboard } from 'lucide-react';
import NeuralGraphCanvas from '@/components/cortex/NeuralGraphCanvas';
import SynapseFeed from '@/components/cortex/SynapseFeed';
import EntityBrowser from '@/components/cortex/EntityBrowser';
import PathFinder from '@/components/cortex/PathFinder';
import MemoryInsights from '@/components/cortex/MemoryInsights';
import SynapseSettings from '@/components/cortex/SynapseSettings';

export default function CortexPage() {
  const [graphData, setGraphData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'visual' | 'browser'>('visual');

  const fetchGraph = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:8000/api/cortex/graph');
      const data = await res.json();
      setGraphData(data);
    } catch (err) {
      console.error("Failed to fetch cortex graph", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraph();
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      {/* Header */}
      <header className="mb-12 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
              <BrainCircuit className="w-6 h-6 text-indigo-400" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white">
              Aether <span className="text-indigo-500">Cortex</span>
            </h1>
          </div>
          <p className="text-zinc-400 max-w-2xl">
            Long-Term Semantic Memory Engine. Mapping the neural architecture of persistent agentic knowledge.
          </p>
        </div>

        <div className="flex gap-4">
          <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab('visual')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'visual' ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <LayoutDashboard className="w-4 h-4" />
              VISUALIZER
            </button>
            <button 
              onClick={() => setActiveTab('browser')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'browser' ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <RefreshCw className="w-4 h-4" />
              BROWSER
            </button>
          </div>
          <button 
            onClick={fetchGraph}
            className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-5 h-5 text-zinc-400" />
            <span className="text-sm font-bold text-zinc-400">Sync Brain</span>
          </button>
        </div>
      </header>

      {loading && !graphData ? (
        <div className="flex items-center justify-center py-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-500 border-r-2" />
        </div>
      ) : (
        <main className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Visualization Area */}
          <div className="xl:col-span-3 space-y-8">
            {activeTab === 'visual' ? (
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 backdrop-blur-xl h-[650px] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                   <h3 className="text-lg font-semibold flex items-center gap-2">
                      <DatabaseZap className="w-5 h-5 text-indigo-500" />
                      Neural Pathway Visualization
                   </h3>
                   {graphData?.stats && (
                     <div className="flex gap-4 text-xs font-mono text-zinc-500 bg-black/40 px-3 py-1.5 rounded-lg border border-zinc-800">
                       <span>Nodes: {graphData.stats.node_count}</span>
                       <span>Synapses: {graphData.stats.edge_count}</span>
                     </div>
                   )}
                </div>
                
                <div className="flex-1 border border-zinc-800/50 rounded-2xl overflow-hidden bg-black/60 relative">
                  <NeuralGraphCanvas data={graphData} />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[650px]">
                <EntityBrowser nodes={graphData?.nodes || []} edges={graphData?.links || []} />
                <SynapseFeed onRefreshNeeded={fetchGraph} />
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <PathFinder nodes={graphData?.nodes || []} />
              {activeTab === 'visual' && <SynapseFeed onRefreshNeeded={fetchGraph} />}
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
            <MemoryInsights stats={graphData?.stats} nodes={graphData?.nodes || []} />
            <SynapseSettings />
            {activeTab === 'visual' && <EntityBrowser nodes={graphData?.nodes || []} edges={graphData?.links || []} />}
          </div>
        </main>
      )}
    </div>
  );
}
