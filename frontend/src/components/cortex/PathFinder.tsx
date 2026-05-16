'use client';

import React, { useState } from 'react';
import { Route, Wand2, ArrowRight, Info, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PathFinderProps {
  nodes: any[];
}

export default function PathFinder({ nodes }: PathFinderProps) {
  const [startEntity, setStartEntity] = useState('');
  const [endEntity, setEndEntity] = useState('');
  const [result, setResult] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleDiscover = async () => {
    if (!startEntity || !endEntity) return;
    setIsSearching(true);
    setResult(null);
    
    try {
      const res = await fetch('http://localhost:8000/api/cortex/reason', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start: startEntity, end: endEntity })
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error("Discovery failed", err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 backdrop-blur-xl space-y-6">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Route className="w-5 h-5 text-indigo-400" />
        Semantic Path Discovery
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Origin Entity</label>
          <input
            list="nodes-list"
            value={startEntity}
            onChange={(e) => setStartEntity(e.target.value)}
            placeholder="e.g. User"
            className="w-full bg-black/40 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500/50"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Target Entity</label>
          <input
            list="nodes-list"
            value={endEntity}
            onChange={(e) => setEndEntity(e.target.value)}
            placeholder="e.g. AWS"
            className="w-full bg-black/40 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500/50"
          />
        </div>
      </div>

      <datalist id="nodes-list">
        {nodes.map(n => <option key={n.id} value={n.label} />)}
      </datalist>

      <button
        onClick={handleDiscover}
        disabled={isSearching || !startEntity || !endEntity}
        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-500 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
      >
        {isSearching ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <Wand2 className="w-5 h-5" />
            DISCOVER HIDDEN CONNECTIONS
          </>
        )}
      </button>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {result.status === 'SUCCESS' ? (
              <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {result.path.map((step: string, idx: number) => (
                    <React.Fragment key={idx}>
                      <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-lg text-xs font-bold border border-indigo-500/30 whitespace-nowrap">
                        {step}
                      </span>
                      {idx < result.path.length - 1 && (
                        <ArrowRight className="w-4 h-4 text-zinc-600 shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
                
                <div className="p-4 bg-black/40 rounded-xl border border-zinc-800/50">
                  <div className="flex items-center gap-2 mb-2 text-indigo-400 font-bold text-xs uppercase">
                    <Info className="w-4 h-4" />
                    Logical Synthesis
                  </div>
                  <p className="text-sm text-zinc-300 leading-relaxed italic">
                    "{result.reasoning}"
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3 text-red-400 text-sm">
                <AlertCircle className="w-5 h-5" />
                {result.message}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
