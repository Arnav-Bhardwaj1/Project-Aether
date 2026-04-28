"use client";

import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Cpu, Shield, Search, Zap } from "lucide-react";

interface Node {
  id: string;
  type: string;
  role?: string;
  label: string;
  status: "PENDING" | "ACTIVE" | "COMPLETED" | "ERROR";
  x: number;
  y: number;
}

interface Edge {
  from: string;
  to: string;
}

interface NexusCanvasProps {
  nodes: Node[];
  edges: Edge[];
}

const NexusCanvas: React.FC<NexusCanvasProps> = ({ nodes, edges }) => {
  const getIcon = (role?: string, type?: string) => {
    if (type === "origin") return <User size={18} />;
    switch (role) {
      case "ORCHESTRATOR": return <Zap size={18} />;
      case "RESEARCHER": return <Search size={18} />;
      case "ANALYST": return <Cpu size={18} />;
      case "VALIDATOR": return <Shield size={18} />;
      default: return <Cpu size={18} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE": return "text-cyan-400 border-cyan-500/50 bg-cyan-500/20 shadow-[0_0_20px_rgba(34,211,238,0.3)]";
      case "COMPLETED": return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
      case "ERROR": return "text-red-400 border-red-500/30 bg-red-500/10";
      default: return "text-white/20 border-white/5 bg-white/5";
    }
  };

  // SVG dimensions
  const width = 800;
  const height = 500;

  return (
    <div className="glass-panel w-full h-full relative overflow-hidden bg-[#050507]">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="relative z-10">
        <defs>
          <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(34,211,238,0.1)" />
            <stop offset="50%" stopColor="rgba(34,211,238,0.5)" />
            <stop offset="100%" stopColor="rgba(34,211,238,0.1)" />
          </linearGradient>
          
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Edges */}
        {edges.map((edge, i) => {
          const fromNode = nodes.find(n => n.id === edge.from);
          const toNode = nodes.find(n => n.id === edge.to);
          if (!fromNode || !toNode) return null;

          const isActive = fromNode.status === "ACTIVE" || toNode.status === "ACTIVE";

          return (
            <g key={`edge-${i}`}>
              <path
                d={`M ${fromNode.x} ${fromNode.y} C ${(fromNode.x + toNode.x) / 2} ${fromNode.y}, ${(fromNode.x + toNode.x) / 2} ${toNode.y}, ${toNode.x} ${toNode.y}`}
                fill="none"
                stroke={isActive ? "url(#edgeGradient)" : "rgba(255,255,255,0.05)"}
                strokeWidth={isActive ? 2 : 1}
                className="transition-all duration-1000"
              />
              {isActive && (
                <motion.circle
                  r="3"
                  fill="#22d3ee"
                  filter="url(#glow)"
                  initial={{ offsetDistance: "0%" }}
                  animate={{ offsetDistance: "100%" }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  style={{ offsetPath: `path("M ${fromNode.x} ${fromNode.y} C ${(fromNode.x + toNode.x) / 2} ${fromNode.y}, ${(fromNode.x + toNode.x) / 2} ${toNode.y}, ${toNode.x} ${toNode.y}")` }}
                />
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {nodes.map((node) => (
          <motion.g
            key={node.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="cursor-pointer"
          >
            <foreignObject x={node.x - 60} y={node.y - 40} width="120" height="80">
              <div className="flex flex-col items-center justify-center h-full">
                <div className={`p-3 rounded-2xl border transition-all duration-500 ${getStatusColor(node.status)}`}>
                  {getIcon(node.role, node.type)}
                  {node.status === "ACTIVE" && (
                    <motion.div
                      layoutId={`pulse-${node.id}`}
                      className="absolute inset-0 rounded-2xl border-2 border-cyan-400/50"
                      initial={{ scale: 1, opacity: 0.5 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </div>
                <span className={`text-[9px] font-bold mt-2 uppercase tracking-tighter ${node.status === "ACTIVE" ? "text-cyan-400" : "text-white/40"}`}>
                  {node.label}
                </span>
              </div>
            </foreignObject>
          </motion.g>
        ))}
      </svg>

      {/* Stats Overlay */}
      <div className="absolute bottom-6 left-6 flex gap-4">
        <div className="glass-panel px-3 py-1.5 flex items-center gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
           <span className="text-[10px] font-bold text-white/60 uppercase">Nodes: {nodes.length}</span>
        </div>
        <div className="glass-panel px-3 py-1.5 flex items-center gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
           <span className="text-[10px] font-bold text-white/60 uppercase">Active Streams: {edges.length}</span>
        </div>
      </div>
    </div>
  );
};

export default NexusCanvas;
