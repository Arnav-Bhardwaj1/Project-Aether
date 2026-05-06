'use client';

import React, { useState } from 'react';
import { ToggleLeft, ToggleRight, Lock, ShieldCheck, AlertOctagon, Info } from 'lucide-react';
import { motion } from 'framer-motion';

interface PolicyGridProps {
  policies: any[];
}

export default function PolicyGrid({ policies }: PolicyGridProps) {
  const [localPolicies, setLocalPolicies] = useState(policies);

  const togglePolicy = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/citadel/policies/${id}/toggle`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        setLocalPolicies(prev => prev.map(p => 
          p.id === id ? { ...p, active: data.active } : p
        ));
      }
    } catch (err) {
      console.error("Toggle failed", err);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      {localPolicies.map((policy, idx) => (
        <motion.div
          key={policy.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: idx * 0.1 }}
          className={`relative overflow-hidden bg-zinc-900/40 border ${
            policy.active ? 'border-zinc-800' : 'border-zinc-800/50 grayscale opacity-60'
          } rounded-3xl p-8 backdrop-blur-xl group hover:border-zinc-700 transition-all`}
        >
          {/* Status Indicator */}
          <div className="flex justify-between items-start mb-6">
            <div className={`p-3 rounded-2xl ${
              policy.active ? 'bg-blue-500/10 text-blue-400' : 'bg-zinc-800 text-zinc-500'
            }`}>
              <ShieldCheck className="w-6 h-6" />
            </div>
            <button 
              onClick={() => togglePolicy(policy.id)}
              className="focus:outline-none"
            >
              {policy.active ? (
                <ToggleRight className="w-10 h-10 text-blue-500" />
              ) : (
                <ToggleLeft className="w-10 h-10 text-zinc-600" />
              )}
            </button>
          </div>

          <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">
            {policy.name}
          </h3>
          <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
            Protecting your agentic workflows with industry-standard compliance guardrails.
          </p>

          <div className="space-y-3">
            <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Ruleset</div>
            {policy.rules.map((rule: any) => (
              <div key={rule.id} className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-zinc-800/50 group/rule">
                <div className="flex items-center gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    rule.severity === 'CRITICAL' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 
                    rule.severity === 'HIGH' ? 'bg-amber-500' : 'bg-blue-500'
                  }`} />
                  <div>
                    <div className="text-xs font-medium text-zinc-200">{rule.name}</div>
                    <div className="text-[10px] text-zinc-500">{rule.type}</div>
                  </div>
                </div>
                <div className="opacity-0 group-hover/rule:opacity-100 transition-opacity">
                  <Info className="w-3.5 h-3.5 text-zinc-600 cursor-help" title={rule.description} />
                </div>
              </div>
            ))}
          </div>

          {/* Background Decoration */}
          <div className="absolute -right-8 -bottom-8 opacity-[0.03] pointer-events-none group-hover:opacity-[0.06] transition-opacity">
            <Lock className="w-40 h-40" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
