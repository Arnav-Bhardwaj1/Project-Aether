'use client';

import React from 'react';
import { GitFork, ArrowRight, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface SessionTreeProps {
  branches: any[];
  currentSessionId: string;
}

export default function SessionTree({ branches, currentSessionId }: SessionTreeProps) {
  return (
    <div className="relative">
      {/* Root Session Node */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-10 h-10 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center">
          <Share2 className="w-5 h-5 text-zinc-400" />
        </div>
        <div>
          <div className="text-xs font-bold text-zinc-500 uppercase tracking-tighter">Root Session</div>
          <div className="text-sm font-mono text-zinc-300 truncate w-40">{currentSessionId}</div>
        </div>
      </div>

      {/* Forks */}
      <div className="pl-5 space-y-6 relative">
        {/* Connector Line */}
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-zinc-800 to-transparent" />
        
        {branches.map((branch, idx) => (
          <motion.div 
            key={branch.session_id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex items-start gap-4 group"
          >
            <div className="mt-2 w-4 h-0.5 bg-zinc-800 group-hover:bg-purple-500 transition-colors" />
            <div className="flex-1 bg-zinc-900/60 border border-zinc-800 p-4 rounded-2xl hover:border-purple-500/50 transition-all cursor-pointer">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">{branch.branch_name}</span>
                <GitFork className="w-3 h-3 text-zinc-600" />
              </div>
              <div className="text-[10px] font-mono text-zinc-500 mb-2 truncate">{branch.session_id}</div>
              <div className="flex items-center gap-2 text-[9px] text-zinc-600">
                <span>Forked from frame {branch.source_frame.slice(0, 8)}</span>
                <ArrowRight className="w-2 h-2" />
              </div>
            </div>
          </motion.div>
        ))}

        {branches.length === 0 && (
          <div className="flex flex-col items-center py-8 text-center">
            <p className="text-xs text-zinc-600 italic">No reality forks detected from this session root.</p>
          </div>
        )}
      </div>

      {/* Action Button */}
      <button className="mt-8 w-full py-3 bg-purple-600/10 border border-purple-500/20 rounded-xl text-purple-400 text-xs font-bold hover:bg-purple-600 hover:text-white transition-all">
        Fork Current Frame
      </button>
    </div>
  );
}
