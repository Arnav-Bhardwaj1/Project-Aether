'use client';

import React from 'react';
import { ShieldAlert, ShieldCheck, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SimulationMatrixProps {
  results: any[];
}

export default function SimulationMatrix({ results }: SimulationMatrixProps) {
  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 backdrop-blur-xl">
      <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
        <ShieldAlert className="w-5 h-5 text-zinc-400" />
        Live Attack Matrix
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        <AnimatePresence>
          {results.map((result, idx) => {
            const isBlocked = result.violations && result.violations.length > 0;
            const isSuccess = !isBlocked && result.outcome === 'SUCCESS';
            
            return (
              <motion.div
                key={result.test_id || idx}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                layout
                className={`aspect-square rounded-2xl border flex flex-col items-center justify-center p-2 relative overflow-hidden group transition-all ${
                  isBlocked 
                    ? 'bg-blue-500/10 border-blue-500/30' 
                    : isSuccess 
                      ? 'bg-red-500/10 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                      : 'bg-zinc-800 border-zinc-700'
                }`}
              >
                {/* Background glow for breaches */}
                {isSuccess && (
                  <div className="absolute inset-0 bg-red-500/10 animate-pulse" />
                )}

                <div className="relative z-10 flex flex-col items-center gap-2">
                  {isBlocked ? (
                    <ShieldCheck className="w-8 h-8 text-blue-400" />
                  ) : isSuccess ? (
                    <ShieldAlert className="w-8 h-8 text-red-500" />
                  ) : (
                    <HelpCircle className="w-8 h-8 text-zinc-500" />
                  )}
                  
                  <span className={`text-[10px] font-bold uppercase tracking-wider text-center ${
                    isBlocked ? 'text-blue-400' : isSuccess ? 'text-red-400' : 'text-zinc-500'
                  }`}>
                    {isBlocked ? 'BLOCKED' : isSuccess ? 'BREACH' : 'PENDING'}
                  </span>
                </div>

                {/* Hover Tooltip */}
                <div className="absolute inset-0 bg-zinc-900/95 p-3 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center text-center z-20">
                  <div className="text-[10px] font-bold text-zinc-400 mb-1">{result.category}</div>
                  <div className="text-[9px] text-zinc-500 line-clamp-3">"{result.prompt}"</div>
                  {isBlocked && (
                    <div className="text-[9px] text-blue-400 mt-2 font-mono">
                      {result.violations[0]?.rule_name}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
          
          {results.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center text-zinc-600">
               <div className="w-16 h-16 border-2 border-dashed border-zinc-700 rounded-2xl mb-4 flex items-center justify-center">
                  <ShieldAlert className="w-6 h-6 opacity-50" />
               </div>
               <p className="text-sm">Awaiting simulation telemetry...</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
