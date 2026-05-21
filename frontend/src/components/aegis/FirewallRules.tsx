'use client';

import React, { useState } from 'react';
import { ToggleLeft, ToggleRight, Shield, RefreshCw, AlertOctagon } from 'lucide-react';
import { motion } from 'framer-motion';

interface Rule {
  id: str;
  name: str;
  type: str;
  pattern: str | null;
  value: number | null;
  severity: str;
  description: str;
  enabled: boolean;
}

interface FirewallRulesProps {
  rules: Rule[];
  onToggleRule: (ruleId: string) => Promise<void>;
  loading: boolean;
}

export default function FirewallRules({ rules, onToggleRule, loading }: FirewallRulesProps) {
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleToggle = async (ruleId: string) => {
    setTogglingId(ruleId);
    try {
      await onToggleRule(ruleId);
    } catch (e) {
      console.error(e);
    } finally {
      setTogglingId(null);
    }
  };

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-500/10 text-red-400 border border-red-500/20';
      case 'HIGH': return 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
      case 'MEDIUM': return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
      default: return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-black text-white/90">Firewall Control Center</h3>
          <p className="text-zinc-500 text-xs mt-1">Configure systemic constraints and execution shields for LLM agents.</p>
        </div>
        {loading && <RefreshCw className="animate-spin w-5 h-5 text-amber-500" />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rules.map((rule, idx) => (
          <motion.div
            key={rule.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`bg-zinc-900/40 border rounded-3xl p-6 transition-all backdrop-blur-xl relative overflow-hidden flex flex-col justify-between ${
              rule.enabled 
                ? 'border-zinc-800 hover:border-zinc-700' 
                : 'border-zinc-900/80 opacity-60'
            }`}
          >
            {/* Background design glow */}
            {rule.enabled && (
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
            )}

            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col gap-2">
                  <h4 className="font-bold text-white tracking-wide text-sm">{rule.name}</h4>
                  <div className="flex gap-2">
                    <span className={`text-[9px] font-black uppercase font-mono px-2 py-0.5 rounded ${getSeverityStyle(rule.severity)}`}>
                      {rule.severity}
                    </span>
                    <span className="text-[9px] font-bold uppercase font-mono text-zinc-500 px-2 py-0.5 rounded bg-zinc-800/40 border border-zinc-800">
                      {rule.type}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleToggle(rule.id)}
                  disabled={togglingId === rule.id}
                  className={`transition-colors focus:outline-none ${
                    togglingId === rule.id ? 'opacity-50 pointer-events-none' : ''
                  }`}
                >
                  {rule.enabled ? (
                    <ToggleRight className="w-9 h-9 text-amber-400" />
                  ) : (
                    <ToggleLeft className="w-9 h-9 text-zinc-600" />
                  )}
                </button>
              </div>

              <p className="text-xs text-zinc-400 font-medium leading-relaxed mb-6">{rule.description}</p>
            </div>

            {rule.pattern && (
              <div className="bg-zinc-950/60 border border-zinc-800/60 rounded-2xl p-3 font-mono text-[9px] text-zinc-500 overflow-x-auto whitespace-nowrap">
                <span className="text-zinc-600 font-bold uppercase mr-1">Pattern:</span>
                {rule.pattern}
              </div>
            )}

            {rule.value && (
              <div className="bg-zinc-950/60 border border-zinc-800/60 rounded-2xl p-3 font-mono text-[9px] text-zinc-500">
                <span className="text-zinc-600 font-bold uppercase mr-1">Threshold Limit:</span>
                {rule.value} {rule.type === 'RATE_LIMIT' ? 'calls / 15 seconds' : 'cycles'}
              </div>
            )}
          </motion.div>
        ))}

        {rules.length === 0 && (
          <div className="col-span-2 flex flex-col items-center justify-center py-20 border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/10">
            <AlertOctagon className="w-12 h-12 text-zinc-700 mb-3" />
            <p className="text-zinc-500 text-sm font-semibold uppercase">No Rules Configured</p>
            <p className="text-zinc-600 text-xs mt-1">Check backend initialization</p>
          </div>
        )}
      </div>
    </div>
  );
}
