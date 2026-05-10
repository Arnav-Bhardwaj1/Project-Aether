'use client';

import React from 'react';
import { AlertTriangle, Clock, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SmartAlertsProps {
  alerts: any[];
}

export default function SmartAlerts({ alerts }: SmartAlertsProps) {
  return (
    <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
      <AnimatePresence>
        {alerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl hover:border-zinc-700 transition-all group ${
              alert.severity === 'CRITICAL' ? 'border-red-500/20 bg-red-500/[0.02]' : 'border-amber-500/20 bg-amber-500/[0.02]'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-lg ${
                  alert.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                   <h4 className="text-sm font-semibold text-zinc-200">{alert.title}</h4>
                   <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {new Date(alert.timestamp * 1000).toLocaleTimeString()}
                   </div>
                </div>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                alert.severity === 'CRITICAL' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}>
                {alert.severity}
              </span>
            </div>

            <p className="text-xs text-zinc-400 mb-3 ml-10 leading-relaxed">
              {alert.message}
            </p>

            <div className="ml-10 p-3 bg-black/40 rounded-xl border border-zinc-800/50 group-hover:border-zinc-800 transition-colors">
               <div className="text-[10px] font-bold text-zinc-500 uppercase mb-1 tracking-wider">AI Remediation Advice</div>
               <p className="text-xs text-zinc-300">{alert.advice}</p>
            </div>

            <div className="flex justify-end gap-2 mt-3">
               <button className="text-[10px] uppercase font-bold text-zinc-500 hover:text-white px-3 py-1 rounded-lg hover:bg-zinc-800 transition-colors flex items-center gap-1">
                  Mute
               </button>
               <button className="text-[10px] uppercase font-bold text-green-500 hover:text-green-400 px-3 py-1 rounded-lg hover:bg-green-500/10 transition-colors flex items-center gap-1">
                  <Check className="w-3 h-3" /> Resolve
               </button>
            </div>
          </motion.div>
        ))}
        
        {alerts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
             <Check className="w-10 h-10 mb-4 opacity-20" />
             <p className="text-sm">No active alerts. System is stable.</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
