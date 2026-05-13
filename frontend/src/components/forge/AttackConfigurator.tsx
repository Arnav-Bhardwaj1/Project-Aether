'use client';

import React, { useState } from 'react';
import { Play, Settings2, Target, Zap } from 'lucide-react';

interface AttackConfiguratorProps {
  onStart: (config: any) => void;
  isSimulating: boolean;
}

const CATEGORIES = [
  { id: 'JAILBREAK', label: 'Jailbreaks', desc: 'Creative roleplay to bypass filters' },
  { id: 'PROMPT_INJECTION', label: 'Prompt Injection', desc: 'Override system instructions' },
  { id: 'PII_HARVESTING', label: 'Data Exfiltration', desc: 'Social engineering for PII' },
  { id: 'SYSTEM_OVERRIDE', label: 'System Override', desc: 'Unauthorized API access' }
];

export default function AttackConfigurator({ onStart, isSimulating }: AttackConfiguratorProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['JAILBREAK']);
  const [iterations, setIterations] = useState(3);

  const toggleCategory = (id: string) => {
    setSelectedCategories(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 backdrop-blur-xl">
      <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
        <Settings2 className="w-5 h-5 text-red-500" />
        Simulation Parameters
      </h3>

      <div className="space-y-6">
        <div>
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Attack Vectors
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {CATEGORIES.map(cat => (
              <div 
                key={cat.id}
                onClick={() => !isSimulating && toggleCategory(cat.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedCategories.includes(cat.id) 
                    ? 'bg-red-500/10 border-red-500/50' 
                    : 'bg-black/40 border-zinc-800/50 hover:border-zinc-700'
                } ${isSimulating ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-bold ${selectedCategories.includes(cat.id) ? 'text-red-400' : 'text-zinc-300'}`}>
                    {cat.label}
                  </span>
                  <div className={`w-3 h-3 rounded-full border-2 ${
                    selectedCategories.includes(cat.id) ? 'border-red-500 bg-red-500/50' : 'border-zinc-600'
                  }`} />
                </div>
                <p className="text-[10px] text-zinc-500">{cat.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Intensity (Iterations per Vector)
          </label>
          <div className="flex items-center gap-4">
            <input 
              type="range" 
              min="1" 
              max="10" 
              value={iterations} 
              onChange={(e) => setIterations(parseInt(e.target.value))}
              disabled={isSimulating}
              className="flex-1 accent-red-500"
            />
            <span className="text-xl font-bold text-zinc-200 font-mono w-8 text-center">{iterations}</span>
          </div>
        </div>

        <button 
          onClick={() => onStart({ categories: selectedCategories, iterations })}
          disabled={isSimulating || selectedCategories.length === 0}
          className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
            isSimulating 
              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
              : selectedCategories.length > 0 
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/20' 
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
          }`}
        >
          {isSimulating ? (
            <>
              <div className="w-4 h-4 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
              SIMULATING...
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" />
              LAUNCH ATTACK SUITE
            </>
          )}
        </button>
      </div>
    </div>
  );
}
