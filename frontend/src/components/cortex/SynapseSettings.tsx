'use client';

import React, { useState } from 'react';
import { Settings, Save, Trash2, ShieldCheck, History } from 'lucide-react';

export default function SynapseSettings() {
  const [intensity, setIntensity] = useState(75);
  const [pruningEnabled, setPruningEnabled] = useState(true);
  const [autoSave, setAutoSave] = useState(true);

  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 backdrop-blur-xl space-y-6">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Settings className="w-5 h-5 text-zinc-400" />
        Cognitive Configuration
      </h3>

      <div className="space-y-6">
        {/* Extraction Intensity */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Extraction Intensity</label>
            <span className="text-xs font-mono text-indigo-400 font-bold">{intensity}%</span>
          </div>
          <input 
            type="range" 
            min="10" 
            max="100" 
            value={intensity}
            onChange={(e) => setIntensity(parseInt(e.target.value))}
            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <p className="text-[10px] text-zinc-600 italic">Determines the depth of semantic triplet extraction from agent traces.</p>
        </div>

        {/* Toggle Settings */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-black/40 border border-zinc-800/50 rounded-xl group hover:border-indigo-500/30 transition-all cursor-pointer" onClick={() => setPruningEnabled(!pruningEnabled)}>
            <div className="flex items-center gap-3">
              <History className={`w-4 h-4 ${pruningEnabled ? 'text-indigo-400' : 'text-zinc-600'}`} />
              <span className="text-sm text-zinc-300">Memory Aging (Pruning)</span>
            </div>
            <div className={`w-10 h-5 rounded-full transition-all relative ${pruningEnabled ? 'bg-indigo-600' : 'bg-zinc-700'}`}>
              <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${pruningEnabled ? 'right-1' : 'left-1'}`} />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-black/40 border border-zinc-800/50 rounded-xl group hover:border-indigo-500/30 transition-all cursor-pointer" onClick={() => setAutoSave(!autoSave)}>
            <div className="flex items-center gap-3">
              <ShieldCheck className={`w-4 h-4 ${autoSave ? 'text-emerald-400' : 'text-zinc-600'}`} />
              <span className="text-sm text-zinc-300">Atomic Persistence</span>
            </div>
            <div className={`w-10 h-5 rounded-full transition-all relative ${autoSave ? 'bg-emerald-600' : 'bg-zinc-700'}`}>
              <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${autoSave ? 'right-1' : 'left-1'}`} />
            </div>
          </div>
        </div>

        <div className="pt-2 grid grid-cols-2 gap-3">
          <button className="py-3 bg-zinc-800 hover:bg-red-500/10 border border-zinc-700 hover:border-red-500/30 rounded-xl text-xs font-bold text-zinc-400 hover:text-red-400 transition-all flex items-center justify-center gap-2">
            <Trash2 className="w-4 h-4" />
            WIPE BRAIN
          </button>
          <button className="py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-2">
            <Save className="w-4 h-4" />
            SAVE STATE
          </button>
        </div>
      </div>
    </div>
  );
}
