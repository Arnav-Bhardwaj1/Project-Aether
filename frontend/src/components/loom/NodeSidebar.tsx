'use client';

import React from 'react';
import { Shield, BrainCircuit, Volume2, Cpu, Terminal, ArrowRight, Save } from 'lucide-react';

export default function NodeSidebar() {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const nodeLibrary = [
    { type: 'Input', label: 'Input Node', desc: 'Starting prompt triggers.', icon: <Terminal className="text-zinc-400" size={16} /> },
    { type: 'Citadel', label: 'Citadel Check', desc: 'Compliance & safe logs.', icon: <Shield className="text-emerald-400" size={16} /> },
    { type: 'Cortex', label: 'Cortex Memory', desc: 'Semantic triplet index.', icon: <BrainCircuit className="text-indigo-400" size={16} /> },
    { type: 'Echo', label: 'Echo Few-Shot', desc: 'RLHF exemplars filter.', icon: <Volume2 className="text-emerald-400" size={16} /> },
    { type: 'LLM', label: 'Gemini LLM', desc: 'Core logic generator.', icon: <Cpu className="text-indigo-400" size={16} /> },
    { type: 'Mirror', label: 'Sandbox File', desc: 'Writes sandbox nodes.', icon: <Save className="text-zinc-400" size={16} /> },
    { type: 'Output', label: 'Output Port', desc: 'Terminal collection.', icon: <ArrowRight className="text-zinc-400" size={16} /> }
  ];

  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-4 backdrop-blur-xl h-[680px] flex flex-col space-y-6">
      <div>
        <h3 className="text-sm font-bold text-zinc-200 tracking-tight uppercase tracking-widest block mb-1">Node Library</h3>
        <p className="text-[10px] text-zinc-500 leading-tight">Drag nodes onto the canvas workspace to build visual pipeline chains.</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
        {nodeLibrary.map((item) => (
          <div
            key={item.type}
            onDragStart={(e) => onDragStart(e, item.type)}
            draggable
            className="p-3 bg-black/40 border border-zinc-800/80 hover:border-zinc-700/80 rounded-2xl cursor-grab active:cursor-grabbing transition-all space-y-1 select-none flex items-start gap-3 group"
          >
            <div className="p-2 bg-zinc-900 border border-zinc-850 rounded-xl group-hover:border-zinc-700 transition-colors shrink-0">
              {item.icon}
            </div>
            
            <div className="min-w-0 space-y-0.5">
              <span className="text-xs font-bold text-zinc-200 block group-hover:text-white transition-colors">{item.label}</span>
              <span className="text-[9px] text-zinc-500 block leading-tight">{item.desc}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-zinc-850 pt-4 text-center">
        <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest leading-none block">Aether Engine v1.0</span>
      </div>
    </div>
  );
}
