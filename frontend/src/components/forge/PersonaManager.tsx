"use client";

import React, { useState } from "react";
import { User, ShieldCheck, ShieldAlert, Zap, Settings } from "lucide-react";
import { motion } from "framer-motion";

const PersonaManager = () => {
  const [activePersona, setActivePersona] = useState("standard");

  const personas = [
    { 
        id: "relaxed", 
        name: "Relaxed", 
        icon: Zap, 
        desc: "Minimal filtering, low latency.", 
        color: "text-blue-400",
        stats: { throughput: "98%", security: "45%" }
    },
    { 
        id: "standard", 
        name: "Standard", 
        icon: ShieldCheck, 
        desc: "Balanced safety and performance.", 
        color: "text-emerald-400",
        stats: { throughput: "90%", security: "85%" }
    },
    { 
        id: "paranoid", 
        name: "Paranoid", 
        icon: ShieldAlert, 
        desc: "Aggressive filtering, high security.", 
        color: "text-orange-400",
        stats: { throughput: "65%", security: "99%" }
    }
  ];

  return (
    <div className="glass-panel p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-bold text-white/90">Persona Orchestrator</h3>
          <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Security Profiles</p>
        </div>
        <Settings size={14} className="text-white/20" />
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2">
        {personas.map((p) => (
          <motion.button
            key={p.id}
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActivePersona(p.id)}
            className={`w-full text-left p-4 rounded-xl border transition-all relative overflow-hidden group ${
              activePersona === p.id 
                ? "bg-white/5 border-orange-500/30" 
                : "bg-white/2 border-white/5 hover:border-white/10"
            }`}
          >
            {activePersona === p.id && (
                <motion.div 
                    layoutId="active-bg"
                    className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent pointer-events-none" 
                />
            )}
            
            <div className="flex gap-4 relative z-10">
              <div className={`p-2 rounded-lg bg-black/20 border border-white/5 ${p.color}`}>
                <p.icon size={18} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${activePersona === p.id ? "text-white" : "text-white/60"}`}>
                    {p.name}
                  </span>
                  <span className="text-[9px] font-bold text-white/20 uppercase tracking-tighter">Profile Active</span>
                </div>
                <p className="text-[10px] text-white/30 mt-0.5 line-clamp-1">{p.desc}</p>
                
                <div className="mt-3 grid grid-cols-2 gap-4">
                    <div>
                        <div className="flex justify-between text-[8px] font-bold uppercase text-white/20 mb-1">
                            <span>Throughput</span>
                            <span>{p.stats.throughput}</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: p.stats.throughput }}
                                className="h-full bg-blue-500/50" 
                            />
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-[8px] font-bold uppercase text-white/20 mb-1">
                            <span>Security</span>
                            <span>{p.stats.security}</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: p.stats.security }}
                                className={`h-full ${p.id === 'paranoid' ? 'bg-orange-500/50' : 'bg-emerald-500/50'}`} 
                            />
                        </div>
                    </div>
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      <div className="mt-6 p-3 rounded-lg bg-orange-500/5 border border-orange-500/10 flex items-center gap-3">
        <User size={14} className="text-orange-500" />
        <p className="text-[9px] text-orange-400/80 font-bold leading-tight">
          System applying {activePersona.toUpperCase()} governance policies to all incoming traffic.
        </p>
      </div>
    </div>
  );
};

export default PersonaManager;
