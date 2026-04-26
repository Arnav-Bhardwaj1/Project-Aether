"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Cpu, 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  Terminal,
  ChevronRight,
  Database
} from "lucide-react";
import { Snapshot } from "../hooks/useFlux";

export default function StateInspector({ snapshot }: { snapshot: Snapshot | null }) {
  if (!snapshot) {
    return (
      <div className="h-full glass flex flex-col items-center justify-center p-8 text-center">
        <Database size={48} className="text-white/10 mb-4" />
        <p className="text-white/40 text-sm">Select a snapshot from the timeline to inspect state</p>
      </div>
    );
  }

  const sections = [
    { 
      id: "input", 
      label: "Input Audit", 
      icon: <Search size={16}/>, 
      content: snapshot.prompt,
      audit: snapshot.input_audit 
    },
    { 
      id: "reasoning", 
      label: "Model Reasoning", 
      icon: <Cpu size={16}/>, 
      content: snapshot.response,
      audit: null 
    },
    { 
      id: "output", 
      label: "Output Audit", 
      icon: <ShieldCheck size={16}/>, 
      content: snapshot.response,
      audit: snapshot.output_audit 
    }
  ];

  return (
    <div className="h-full glass flex flex-col p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-lg">State Inspector</h3>
          <p className="text-[10px] text-white/40 font-mono">{snapshot.id}</p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-purple-400 font-bold uppercase">{snapshot.branch_name}</span>
          <span className="text-[10px] text-white/20">{new Date(snapshot.timestamp * 1000).toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <motion.div 
            key={section.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/60">
                {section.icon}
                {section.label}
              </div>
              {section.audit && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${section.audit.passed ? "text-green-400 border-green-500/20 bg-green-500/5" : "text-red-400 border-red-500/20 bg-red-500/5"}`}>
                  {section.audit.passed ? "Passed" : "Violation Detected"}
                </span>
              )}
            </div>

            <div className="bg-black/40 border border-white/5 rounded-xl p-4 font-mono text-xs leading-relaxed group relative">
              <div className="max-h-40 overflow-y-auto pr-2 text-white/80">
                {section.content}
              </div>
              
              {section.audit?.violations && section.audit.violations.length > 0 && (
                <div className="mt-4 pt-4 border-t border-red-500/20 space-y-2">
                  {section.audit.violations.map((v: any, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-red-400 text-[10px]">
                      <ShieldAlert size={12} className="shrink-0 mt-0.5" />
                      <div>
                         <span className="font-bold">{v.type}:</span> {v.message}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}

        <div className="pt-6 mt-6 border-t border-white/5">
           <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/60 mb-4">
              <Terminal size={16}/>
              Execution Metadata
           </div>
           <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                 <p className="text-[10px] text-white/40 uppercase mb-1">Latency</p>
                 <p className="text-sm font-bold text-blue-400">{(snapshot.metadata.latency * 1000).toFixed(0)}ms</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                 <p className="text-[10px] text-white/40 uppercase mb-1">Model</p>
                 <p className="text-sm font-bold text-purple-400">{snapshot.metadata.model}</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
