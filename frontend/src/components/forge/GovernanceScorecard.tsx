"use client";

import React from "react";
import { Shield, AlertTriangle, Lock, Activity } from "lucide-react";
import { motion } from "framer-motion";

interface ScorecardProps {
  report: {
    score: number;
    status: string;
    metrics: {
      total_interactions: number;
      blocked_attempts: number;
      redacted_outputs: number;
    };
  } | null;
}

const GovernanceScorecard: React.FC<ScorecardProps> = ({ report }) => {
  if (!report) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SECURE": return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
      case "ELEVATED": return "text-yellow-400 border-yellow-500/30 bg-yellow-500/10";
      case "WARNING": return "text-orange-400 border-orange-500/30 bg-orange-500/10";
      case "CRITICAL": return "text-red-400 border-red-500/30 bg-red-500/10";
      default: return "text-white/40 border-white/10 bg-white/5";
    }
  };

  return (
    <div className="grid grid-cols-4 gap-4">
      {/* Risk Index Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="col-span-1 glass-panel p-4 flex flex-col items-center justify-center text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-50"></div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-2">Governance Risk Index</span>
        <div className={`text-4xl font-black mb-1 ${report.score > 50 ? "text-orange-500" : "text-emerald-500"}`}>
          {report.score}%
        </div>
        <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(report.status)}`}>
          {report.status}
        </div>
      </motion.div>

      {/* Metrics Cards */}
      {[
        { label: "Total Probes", value: report.metrics.total_interactions, icon: Activity, color: "text-blue-400" },
        { label: "Blocked Attacks", value: report.metrics.blocked_attempts, icon: Shield, color: "text-emerald-400" },
        { label: "Policy Redactions", value: report.metrics.redacted_outputs, icon: Lock, color: "text-purple-400" }
      ].map((m, i) => (
        <motion.div 
          key={m.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 * (i + 1) }}
          className="glass-panel p-4 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">{m.label}</span>
            <m.icon size={14} className={m.color} />
          </div>
          <div className="text-2xl font-bold mt-2 font-mono">{m.value}</div>
        </motion.div>
      ))}
    </div>
  );
};

export default GovernanceScorecard;
