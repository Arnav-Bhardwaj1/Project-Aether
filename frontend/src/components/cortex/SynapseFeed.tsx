'use client';

import React, { useState } from 'react';
import { Zap, Terminal, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SynapseFeedProps {
  onRefreshNeeded: () => void;
}

export default function SynapseFeed({ onRefreshNeeded }: SynapseFeedProps) {
  const [manualInput, setManualInput] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [synapses, setSynapses] = useState<any[]>([]);

  const handleManualExtract = async () => {
    if (!manualInput.trim()) return;
    setIsExtracting(true);
    try {
      const res = await fetch('http://localhost:8000/api/cortex/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: manualInput })
      });
      const data = await res.json();
      if (data.status === 'SUCCESS' && data.extracted.length > 0) {
        setSynapses(prev => [...data.extracted, ...prev].slice(0, 10));
        onRefreshNeeded();
        setManualInput('');
      }
    } catch (err) {
      console.error("Manual extraction failed", err);
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 backdrop-blur-xl space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          Synaptic Commitment Log
        </h3>
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest bg-black/40 px-2 py-1 rounded border border-zinc-800">
          Real-Time Extraction
        </span>
      </div>

      {/* Manual Input */}
      <div className="relative group">
        <textarea
          value={manualInput}
          onChange={(e) => setManualInput(e.target.value)}
          placeholder="Input raw text to extract and commit memories manually..."
          className="w-full bg-black/40 border border-zinc-800 rounded-2xl p-4 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500/50 transition-all resize-none h-24"
        />
        <button
          onClick={handleManualExtract}
          disabled={isExtracting || !manualInput.trim()}
          className="absolute bottom-4 right-4 p-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-500 rounded-xl transition-all shadow-lg shadow-indigo-500/20"
        >
          {isExtracting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Plus className="w-5 h-5 text-white" />
          )}
        </button>
      </div>

      {/* Live Feed */}
      <div className="space-y-3 overflow-hidden">
        <AnimatePresence initial={false}>
          {synapses.map((s, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-4 p-3 bg-black/20 border border-white/5 rounded-xl group hover:border-indigo-500/30 transition-all"
            >
              <div className="p-2 bg-indigo-500/10 rounded-lg">
                <Terminal className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="flex-1 text-sm font-mono flex items-center gap-2">
                <span className="text-indigo-300 font-bold">{s.subject}</span>
                <span className="text-zinc-500 text-[10px] uppercase">{s.predicate}</span>
                <span className="text-zinc-200">{s.object}</span>
              </div>
              <div className="text-[9px] text-zinc-600 font-bold uppercase">committed</div>
            </motion.div>
          ))}
        </AnimatePresence>

        {synapses.length === 0 && (
          <div className="py-8 text-center text-zinc-600 text-sm italic">
            No memories committed in this session yet.
          </div>
        )}
      </div>
    </div>
  );
}
