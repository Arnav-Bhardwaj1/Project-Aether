"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Columns, 
  X, 
  ArrowRightLeft,
  Zap,
  ShieldCheck,
  ShieldAlert
} from "lucide-react";
import { Snapshot } from "../hooks/useFlux";

interface Props {
  left: Snapshot | null;
  right: Snapshot | null;
  onClose: () => void;
}

export default function ScenarioComparison({ left, right, onClose }: Props) {
  if (!left || !right) return null;

  const comparePoints = [
    { label: "Prompt", key: "prompt" },
    { label: "Response", key: "response" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-4 z-[100] glass p-8 flex flex-col shadow-2xl ring-1 ring-white/10"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500 rounded-lg">
            <Columns size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Scenario Comparison</h2>
            <p className="text-sm text-white/40">Comparing behavior across branches</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-8 overflow-hidden">
        {/* Left Side */}
        <div className="flex flex-col h-full space-y-6">
          <div className="flex items-center justify-between p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <span className="font-bold text-blue-400 uppercase tracking-widest text-xs">A: {left.branch_name}</span>
            <span className="text-[10px] text-white/40">{left.id.substring(0,8)}</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-6 pr-4">
             {comparePoints.map(p => (
                <div key={p.key} className="space-y-2">
                   <label className="text-[10px] uppercase font-bold text-white/40">{p.label}</label>
                   <div className="bg-black/40 p-4 rounded-xl border border-white/5 text-xs font-mono">
                      {(left as any)[p.key]}
                   </div>
                </div>
             ))}
             <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-white/40">Audit Result</label>
                <div className={`p-4 rounded-xl border flex items-center gap-3 ${left.output_audit.passed ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20"}`}>
                   {left.output_audit.passed ? <ShieldCheck className="text-green-400"/> : <ShieldAlert className="text-red-400"/>}
                   <span className="text-xs font-bold">{left.output_audit.passed ? "No Violations" : "Redacted"}</span>
                </div>
             </div>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center backdrop-blur-xl z-10">
          <ArrowRightLeft size={16} className="text-white/40" />
        </div>

        {/* Right Side */}
        <div className="flex flex-col h-full space-y-6">
          <div className="flex items-center justify-between p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
            <span className="font-bold text-purple-400 uppercase tracking-widest text-xs">B: {right.branch_name}</span>
            <span className="text-[10px] text-white/40">{right.id.substring(0,8)}</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-6 pr-4">
             {comparePoints.map(p => (
                <div key={p.key} className="space-y-2">
                   <label className="text-[10px] uppercase font-bold text-white/40">{p.label}</label>
                   <div className="bg-black/40 p-4 rounded-xl border border-white/5 text-xs font-mono">
                      {(right as any)[p.key]}
                   </div>
                </div>
             ))}
             <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-white/40">Audit Result</label>
                <div className={`p-4 rounded-xl border flex items-center gap-3 ${right.output_audit.passed ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20"}`}>
                   {right.output_audit.passed ? <ShieldCheck className="text-green-400"/> : <ShieldAlert className="text-red-400"/>}
                   <span className="text-xs font-bold">{right.output_audit.passed ? "No Violations" : "Redacted"}</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
