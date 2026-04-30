"use client";

import React from "react";
import { History, FilePlus, FileMinus, FileEdit, Database, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Mutation {
  id: string;
  type: string;
  path?: string;
  table?: string;
  prev_content?: string;
  content?: string;
  actor: string;
  timestamp: number;
}

interface MutationTimelineProps {
  mutations: Mutation[];
}

const MutationTimeline: React.FC<MutationTimelineProps> = ({ mutations }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case "FILE_WRITE": return <FileEdit size={14} className="text-cyan-400" />;
      case "FILE_DELETE": return <FileMinus size={14} className="text-red-400" />;
      case "DB_MUTATION": return <Database size={14} className="text-purple-400" />;
      case "WORLD_RESTORE": return <RotateCcw size={14} className="text-emerald-400" />;
      default: return <History size={14} className="text-white/40" />;
    }
  };

  return (
    <div className="glass-panel flex flex-col h-full bg-[#050507]/60">
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <History size={16} className="text-cyan-400" />
          <h3 className="text-xs font-bold text-white/80 uppercase tracking-widest">Mutation Log</h3>
        </div>
        <span className="text-[9px] font-bold text-white/20 uppercase">Environment Delta-Stream</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        <AnimatePresence initial={false} mode="popLayout">
          {mutations.slice().reverse().map((mut) => (
            <motion.div
              key={mut.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative pl-6 border-l border-white/5 pb-2"
            >
              <div className="absolute -left-[7px] top-0 p-0.5 bg-[#050507] border border-white/10 rounded-full">
                {getIcon(mut.type)}
              </div>
              
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-tighter">
                  {mut.type.replace("_", " ")}
                </span>
                <span className="text-[8px] font-mono text-white/10">
                  {new Date(mut.timestamp * 1000).toLocaleTimeString()}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/2 border border-white/5 hover:border-cyan-500/30 transition-all group">
                <div className="flex items-center gap-2 mb-2">
                   <span className="text-[11px] font-mono text-white/80 group-hover:text-cyan-400 transition-colors truncate">
                      {mut.path || mut.table || "System World"}
                   </span>
                </div>
                
                {mut.content && (
                  <div className="text-[9px] font-mono text-white/20 line-clamp-1 bg-black/40 p-1 rounded">
                    + {mut.content}
                  </div>
                )}
                
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                    <span className="text-[8px] font-bold text-white/20 uppercase tracking-tighter">Actor: {mut.actor}</span>
                  </div>
                  <button className="text-[8px] font-black text-cyan-400/40 hover:text-cyan-400 uppercase tracking-widest transition-colors">
                    Revert Delta
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {mutations.length === 0 && (
          <div className="h-full flex items-center justify-center flex-col opacity-5 grayscale">
             <History size={48} className="mb-4" />
             <p className="text-[10px] font-bold uppercase tracking-[0.3em]">No Mutations Detected</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MutationTimeline;
