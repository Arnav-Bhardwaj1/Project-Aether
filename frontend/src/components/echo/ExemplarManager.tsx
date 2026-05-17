'use client';

import React from 'react';
import { Volume2, ShieldCheck, Sparkles, BookOpen } from 'lucide-react';

interface ExemplarManagerProps {
  logs: any[];
}

export default function ExemplarManager({ logs }: ExemplarManagerProps) {
  // Only display Approved POSITIVE exemplars
  const exemplars = logs.filter(log => log.rating === 'POSITIVE');

  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 backdrop-blur-xl h-[650px] flex flex-col space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-emerald-400" />
            Dynamic Few-Shot Exemplar Pool
          </h3>
          <p className="text-xs text-zinc-500">Exemplars retrieved and dynamically injected into prompts on similar topics.</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-emerald-400 font-bold text-xs">
          <ShieldCheck className="w-4 h-4 animate-pulse" />
          Active: {exemplars.length} Pairs
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        {exemplars.map((ex) => (
          <div 
            key={ex.trace_id} 
            className="p-5 bg-black/40 border border-zinc-800/80 hover:border-zinc-700 rounded-2xl space-y-4 transition-all"
          >
            <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500">
              <span>Trace Key: {ex.trace_id.slice(0, 8)}</span>
              <div className="flex gap-2">
                {ex.tags?.map((tag: string) => (
                  <span key={tag} className="px-2 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-zinc-400">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Side-by-side prompt and correction layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 bg-black/20 border border-white/5 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-[9px] text-zinc-500 font-bold uppercase tracking-widest">
                  <BookOpen className="w-3.5 h-3.5" />
                  Origin Query Prompt
                </div>
                <p className="text-xs text-zinc-300 font-semibold leading-relaxed">{ex.prompt}</p>
              </div>

              <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/10 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-[9px] text-emerald-400 font-bold uppercase tracking-widest">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  Aligned Response Exemplar
                </div>
                <p className="text-xs text-zinc-200 leading-relaxed font-mono whitespace-pre-wrap">
                  {ex.corrected_response || ex.original_response}
                </p>
              </div>
            </div>
          </div>
        ))}

        {exemplars.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center py-32 text-center text-zinc-650">
            <Volume2 className="w-12 h-12 mb-4 opacity-15" />
            <h4 className="font-bold text-zinc-450 mb-1">No Exemplars Active</h4>
            <p className="text-xs max-w-xs leading-relaxed">
              When you rate a corrected trace as <span className="text-emerald-500 font-bold">POSITIVE</span> in the Critic Console, it is added to this pool. The system dynamically pulls matching exemplars to augment the agent's prompts in real-time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
