"use client";

import React from "react";
import { MessageSquare, ShieldCheck, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface IntercomMessage {
  id: string;
  role: string;
  text: string;
  timestamp: number;
  violations?: any[];
}

interface NexusIntercomProps {
  messages: IntercomMessage[];
}

const NexusIntercom: React.FC<NexusIntercomProps> = ({ messages }) => {
  return (
    <div className="glass-panel flex flex-col h-full bg-[#050507]/60">
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquare size={16} className="text-cyan-400" />
          <h3 className="text-xs font-bold text-white/80 uppercase tracking-widest">Inter-Agent Intercom</h3>
        </div>
        <div className="flex items-center gap-1.5">
           <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
           <span className="text-[9px] font-bold text-white/20 uppercase">Encrypted Stream</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {messages.map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-1 h-3 rounded-full ${msg.violations?.length ? 'bg-red-500' : 'bg-cyan-500/50'}`} />
                <span className="text-[10px] font-black text-white/40 uppercase tracking-tighter">{msg.role}</span>
                <span className="text-[8px] font-mono text-white/10 ml-auto">{new Date(msg.timestamp * 1000).toLocaleTimeString()}</span>
              </div>
              
              <div className="pl-4 border-l border-white/5">
                <p className="text-[11px] leading-relaxed text-white/60 group-hover:text-white/80 transition-colors">
                  {msg.text}
                </p>
                
                {msg.violations && msg.violations.length > 0 && (
                  <div className="mt-2 p-2 rounded bg-red-500/5 border border-red-500/10 flex items-center gap-2">
                    <AlertCircle size={10} className="text-red-400" />
                    <span className="text-[9px] font-bold text-red-400/80 uppercase">The Sentry intercepted {msg.violations.length} policy violations.</span>
                  </div>
                )}
                
                {!msg.violations?.length && (
                   <div className="mt-2 flex items-center gap-1.5 opacity-30">
                      <ShieldCheck size={10} className="text-emerald-400" />
                      <span className="text-[8px] font-bold text-white uppercase tracking-tighter">Sentry Verified</span>
                   </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center flex-col opacity-[0.05]">
             <MessageSquare size={48} className="mb-4" />
             <p className="text-[10px] font-bold uppercase tracking-[0.3em]">Quiet Channel</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NexusIntercom;
