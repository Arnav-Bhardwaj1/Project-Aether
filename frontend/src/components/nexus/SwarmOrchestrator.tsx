"use client";

import React, { useState } from "react";
import { Zap, Play, Square, Loader2, Network, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SwarmOrchestratorProps {
  onLaunch: (prompt: string) => void;
  onStop: () => void;
  isLaunching: boolean;
  status: string;
}

const SwarmOrchestrator: React.FC<SwarmOrchestratorProps> = ({ onLaunch, onStop, isLaunching, status }) => {
  const [prompt, setPrompt] = useState("");
  
  const suggestions = [
    "Analyze the security implications of this code snippet.",
    "Perform a deep research on market trends for AI agents in 2026.",
    "Audit this document for PII and compliance violations.",
    "Decompose a strategy for deploying a secure LLM proxy."
  ];

  return (
    <div className="glass-panel p-6 flex flex-col gap-6 h-full bg-[#0a0a0c]/80 border-cyan-500/10">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 shadow-lg shadow-cyan-500/5">
          <Network className="text-cyan-400" size={24} />
        </div>
        <div>
          <h2 className="text-lg font-black tracking-tight text-white/90">Swarm Orchestrator</h2>
          <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">Multi-Agent Control Surface</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        <div className="relative group">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe a complex objective for the swarm..."
            className="w-full h-40 bg-white/5 border border-white/10 rounded-2xl p-5 text-sm text-white/80 focus:outline-none focus:border-cyan-500/50 transition-all resize-none placeholder:text-white/20 custom-scrollbar"
          />
          <div className="absolute bottom-4 right-4 flex gap-2">
            {isLaunching ? (
                <button 
                    onClick={onStop}
                    className="p-2 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all"
                >
                    <Square size={16} fill="currentColor" />
                </button>
            ) : (
                <button
                    onClick={() => onLaunch(prompt)}
                    disabled={!prompt.trim()}
                    className="p-2 rounded-full bg-cyan-500 text-white shadow-lg shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                >
                    <Play size={16} fill="currentColor" />
                </button>
            )}
          </div>
        </div>

        <div className="space-y-2">
           <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest px-2">Mission Parameters</span>
           <div className="grid grid-cols-1 gap-2">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(s)}
                  className="text-left p-3 rounded-xl bg-white/2 border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-white/40 group-hover:text-white/60 transition-colors line-clamp-1">{s}</p>
                    <ChevronRight size={12} className="text-white/10 group-hover:text-cyan-400 transition-colors" />
                  </div>
                </button>
              ))}
           </div>
        </div>
      </div>

      <AnimatePresence>
        {isLaunching && (
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/10 flex items-center gap-4"
            >
                <Loader2 size={18} className="text-cyan-400 animate-spin" />
                <div className="flex-1">
                    <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-1">Status: {status}</p>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                            className="h-full bg-cyan-400"
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 30, repeat: Infinity }}
                        />
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SwarmOrchestrator;
