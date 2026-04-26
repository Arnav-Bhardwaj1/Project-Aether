"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  GitBranch, 
  Clock, 
  ShieldAlert, 
  ShieldCheck, 
  Circle,
  Maximize2
} from "lucide-react";
import { Snapshot } from "../hooks/useFlux";

interface FluxTimelineProps {
  snapshots: Snapshot[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onBranch: (id: string) => void;
}

export default function FluxTimeline({ 
  snapshots, 
  activeId, 
  onSelect, 
  onBranch 
}: FluxTimelineProps) {
  // Simple layout calculation
  const layout = useMemo(() => {
    if (snapshots.length === 0) return { nodes: [], edges: [] };

    const nodes: any[] = [];
    const edges: any[] = [];
    const depthMap: Record<number, number> = {}; // depth -> count
    const nodeMap: Record<string, any> = {};

    // Build hierarchy
    const tree: Record<string, string[]> = {};
    const roots: string[] = [];
    
    snapshots.forEach(s => {
      if (!s.parent_id) {
        roots.push(s.id);
      } else {
        if (!tree[s.parent_id]) tree[s.parent_id] = [];
        tree[s.parent_id].push(s.id);
      }
    });

    const traverse = (id: string, depth: number, parentPos?: { x: number, y: number }) => {
      if (!depthMap[depth]) depthMap[depth] = 0;
      
      const x = depth * 280 + 100;
      const y = depthMap[depth] * 120 + 100;
      depthMap[depth]++;

      const node = {
        id,
        x,
        y,
        snapshot: snapshots.find(s => s.id === id)!
      };
      nodes.push(node);
      nodeMap[id] = node;

      if (parentPos) {
        edges.push({
          id: `e-${id}`,
          from: parentPos,
          to: { x, y },
          isActive: activeId === id || activeId === node.snapshot.parent_id
        });
      }

      if (tree[id]) {
        tree[id].forEach(childId => traverse(childId, depth + 1, { x, y }));
      }
    };

    roots.forEach(rootId => traverse(rootId, 0));

    return { nodes, edges };
  }, [snapshots, activeId]);

  return (
    <div className="h-full glass relative overflow-hidden group">
      <div className="absolute top-4 left-6 z-20">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <GitBranch className="text-purple-400" size={20} />
          Temporal Flux Tree
        </h3>
        <p className="text-xs text-white/40">Multi-scenario execution history</p>
      </div>

      <div className="absolute top-4 right-6 z-20 flex gap-2">
         <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px]">
            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
            Main Branch
         </div>
         <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px]">
            <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]"></div>
            Experimental
         </div>
      </div>

      <div className="w-full h-full overflow-auto p-20 cursor-grab active:cursor-grabbing">
        <svg className="absolute inset-0 pointer-events-none w-[2000px] h-[1000px]">
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          {layout.edges.map(edge => {
            const dx = edge.to.x - edge.from.x;
            const path = `M ${edge.from.x} ${edge.from.y} C ${edge.from.x + dx/2} ${edge.from.y}, ${edge.from.x + dx/2} ${edge.to.y}, ${edge.to.x} ${edge.to.y}`;
            return (
              <motion.path
                key={edge.id}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                d={path}
                className={`flux-edge-path ${edge.isActive ? "active animate-flow" : ""}`}
              />
            );
          })}
        </svg>

        <div className="relative w-[2000px] h-[1000px]">
          {layout.nodes.map(node => (
            <motion.div
              key={node.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{ left: node.x - 30, top: node.y - 30 }}
              className={`
                absolute w-16 h-16 rounded-2xl flex items-center justify-center cursor-pointer flux-node border
                ${activeId === node.id ? "border-blue-500 bg-blue-500/20 active shadow-[0_0_30px_rgba(59,130,246,0.3)]" : "border-white/10 bg-white/5"}
                ${node.snapshot.branch_name !== "Main" ? "border-purple-500/50" : ""}
              `}
              onClick={() => onSelect(node.id)}
            >
              <div className="flex flex-col items-center">
                 {node.snapshot.input_audit.passed && node.snapshot.output_audit.passed ? (
                    <ShieldCheck size={20} className="text-green-400" />
                 ) : (
                    <ShieldAlert size={20} className="text-red-400" />
                 )}
                 <span className="text-[8px] mt-1 text-white/40 font-mono">
                    {node.id.substring(0, 4)}
                 </span>
              </div>

              {/* Tooltip on hover */}
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap bg-black/80 backdrop-blur-md px-3 py-1 rounded text-[10px] border border-white/10 z-50">
                 {node.snapshot.branch_name}: {node.snapshot.prompt.substring(0, 20)}...
              </div>

              {/* Branching Trigger */}
              <button 
                onClick={(e) => { e.stopPropagation(); onBranch(node.id); }}
                className="absolute -right-2 -top-2 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
              >
                <GitBranch size={12} className="text-white" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
      
      <div className="absolute bottom-6 right-6 flex items-center gap-4 text-[10px] text-white/40">
         <span className="flex items-center gap-1"><Clock size={12}/> Right-click node to fork</span>
         <span className="flex items-center gap-1"><Maximize2 size={12}/> Scroll to zoom</span>
      </div>
    </div>
  );
}
