"use client";

import React, { useState } from "react";
import { Terminal, Play, Square, Loader2, Bug } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ConsoleProps {
  onSimulate: (categories: string[]) => void;
  isSimulating: boolean;
  logs: string[];
}

const RedTeamConsole: React.FC<ConsoleProps> = ({ onSimulate, isSimulating, logs }) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["PROMPT_INJECTION", "JAILBREAK"]);

  const categories = [
    { id: "PROMPT_INJECTION", label: "Prompt Injection" },
    { id: "PII_HARVESTING", label: "PII Harvesting" },
    { id: "LOGICAL_DECOY", label: "Logical Decoy" },
    { id: "JAILBREAK", label: "Jailbreak Attempts" }
  ];

  const toggleCategory = (id: string) => {
    setSelectedCategories(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  return (
    <div className="glass-panel h-full flex flex-col bg-[#0a0a0c]/80 border-orange-500/10">
      {/* Console Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
            <Bug size={16} className="text-orange-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white/90">Red-Team Terminal</h3>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Adversarial Orchestration</p>
          </div>
        </div>
        
        <button
          onClick={() => onSimulate(selectedCategories)}
          disabled={isSimulating || selectedCategories.length === 0}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-bold text-[10px] uppercase transition-all ${
            isSimulating 
              ? "bg-white/5 text-white/20 border border-white/5 cursor-not-allowed" 
              : "bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/20"
          }`}
        >
          {isSimulating ? (
            <>
              <Loader2 size={12} className="animate-spin" />
              Engaged
            </>
          ) : (
            <>
              <Play size={12} fill="currentColor" />
              Launch Suite
            </>
          )}
        </button>
      </div>

      {/* Control Area */}
      <div className="p-4 bg-white/5 border-b border-white/5">
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => toggleCategory(cat.id)}
              className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all border ${
                selectedCategories.includes(cat.id)
                  ? "bg-orange-500/20 border-orange-500/40 text-orange-400"
                  : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Log Output */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 font-mono text-[11px] space-y-1 custom-scrollbar bg-black/40">
        <AnimatePresence mode="popLayout">
          {logs.map((log, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-3"
            >
              <span className="text-white/20">[{new Date().toLocaleTimeString()}]</span>
              <span className={
                log.includes("VIOLATION") ? "text-red-400 font-bold" :
                log.includes("LAUNCH") ? "text-orange-400" :
                log.includes("SUCCESS") ? "text-emerald-400" : "text-white/60"
              }>
                {log}
              </span>
            </motion.div>
          ))}
          {logs.length === 0 && (
            <div className="h-full flex items-center justify-center flex-col opacity-20 italic">
               <Terminal size={48} className="mb-4" />
               <p>Awaiting sequence initialization...</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RedTeamConsole;
