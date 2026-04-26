"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Loader2, ShieldAlert, ShieldCheck, Zap } from "lucide-react";
import { TraceStep } from "../hooks/useFlux";

interface Props {
  onExecute: (prompt: string) => void;
  isExecuting: boolean;
  traces: TraceStep[];
}

export default function AgentChat({ onExecute, isExecuting, traces }: Props) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isExecuting) return;
    onExecute(input);
    setInput("");
  };

  const steps = [
    { id: "INPUT_AUDIT", label: "Sentry Scan" },
    { id: "LLM_GENERATE", label: "Gemini AI" },
    { id: "OUTPUT_AUDIT", label: "Verification" }
  ];

  return (
    <div className="flex flex-col h-full glass overflow-hidden">
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <h3 className="font-semibold flex items-center gap-2 text-sm uppercase tracking-widest text-white/60">
          <Zap size={14} className="text-blue-400" />
          Execution Pipeline
        </h3>
        <div className="flex items-center gap-4">
          {steps.map(step => {
            const trace = traces.find(t => t.step === step.id);
            const isActive = trace?.status === "IN_PROGRESS";
            const isDone = trace && (trace.status === "COMPLETED" || trace.status === "REDACTED" || trace.status === "VIOLATION");
            
            return (
              <div key={step.id} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isActive ? "bg-blue-500 animate-pulse" : isDone ? "bg-green-500" : "bg-white/10"}`} />
                <span className={`text-[10px] font-bold ${isActive ? "text-blue-400" : isDone ? "text-white/80" : "text-white/20"}`}>{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
        <AnimatePresence mode="wait">
          {isExecuting ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full animate-pulse" />
                <Loader2 className="animate-spin text-blue-400 relative z-10" size={48} />
              </div>
              <div>
                <p className="text-sm font-bold text-white/80">Agent is thinking...</p>
                <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Traversing Aether Flux</p>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20">
                <Send size={24} />
              </div>
              <p className="text-sm text-white/40 max-w-[240px]">Enter a prompt to trigger a new execution snapshot</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <form onSubmit={handleSubmit} className="p-6 bg-white/[0.03] border-t border-white/5">
        <div className="relative group">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isExecuting}
            placeholder={isExecuting ? "Agent busy..." : "Issue command to Aether Core..."} 
            className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-6 pr-16 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all outline-none"
          />
          <button 
            type="submit"
            disabled={isExecuting || !input.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-blue-600 rounded-xl hover:bg-blue-500 disabled:opacity-0 disabled:scale-90 transition-all shadow-lg shadow-blue-600/20"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}

import { motion, AnimatePresence } from "framer-motion";
