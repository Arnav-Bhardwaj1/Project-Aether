"use client";

import React, { useMemo } from "react";
import { 
  Zap, 
  ShieldCheck, 
  ShieldAlert, 
  Search, 
  Cpu, 
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TraceStep {
  step: string;
  status: string;
  data?: any;
}

export default function AetherFlow({ traces }: { traces: TraceStep[] }) {
  const steps = [
    { id: "INPUT_AUDIT", label: "Sentry Input Scan", icon: <Search size={18} /> },
    { id: "LLM_GENERATE", label: "Gemini Reasoning", icon: <Cpu size={18} /> },
    { id: "OUTPUT_AUDIT", label: "Sentry Output Scan", icon: <ShieldCheck size={18} /> }
  ];

  return (
    <div className="h-full glass flex flex-col p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Zap className="text-yellow-400" size={20} />
            Aether Flow Tracing
          </h3>
          <p className="text-xs text-white/40">Real-time execution pipeline</p>
        </div>
        <div className="flex gap-2">
          <span className="text-[10px] px-2 py-1 bg-white/5 border border-white/10 rounded uppercase font-bold text-white/40">Latency: 240ms</span>
          <span className="text-[10px] px-2 py-1 bg-white/5 border border-white/10 rounded uppercase font-bold text-white/40">Tokens: 124</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center space-y-12 relative">
        <AnimatePresence>
          {steps.map((step, index) => {
            const trace = traces.find(t => t.step === step.id);
            const isActive = trace && trace.status === "IN_PROGRESS";
            const isDone = trace && (trace.status === "COMPLETED" || trace.status === "REDACTED" || trace.status === "VIOLATION");
            const isError = trace && (trace.status === "ERROR" || trace.status === "VIOLATION");

            return (
              <React.Fragment key={step.id}>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`
                    relative z-10 w-64 p-4 rounded-2xl border transition-all duration-500
                    ${isActive ? "bg-blue-600/20 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)] scale-105" : ""}
                    ${isDone && !isError ? "bg-green-500/10 border-green-500/50" : ""}
                    ${isError ? "bg-red-500/10 border-red-500/50" : ""}
                    ${!trace ? "bg-white/5 border-white/10 opacity-40" : ""}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className={`
                      p-2 rounded-lg
                      ${isActive ? "bg-blue-600 text-white animate-pulse" : "bg-white/10 text-white/60"}
                      ${isDone && !isError ? "bg-green-600 text-white" : ""}
                      ${isError ? "bg-red-600 text-white" : ""}
                    `}>
                      {step.icon}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{step.label}</p>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest">
                        {trace ? trace.status.replace("_", " ") : "Waiting..."}
                      </p>
                    </div>
                  </div>

                  {trace?.data?.violations && trace.data.violations.length > 0 && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      className="mt-3 pt-3 border-t border-red-500/20"
                    >
                      {trace.data.violations.map((v: any, vi: number) => (
                        <div key={vi} className="flex items-center gap-2 text-[10px] text-red-400">
                          <ShieldAlert size={10} />
                          {v.message}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </motion.div>

                {index < steps.length - 1 && (
                  <div className="absolute h-12 w-0.5 bg-white/5 left-1/2 -translate-x-1/2 overflow-hidden">
                    {isActive && (
                      <motion.div 
                        initial={{ y: -50 }}
                        animate={{ y: 50 }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                        className="w-full h-1/2 bg-gradient-to-b from-transparent via-blue-500 to-transparent"
                      />
                    )}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
