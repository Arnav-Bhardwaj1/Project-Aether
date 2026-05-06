'use client';

import React from 'react';
import { AlertCircle, Clock, Shield, Database, Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

interface ViolationFeedProps {
  violations: any[];
}

export default function ViolationFeed({ violations }: ViolationFeedProps) {
  const sortedViolations = [...violations].reverse();

  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl overflow-hidden backdrop-blur-sm">
      <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-black/20">
        <div className="flex items-center gap-3">
          <Database className="w-5 h-5 text-blue-500" />
          <h3 className="font-semibold">Compliance Audit Log</h3>
        </div>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-white transition-colors">
            <Filter className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-white transition-colors">
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-zinc-500 text-xs uppercase tracking-wider border-b border-zinc-800">
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Violation</th>
              <th className="px-6 py-4 font-medium">Policy Layer</th>
              <th className="px-6 py-4 font-medium">Severity</th>
              <th className="px-6 py-4 font-medium">Timestamp</th>
              <th className="px-6 py-4 font-medium text-right">Context</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {sortedViolations.map((v, i) => (
              <motion.tr 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="hover:bg-white/[0.02] transition-colors group"
              >
                <td className="px-6 py-4">
                  <div className={`w-2 h-2 rounded-full ${
                    v.severity === 'CRITICAL' ? 'bg-red-500' : 'bg-amber-500'
                  }`} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-zinc-200">{v.rule_name}</span>
                    <span className="text-[11px] text-zinc-500 max-w-[300px] truncate">{v.message}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs text-zinc-400 font-mono">{v.policy_id}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    v.severity === 'CRITICAL' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    v.severity === 'HIGH' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  }`}>
                    {v.severity}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-zinc-500 text-xs">
                    <Clock className="w-3 h-3" />
                    {new Date(v.timestamp * 1000).toLocaleTimeString()}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-xs text-zinc-500 group-hover:text-blue-400 transition-colors cursor-pointer">
                    {v.context}
                  </span>
                </td>
              </motion.tr>
            ))}
            {sortedViolations.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center text-zinc-500 italic">
                  No policy violations recorded. Citadel Shield is at 100% integrity.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
